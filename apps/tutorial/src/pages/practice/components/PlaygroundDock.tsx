import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePlayground } from '../../../playground'

type DockPaneKind = 'editor' | 'sandbox'

const PANE_META: Record<DockPaneKind, string> = {
  editor: '宿主 stack 构建，产物送「沙箱预览」真跑',
  sandbox: '隔离 iframe，postMessage 单通道',
}

function EdgeTab({
  comp,
  label,
  accentClass,
  positionClass,
  panelId,
  open,
  onOpen,
}: {
  comp: string
  label: string
  accentClass: string
  positionClass: string
  panelId: string
  open: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      data-comp={comp}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onOpen}
      className={`fixed right-0 z-40 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5 rounded-l-lg border-2 border-r-0 border-ink py-3 pr-2 pl-1.5 text-[12.5px] font-extrabold text-ink shadow-[-3px_3px_0_var(--color-ink)] transition-[translate,opacity] duration-150 motion-reduce:transition-none ${accentClass} ${positionClass} ${
        open ? 'pointer-events-none translate-x-full opacity-0' : 'hover:-translate-x-0.5'
      }`}
    >
      <span aria-hidden className="text-[10px] leading-none">
        ◀
      </span>
      <span className="[writing-mode:vertical-rl]">{label}</span>
    </button>
  )
}

export function PlaygroundDock({
  panelId,
  open,
  onToggle,
  editor,
  sandbox,
}: {
  panelId: string
  open: boolean
  onToggle: () => void
  editor: ReactNode
  sandbox: ReactNode
}) {
  const { runSeq } = usePlayground()
  const [pane, setPane] = useState<DockPaneKind>('editor')

  useEffect(() => {
    if (runSeq === 0) return
    setPane('sandbox')
  }, [runSeq])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onToggle])

  const openPane = (next: DockPaneKind) => {
    setPane(next)
    if (!open) onToggle()
  }

  return (
    <>
      <div
        data-comp="playground-dock-mask"
        aria-hidden
        onClick={onToggle}
        className={`fixed inset-0 z-[45] bg-ink/45 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <EdgeTab
        comp="editor-dock-tab"
        label="playground · 编辑器"
        accentClass="bg-clash1a"
        positionClass="top-[calc(50%-7.5rem)]"
        panelId={panelId}
        open={open}
        onOpen={() => openPane('editor')}
      />
      <EdgeTab
        comp="sandbox-dock-tab"
        label="web runner · 沙箱预览"
        accentClass="bg-clash2b"
        positionClass="top-[calc(50%+7.5rem)]"
        panelId={panelId}
        open={open}
        onOpen={() => openPane('sandbox')}
      />

      <section
        id={panelId}
        aria-label="playground 侧栏"
        className={`fixed top-0 right-0 z-50 flex h-dvh w-[min(600px,calc(100vw-24px))] flex-col rounded-l-xl border-2 border-r-0 border-ink bg-paper shadow-ink transition-[transform,opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? 'visible translate-x-0 opacity-100'
            : 'invisible pointer-events-none translate-x-full opacity-0'
        }`}
      >
        <div className="flex shrink-0 items-center gap-x-2 border-b-2 border-ink px-4 py-2.5">
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              data-comp="editor-dock-pane-tab"
              aria-pressed={pane === 'editor'}
              onClick={() => setPane('editor')}
              className={`cursor-pointer rounded-md border-2 border-ink px-2.5 py-1 text-[12.5px] font-extrabold text-ink transition-colors duration-150 motion-reduce:transition-none ${
                pane === 'editor' ? 'bg-ink text-paper' : 'bg-white hover:bg-paper-deep'
              }`}
            >
              编辑器
            </button>
            <button
              type="button"
              data-comp="sandbox-dock-pane-tab"
              aria-pressed={pane === 'sandbox'}
              onClick={() => setPane('sandbox')}
              className={`flex cursor-pointer items-center gap-1 rounded-md border-2 border-ink px-2.5 py-1 text-[12.5px] font-extrabold text-ink transition-colors duration-150 motion-reduce:transition-none ${
                pane === 'sandbox' ? 'bg-clash2b' : 'bg-white hover:bg-paper-deep'
              }`}
            >
              <span aria-hidden className="text-[10px] leading-none">
                ▶
              </span>
              沙箱预览
            </button>
          </div>
          <span className="t-small-mute hidden min-w-0 flex-1 truncate sm:block">
            {PANE_META[pane]}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label="收起侧栏"
            title="收起侧栏"
            className="shrink-0 cursor-pointer rounded-md border-2 border-ink bg-white px-1.5 py-0.5 text-[12px] font-bold text-ink hover:bg-paper-deep"
          >
            ✕
          </button>
        </div>
        <div
          data-comp="playground-dock-body"
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
          <div className={pane === 'editor' ? 'contents' : 'hidden'}>{editor}</div>
          <div className={pane === 'sandbox' ? 'contents' : 'hidden'}>{sandbox}</div>
        </div>
      </section>
    </>
  )
}
