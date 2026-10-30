import { useMemo, useRef, useState } from 'react'
import type { DataFlowStep } from '../../../design-system'
import { ClipboardChecklist, DataFlowBoard } from '../../../design-system'
import { TEMPLATE_FILES } from '../../../lib/templateFiles'
import {
  CodeEditor,
  FileTabs,
  OutputView,
  PlaygroundProvider,
  RunRow,
  SandboxFrame,
  StatusLine,
  usePlayground,
} from '../../../playground'
import type { ChatMessage, LlmConfig } from '../lib/agent/llm'
import { hasKey, loadLlmConfig, saveLlmConfig } from '../lib/agent/llm'
import { runAgentTurn, systemPrompt } from '../lib/agent/loop'
import { CREATE_PROJECT_EXAMPLES, CREATE_PROJECT_INTRO, CREATE_PROJECT_NOTE } from '../lib/prompts'
import { taskFromLocation } from '../lib/tasks'
import type { ChatItem } from './ChatPanel'
import { ChatPanel } from './ChatPanel'
import { ChecklistDock } from './ChecklistDock'
import { DockSticky } from './DockSticky'
import { KeyModal } from './KeyModal'

const FLOW_TONES = ['coral', 'teal', 'blue'] as const

type DockPane = 'agent' | 'checklist' | null

function appendAssistant(items: ChatItem[], delta: string): ChatItem[] {
  const next = items.slice()
  const last = next[next.length - 1]
  if (last && last.kind === 'assistant')
    next[next.length - 1] = { ...last, text: last.text + delta }
  else next.push({ kind: 'assistant', text: delta })
  return next
}

function RunnerStage() {
  const { preview } = usePlayground()
  return (
    <div className="relative h-[280px] overflow-hidden rounded-lg border-2 border-ink bg-white">
      <SandboxFrame fill />
      {!preview && (
        <div className="pointer-events-none absolute inset-0 grid place-content-center gap-1 p-4 text-center">
          <p className="t-small-strong m-0">沙箱预览</p>
          <p className="t-small-mute m-0">在下方编辑器点「运行 ▶」，构建产物会送进这里真跑。</p>
        </div>
      )}
    </div>
  )
}

