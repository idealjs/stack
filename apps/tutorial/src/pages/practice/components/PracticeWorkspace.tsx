import { useMemo, useRef, useState } from 'react'
import { AgentDock } from '../../../components/AgentDock'
import type { ChatItem } from '../../../components/ChatPanel'
import { ChatPanel } from '../../../components/ChatPanel'
import { ChecklistDock } from '../../../components/ChecklistDock'
import { PlaygroundDock } from '../../../components/PlaygroundDock'
import { TipsDock } from '../../../components/TipsDock'
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
import { CREATE_PROJECT_EXAMPLES } from '../lib/prompts'
import { taskFromLocation } from '../lib/tasks'
import { KeyModal } from './KeyModal'

const FLOW_TONES = ['coral', 'teal', 'blue'] as const

type DockPane = 'agent' | 'checklist' | 'tips' | null

function appendAssistant(items: ChatItem[], delta: string): ChatItem[] {
  const next = items.slice()
  const last = next[next.length - 1]
  if (last && last.kind === 'assistant')
    next[next.length - 1] = { ...last, text: last.text + delta }
  else next.push({ kind: 'assistant', text: delta })
  return next
}

function SandboxPane() {
  const { preview } = usePlayground()
  return (
    <section aria-label="web runner 沙箱预览" className="flex min-h-0 flex-1 flex-col gap-2.5">
      <StatusLine />
      <div className="relative h-[320px] shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-white">
        <SandboxFrame fill />
        {!preview && (
          <div className="pointer-events-none absolute inset-0 grid place-content-center gap-1 p-4 text-center">
            <p className="t-small-strong m-0">沙箱预览</p>
            <p className="t-small-mute m-0">
              切到「编辑器」页签写代码，点「运行 ▶」回到这里，构建产物送进隔离 iframe 真跑。
            </p>
          </div>
        )}
      </div>
      <OutputView />
    </section>
  )
}

function PracticeDock({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { runSeq } = usePlayground()
  return (
    <PlaygroundDock
      panelId="playground-dock-panel"
      open={open}
      onToggle={onToggle}
      runSeq={runSeq}
      editor={
        <>
          <FileTabs />
          <CodeEditor className="min-h-[360px] flex-1" />
          <RunRow />
        </>
      }
      sandbox={<SandboxPane />}
    />
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
  const [dockOpen, setDockOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState<readonly string[]>([])
  const [chat, setChat] = useState<ChatItem[]>(() => [
    {
      kind: 'assistant',
      text: `我是这个练习场的陪练 agent，收在右下角贴签里。当前任务「${task.title}」——点标题栏右上角「tips」拉出操作流水线，点任意一步，提示词会自动填进输入框，回车就能发给我；也可以直接聊思路、要代码、贴报错。代码写进右缘侧栏（点「编辑器」签拉开），点「运行 ▶」自动切到「沙箱预览」页签真跑；验收夹具和 tips 并排在标题栏，做完拉出来逐条打勾。`,
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

  const openAgent = (open: boolean) => {
    setOpenDock((v) => (open ? 'agent' : v === 'agent' ? null : v))
    if (open) setFocusSignal((s) => s + 1)
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
      <div className="fixed top-3 right-4 z-40 flex items-start gap-2 sm:right-6">
        <ChecklistDock
          panelId="checklist-dock-panel"
          label="验收清单"
          done={checkedIds.length}
          total={task.acceptance.length}
          open={openDock === 'checklist'}
          onOpenChange={(open) =>
            setOpenDock((v) => (open ? 'checklist' : v === 'checklist' ? null : v))
          }
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

        <TipsDock
          panelId="tips-dock-panel"
          label="tips · 喂给陪练"
          open={openDock === 'tips'}
          onOpenChange={(open) => setOpenDock((v) => (open ? 'tips' : v === 'tips' ? null : v))}
        >
          <section id="practice-flow">
            <DataFlowBoard
              title="点一步，喂给陪练"
              note="点击任一步骤：陪练面板自动展开、提示词填进输入框，确认无误按回车发送。"
              steps={flowSteps}
              onStepClick={(step) => feedDraft(stepPrompt(step.id))}
            />
          </section>
        </TipsDock>
      </div>

      <PlaygroundProvider initialFiles={TEMPLATE_FILES}>
        <PracticeDock open={dockOpen} onToggle={() => setDockOpen((v) => !v)} />
      </PlaygroundProvider>

      <div className="fixed right-3 bottom-3 z-40 flex items-end gap-2 sm:right-4 sm:bottom-4">
        <AgentDock
          comp="coach-sticky"
          panelId="coach-sticky-panel"
          label="陪练 agent"
          meta={task.label}
          open={openDock === 'agent'}
          onOpenChange={openAgent}
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
        </AgentDock>
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
