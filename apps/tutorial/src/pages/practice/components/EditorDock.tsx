import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function EditorDock({
  panelId,
  open,
  onToggle,
  children,
}: {
  panelId: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onToggle])

  return (
    <>
      <button
        type="button"
        data-comp="editor-dock-tab"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={`fixed top-1/2 right-0 z-40 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5 rounded-l-lg border-2 border-r-0 border-ink bg-clash1a py-3 pl-1.5 pr-2 text-[12.5px] font-extrabold text-ink shadow-[-3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none ${
          open ? 'translate-x-full pointer-events-none opacity-0' : 'hover:-translate-x-0.5'
        }`}
      >
        <span aria-hidden className="text-[10px] leading-none">
          ◀
        </span>
        <span className="[writing-mode:vertical-rl]">playground · 编辑器</span>
      </button>

      <section
        id={panelId}
        aria-label="playground 编辑器"
        className={`fixed top-0 right-0 z-50 flex h-dvh w-[min(600px,calc(100vw-24px))] flex-col rounded-l-xl border-2 border-r-0 border-ink bg-paper shadow-ink transition-[transform,opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? 'visible translate-x-0 opacity-100'
            : 'invisible pointer-events-none translate-x-full opacity-0'
        }`}
      >
        <div className="flex shrink-0 items-baseline justify-between gap-x-2 border-b-2 border-ink px-4 py-2.5">
          <span className="t-small-strong shrink-0">playground · 编辑器</span>
          <span className="t-small-mute min-w-0 flex-1 truncate">
            宿主 stack 构建，产物送左侧沙箱
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label="收起编辑器"
            title="收起编辑器"
            className="shrink-0 cursor-pointer rounded-md border-2 border-ink bg-white px-1.5 py-0.5 text-[12px] font-bold text-ink hover:bg-paper-deep"
          >
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">{children}</div>
      </section>
    </>
  )
}
