/** 练习场工作区：左＝预览/终端 + 只读文件树，右＝陪练 agent 对话。
 * SSG 首屏＝静态壳（状态条 + 占位）；WebContainer boot、agent 循环全部浏览器端。
 * 本组件树在 renderToString 下必须无 window 访问——副作用都在 effect/handler 里。 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WebContainer } from '@webcontainer/api'
import type { ChatMessage, LlmConfig } from '../lib/agent/llm'
import { hasKey, loadLlmConfig, saveLlmConfig } from '../lib/agent/llm'
import { runAgentTurn, systemPrompt } from '../lib/agent/loop'
import { scanFiles, startPracticeEnv } from '../lib/webcontainer'
import type { FileEntry, OutputSink } from '../lib/webcontainer'
import { taskFromLocation } from '../lib/tasks'
import { ChatPanel } from './ChatPanel'
import type { ChatItem } from './ChatPanel'
import { FileTree } from './FileTree'
import { KeyModal } from './KeyModal'
import { PreviewPanel } from './PreviewPanel'
import { TerminalPanel } from './TerminalPanel'

type Status = { kind: 'booting' | 'ready' | 'error'; message?: string }

/** 流式文本追加到最后一条 assistant 消息 */
function appendAssistant(items: ChatItem[], delta: string): ChatItem[] {
  const next = items.slice()
  const last = next[next.length - 1]
  if (last && last.kind === 'assistant') next[next.length - 1] = { ...last, text: last.text + delta }
  else next.push({ kind: 'assistant', text: delta })
  return next
}

/** 最后一条工具状态行由 ⚙ 改为 ✓ */
function markToolDone(items: ChatItem[]): ChatItem[] {
  const next = items.slice()
  for (let i = next.length - 1; i >= 0; i--) {
    if (next[i].kind === 'tool') {
      next[i] = { ...next[i], text: `✓ ${next[i].text.slice(2)}` }
      break
    }
  }
  return next
}

const TABS = [
  { key: 'preview', label: '预览' },
  { key: 'terminal', label: '终端' },
] as const