export function PracticeWorkspace() {
  const task = useMemo(taskFromLocation, [])

  const abortRef = useRef<AbortController | null>(null)
  const historyRef = useRef<ChatMessage[]>([])

  const [busy, setBusy] = useState(false)
  const [llm, setLlm] = useState<LlmConfig>(loadLlmConfig)
  const [keyOpen, setKeyOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [focusSignal, setFocusSignal] = useState(0)
  const [openDock, setOpenDock] = useState<DockPane>(null)
  const [checkedIds, setCheckedIds] = useState<readonly string[]>([])
  const [chat, setChat] = useState<ChatItem[]>(() => [
    {
      kind: 'assistant',
      text: `我是这个练习场的陪练 agent，收在右下角贴签里。当前任务「${task.title}」——点右侧「操作流水线」的任意一步，提示词会自动填进输入框，回车就能发给我；也可以直接聊思路、要代码、贴报错。代码写进左侧编辑器，点「运行 ▶」在沙箱里真跑；验收清单夹在页面右上角，做完拉出来逐条打勾。`,
    },
  ])

  const send = (text: string) => {
    if (busy) return
    if (!hasKey(llm)) {
      setKeyOpen(true)
      return
    }
    if (historyRef.current.length === 0)
      historyRef.current.push({ role: 'system', content: systemPrompt(task) })

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

  const feedDraft = (text: string) => {
    setDraft(text)
    setOpenDock('agent')
    setFocusSignal((s) => s + 1)
  }

  const toggleDock = (pane: Exclude<DockPane, null>) => {
    if (openDock === pane) {
      setOpenDock(null)
      return
    }
    setOpenDock(pane)
    if (pane === 'agent') setFocusSignal((s) => s + 1)
  }

  const flowSteps: DataFlowStep[] = CREATE_PROJECT_EXAMPLES.map((example, i) => ({
    id: example.id,
    title: `${example.tab} · ${example.title.replace(/^示例 \d+ · /, '')}`,
    detail: example.hint,
    tone: FLOW_TONES[i],
    input: i === 0,
  }))

  const stepPrompt = (id: string) => CREATE_PROJECT_EXAMPLES.find((e) => e.id === id)?.text ?? ''

  return (
    <div className="pb-24" suppressHydrationWarning>
      <PlaygroundProvider initialFiles={TEMPLATE_FILES}>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div id="practice-sandbox" className="grid scroll-mt-4 content-start gap-4">
            <section
              aria-label="web runner 沙箱预览"
              className="rounded-xl border-2 border-ink bg-paper-deep p-3 shadow-ink"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="t-small-strong">web runner · 沙箱预览</span>
                <span className="t-small-mute">隔离 iframe，postMessage 单通道</span>
              </div>
              <StatusLine />
              <RunnerStage />
              <OutputView />
            </section>
            <section
              aria-label="playground 编辑器"
              className="rounded-xl border-2 border-ink bg-paper p-3 shadow-ink"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="t-small-strong">playground · 编辑器</span>
                <span className="t-small-mute">宿主 stack 构建，产物送上方沙箱</span>
              </div>
              <FileTabs />
              <CodeEditor />
              <RunRow />
            </section>
          </div>

          <div className="grid content-start gap-4">
            <section id="practice-brief" className="grid scroll-mt-4 gap-2.5">
              <h2 className="t-small-strong m-0">练习任务 · {task.title}</h2>
              <p className="m-0 text-[13.5px] leading-6 text-body">{task.scene}</p>
              <p className="m-0 text-[13.5px] leading-6 text-body">
                <b>预期：</b>
                {task.expectation}
              </p>
              <p className="t-small-mute m-0">验收清单夹在页面右上角——点夹具拉出来逐条打勾。</p>
            </section>

            <section id="practice-flow" className="grid scroll-mt-4 gap-2.5">
              <h2 className="m-0 flex flex-wrap items-baseline gap-2">
                <span className="t-small-strong">操作流水线</span>
                <i className="t-small-mute not-italic">{CREATE_PROJECT_NOTE}</i>
              </h2>
              <p className="m-0 text-[13.5px] leading-6 text-body">
                {CREATE_PROJECT_INTRO.map((seg, i) =>
                  typeof seg === 'string' ? (
                    seg
                  ) : (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 静态文案段，顺序恒定
                    <b key={i}>{seg.b}</b>
                  ),
                )}
              </p>
              <DataFlowBoard
                title="点一步，喂给陪练"
                note="点击任一步骤：陪练面板自动展开、提示词填进输入框，确认无误按回车发送。"
                steps={flowSteps}
                onStepClick={(step) => feedDraft(stepPrompt(step.id))}
              />
            </section>
          </div>
        </div>
      </PlaygroundProvider>

      <ChecklistDock
        panelId="checklist-dock-panel"
        badge={`${checkedIds.length}/${task.acceptance.length}`}
        open={openDock === 'checklist'}
        onToggle={() => setOpenDock((v) => (v === 'checklist' ? null : 'checklist'))}
      >
        <ClipboardChecklist
          title="完成后逐条核对"
          description="跟着任务说明动手，逐条自查确认；全部勾选即盖章。"
          items={task.acceptance.map((label) => ({ id: label, label }))}
          checkedIds={checkedIds}
          onCheckedChange={setCheckedIds}
          className="learning-clipboard-dock"
        />
      </ChecklistDock>

      <div className="fixed right-3 bottom-3 z-40 flex items-end gap-2 sm:right-4 sm:bottom-4">
        <DockSticky
          comp="coach-sticky"
          panelId="coach-sticky-panel"
          label="陪练 agent"
          meta={task.label}
          accentClass="bg-clash2a"
          open={openDock === 'agent'}
          onToggle={() => toggleDock('agent')}
          panelClassName="h-[min(540px,calc(100dvh_-_120px))] w-[min(420px,calc(100vw-24px))]"
          fill
        >
          <ChatPanel
            items={chat}
            busy={busy}
            ready
            hasKey={hasKey(llm)}
            model={llm.model}
            draft={draft}
            onDraftChange={setDraft}
            focusSignal={focusSignal}
            onSend={send}
            onStop={stop}
            onOpenKey={() => setKeyOpen(true)}
            flat
          />
        </DockSticky>
      </div>

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
