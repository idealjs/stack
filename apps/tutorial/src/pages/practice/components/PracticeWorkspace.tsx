/** 练习场工作区：说明条 + 任务卡 + 创建项目板块，纵向单列；
 * 陪练 agent 收进右下角的 CoachSticky 便签浮层（不同任务的开场提示词来自任务库 opener 字段）。
 * 当前为「无运行时」形态：对话直连 LLM（llm.ts），代码执行运行时待 ESM + MCP 接入——
 * 工作卡（预览/终端/文件树）与 agent 工具循环归档于 exp/vivari-playground 分支，接回时恢复即可。
 * 本组件树在 renderToString 下必须无 window 访问——副作用都在 effect/handler 里。 */
import { useMemo, useRef, useState } from 'react'
import { ClipboardChecklist, FolderTabs, TaskEnvelope } from '@stack/design-system'
import type { ChatMessage, LlmConfig } from '../lib/agent/llm'
import { hasKey, loadLlmConfig, saveLlmConfig } from '../lib/agent/llm'
import { runAgentTurn, systemPrompt } from '../lib/agent/loop'
import { taskFromLocation, taskMarkdown } from '../lib/tasks'
import { CREATE_PROJECT_EXAMPLES, CREATE_PROJECT_INTRO, CREATE_PROJECT_NOTE } from '../lib/prompts'
import { ChatPanel } from './ChatPanel'
import type { ChatItem } from './ChatPanel'
import { CoachSticky } from './CoachSticky'
import { KeyModal } from './KeyModal'
import { PromptStrip } from './PromptStrip'

/** 流式文本追加到最后一条 assistant 消息 */
function appendAssistant(items: ChatItem[], delta: string): ChatItem[] {
  const next = items.slice()
  const last = next[next.length - 1]
  if (last && last.kind === 'assistant') next[next.length - 1] = { ...last, text: last.text + delta }
  else next.push({ kind: 'assistant', text: delta })
  return next
}

export function PracticeWorkspace() {
  const task = useMemo(taskFromLocation, [])

  const abortRef = useRef<AbortController | null>(null)
  const historyRef = useRef<ChatMessage[]>([])

  const [busy, setBusy] = useState(false)
  const [llm, setLlm] = useState<LlmConfig>(loadLlmConfig)
  const [keyOpen, setKeyOpen] = useState(false)
  const [chat, setChat] = useState<ChatItem[]>(() => [
    {
      kind: 'assistant',
      text: `我是这个练习场的陪练 agent，就住在右下角这枚便签里。当前任务「${task.title}」——代码执行运行时还在重建，先跟我聊：讲思路、要代码片段、贴报错都可以；你负责动手和逐条对照验收清单。`,
    },
  ])

  const send = (text: string) => {
    if (busy) return
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
      history: historyRef.current,
      userText: text,
      signal: abort.signal,
      hooks: {
        onAssistantDelta: (delta) => setChat((c) => appendAssistant(c, delta)),
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

  /** 开场提示词条：展开便签时显示在输入区上方，「发给陪练」直接走现有 send()（嵌便签内，flat 无投影） */
  const openerNotice = (
    <PromptStrip
      testId="coach-opener"
      title="开场提示词 · 一键开工"
      text={task.opener}
      onSend={send}
      disabled={false}
      busy={busy}
      flat
    />
  )

  return (
    <div className="flex flex-col gap-4 pb-24" suppressHydrationWarning>
      {/* 说明条：代码执行运行时未接入，页面其余能力照常 */}
      <div className="rounded-lg border-2 border-dashed border-ink/30 bg-paper-deep px-3 py-2 text-[12.5px] leading-5 text-body">
        代码执行运行时未接入（ESM + MCP 规划中）——下面的任务卡、创建示例与右下角的陪练对话照常可用；
        要真正跑代码，先走本地路线。
      </div>

      {/* 任务卡：信封（任务正文）+ 夹板（验收清单） */}
      <section className="grid gap-4">
        <TaskEnvelope
          title={`练习任务 · ${task.title}`}
          summary={`${task.expectation.split('。')[0]}。`}
          recipient="你的 Agent"
        >
          <p className="m-0">
            下面是任务的 <b>TASK.md</b> 原文——给 agent 的任务简报与页面展示始终同源。
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-mono">{taskMarkdown(task)}</pre>
        </TaskEnvelope>

        <ClipboardChecklist
          title="完成后逐条核对"
          description="跟着任务说明动手，逐条自查确认；全部勾选即盖章。"
          items={task.acceptance.map((label) => ({ id: label, label }))}
        />
      </section>

      {/* 创建项目：任务卡之后——完成自我介绍卡，下一步学自己从零建项目。
          三条示例提示词用 FolderTabs 翻页（基础/进阶/对照），文案与句子都来自 lib/prompts 单一来源 */}
      <section data-testid="create-project" className="grid gap-2.5">
        <h2 className="m-0 flex flex-wrap items-baseline gap-2">
          <span className="t-small-strong">创建项目</span>
          <i className="t-small-mute not-italic">{CREATE_PROJECT_NOTE}</i>
        </h2>
        <p className="m-0 text-[13.5px] leading-6 text-body">
          {CREATE_PROJECT_INTRO.map((seg, i) => (typeof seg === 'string' ? seg : <b key={i}>{seg.b}</b>))}
        </p>
        <FolderTabs
          label="创建项目 · 示例提示词"
          tabs={CREATE_PROJECT_EXAMPLES.map((example) => ({
            id: example.id,
            label: example.tab,
            content: (
              <div className="grid gap-2.5">
                <p className="t-small-mute m-0">{example.hint}</p>
                <PromptStrip
                  testId={`create-prompt-${example.id}`}
                  title={example.title}
                  text={example.text}
                  onSend={send}
                  busy={busy}
                />
              </div>
            ),
          }))}
        />
      </section>

      {/* 陪练 agent 便签：右下角浮层（页面级 fixed） */}
      <CoachSticky taskLabel={task.label}>
        <ChatPanel
          items={chat}
          busy={busy}
          ready
          hasKey={hasKey(llm)}
          model={llm.model}
          onSend={send}
          onStop={stop}
          onOpenKey={() => setKeyOpen(true)}
          notice={openerNotice}
          flat
        />
      </CoachSticky>

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
