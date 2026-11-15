import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { DockSheet } from '../design-system'

type DockPaneKind = 'editor' | 'sandbox'

const PANE_META: Record<DockPaneKind, string> = {
  editor: '宿主 stack 构建，产物送「沙箱预览」真跑',
  sandbox: '隔离 iframe，postMessage 单通道',
}

const PANE_TAB_BASE =
  'cursor-pointer rounded-md border-2 border-ink px-2.5 py-1 text-[12.5px] font-extrabold text-ink transition-colors duration-150 motion-reduce:transition-none'

const PANE_TAB_IDLE = 'bg-white hover:bg-paper-deep'

export function PlaygroundDock({
  panelId,
  open,
  onToggle,
  runSeq = 0,
  editor,
  sandbox,
}: {
  panelId: string
  open: boolean
  onToggle: () => void
  runSeq?: number
  editor: ReactNode
  sandbox: ReactNode
}) {
  const [pane, setPane] = useState<DockPaneKind>('editor')

  useEffect(() => {
    if (runSeq === 0) return
    setPane('sandbox')
  }, [runSeq])

  const openPane = (next: DockPaneKind) => {
    setPane(next)
    if (!open) onToggle()
  }

  return (
    <DockSheet
      panelId={panelId}
      label="playground 侧栏"
      maskComp="playground-dock-mask"
      open={open}
      onToggle={onToggle}
      onTabOpen={(id) => openPane(id as DockPaneKind)}
      tabs={[
        {
          id: 'editor',
          comp: 'editor-dock-tab',
          label: 'playground · 编辑器',
          accentClass: 'bg-clash1a',
        },
        {
          id: 'sandbox',
          comp: 'sandbox-dock-tab',
          label: 'web runner · 沙箱预览',
          accentClass: 'bg-clash2b',
        },
      ]}
      toolbar={
        <>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              data-comp="editor-dock-pane-tab"
              aria-pressed={pane === 'editor'}
              onClick={() => setPane('editor')}
              className={`${PANE_TAB_BASE} ${pane === 'editor' ? 'bg-ink text-paper' : PANE_TAB_IDLE}`}
            >
              编辑器
            </button>
            <button
              type="button"
              data-comp="sandbox-dock-pane-tab"
              aria-pressed={pane === 'sandbox'}
              onClick={() => setPane('sandbox')}
              className={`flex items-center gap-1 ${PANE_TAB_BASE} ${pane === 'sandbox' ? 'bg-clash2b' : PANE_TAB_IDLE}`}
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
        </>
      }
    >
      <div className={pane === 'editor' ? 'contents' : 'hidden'}>{editor}</div>
      <div className={pane === 'sandbox' ? 'contents' : 'hidden'}>{sandbox}</div>
    </DockSheet>
  )
}