export function PracticeWorkspace() {
  const task = useMemo(taskFromLocation, [])

  const sinkRef = useRef<OutputSink | null>(null)
  /** 终端未挂载时的输出缓冲（tab 切走/挂载前不丢日志），挂载时整段回放 */
  const logRef = useRef<string[]>([])
  const wcRef = useRef<WebContainer | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const historyRef = useRef<ChatMessage[]>([])

  const [status, setStatus] = useState<Status>({ kind: 'booting' })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [entries, setEntries] = useState<FileEntry[] | null>(null)
  const [tab, setTab] = useState<'preview' | 'terminal'>('terminal')
  const [busy, setBusy] = useState(false)
  const [llm, setLlm] = useState<LlmConfig>(loadLlmConfig)
  const [keyOpen, setKeyOpen] = useState(false)
  const [chat, setChat] = useState<ChatItem[]>(() => [
    {
      kind: 'assistant',
      text: `我是这个练习场的陪练 agent。当前任务「${task.title}」——把想改成什么样告诉我，我来写代码；你负责看预览、逐条对照验收清单。`,
    },
  ])

  // 拉起练习环境（含模板 mount、npm install、dev server）；task 变化才重启
  useEffect(() => {
    let cancelled = false
    const sink: OutputSink = (chunk) => {
      logRef.current.push(chunk)
      if (logRef.current.length > 4096) logRef.current.splice(0, logRef.current.length - 4096)
      sinkRef.current?.(chunk)
    }
    startPracticeEnv(task.files, sink)
      .then(async (env) => {
        if (cancelled) return
        wcRef.current = env.wc
        env.previewUrl.then((url) => {
          if (cancelled) return
          setPreviewUrl(url)
          setTab('preview') // 预览就绪，把用户视线从安装日志切到页面
        })
        setStatus({ kind: 'ready' })
        setEntries(await scanFiles(env.wc))
      })
      .catch((e) => {
        if (!cancelled) setStatus({ kind: 'error', message: (e as Error).message })
      })
    return () => {
      cancelled = true
    }
  }, [task])

  const send = (text: string) => {
    const wc = wcRef.current
    if (!wc || busy) return
    if (!hasKey(llm)) {
      setKeyOpen(true)
      return
    }
    if (historyRef.current.length === 0) historyRef.current.push({ role: 'system', content: systemPrompt(task) })

    setChat((c) => [...c, { kind: 'user', text }, { kind: 'assistant', text: '' }])
    setBusy(true)
    const abort = new AbortController()
    abortRef.current = abort

    runAgentTurn({
      config: llm,
      wc,
      history: historyRef.current,
      userText: text,
      signal: abort.signal,
      hooks: {
        onAssistantDelta: (delta) => setChat((c) => appendAssistant(c, delta)),
        onToolCall: (name, args) => {
          const detail =
            typeof args.path === 'string' ? args.path : typeof args.command === 'string' ? args.command : ''
          setChat((c) => [...c, { kind: 'tool', text: `⚙ ${name} ${detail}`.trim() }])
        },
        onToolResult: (name) => {
          setChat(markToolDone)
          if (name === 'write_file') scanFiles(wc).then((es) => setEntries(es))
        },
        onCommandChunk: (chunk) => sinkRef.current?.(chunk),
      },
    })
      .catch((e) => {
        const message = abort.signal.aborted ? '（已停止。）' : `⚠ 出错了：${(e as Error).message}`
        setChat((c) => [...c, { kind: 'assistant', text: message }])
      })
      .finally(() => {
        setBusy(false)
        abortRef.current = null
      })
  }

  const stop = () => abortRef.current?.abort()

  const statusLabel =
    status.kind === 'booting'
      ? '环境启动中（boot → 装依赖 → dev server，首次约 1-2 分钟）…'
      : status.kind === 'ready'
        ? '环境就绪'
        : '启动失败'

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]" suppressHydrationWarning>
      {/* 状态条：横跨两列独占一行，左右两张工作卡同行起步、顶部对齐 */}
      <div className="flex items-center gap-2 lg:col-span-2">
        <span
          className={`inline-block size-2.5 rounded-full border border-ink ${
            status.kind === 'error' ? 'bg-clash1a' : status.kind === 'ready' ? 'bg-clash1b' : 'bg-clash2a'
          }`}
        />
        <span className={status.kind === 'error' ? 'text-[13px] font-bold text-clash1a' : 't-small-mute'}>
          {statusLabel}
        </span>
        <span className="t-small-mute font-mono">· {task.label}</span>
        {status.kind === 'error' && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-lg border-2 border-ink bg-paper px-2 py-0.5 text-[12px] font-bold transition-colors hover:bg-paper-deep"
          >
            重试
          </button>
        )}
      </div>

      {/* 左列：工作区卡（tab 面板 + 文件树） + 任务卡 */}
      <section className="min-w-0">
        {status.kind === 'error' ? (
          <div className="rounded-xl border-2 border-ink bg-paper p-4 shadow-hard">
            <p className="m-0 text-[13.5px] leading-6 text-body">{status.message}</p>
          </div>
        ) : (
          <div className="flex h-[540px] flex-col overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-hard">
            <div className="flex gap-1.5 border-b border-dashed border-ink/20 p-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-[12.5px] font-bold transition-colors ${
                    tab === t.key
                      ? 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]'
                      : 'text-body hover:bg-paper-deep'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex min-h-0 flex-1">
              <div className="min-w-0 flex-1">
                {tab === 'preview' ? <PreviewPanel url={previewUrl} /> : <TerminalPanel sinkRef={sinkRef} logRef={logRef} />}
              </div>
              <div className="w-44 shrink-0 border-l border-dashed border-ink/20">
                <FileTree entries={entries} />
              </div>
            </div>
          </div>
        )}

        {/* 任务卡：场景 / 预期 / 验收 */}
        <div className="mt-4 rounded-xl border-2 border-ink bg-paper p-4 shadow-hard">
          <h2 className="m-0 text-t3 font-extrabold text-ink">练习任务 · {task.title}</h2>
          <p className="mt-2 mb-0 text-[13.5px] leading-6 text-body">{task.scene}</p>
          <p className="mt-2 mb-0 text-[13.5px] leading-6 text-body">{task.expectation}</p>
          <p className="t-small-strong mt-3 mb-1">验收清单</p>
          <ul className="m-0 list-disc pl-5 text-[13.5px] leading-6 text-body">
            {task.acceptance.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 右列：陪练 agent */}
      <section className="min-h-[540px] lg:h-[540px]">
        <ChatPanel
          items={chat}
          busy={busy}
          ready={status.kind === 'ready'}
          hasKey={hasKey(llm)}
          model={llm.model}
          onSend={send}
          onStop={stop}
          onOpenKey={() => setKeyOpen(true)}
        />
      </section>

      {keyOpen && (
        <KeyModal
          config={llm}
          onClose={() => setKeyOpen(false)}
          onSave={(config) => {
            saveLlmConfig(config)
            setLlm(config)
            setKeyOpen(false)
          }}
        />
      )}
    </div>
  )
}
