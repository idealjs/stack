import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function ChecklistDock({
  panelId,
  badge,
  open,
  onToggle,
  children,
}: {
  panelId: string
  badge: string
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
    <div className="pointer-events-none fixed top-0 right-4 z-40 w-[min(380px,calc(100vw-24px))] sm:right-6">
      <span className="hover-host pointer-events-auto mt-[10px] ml-auto block w-fit">
        <button
          type="button"
          data-comp="checklist-clip"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="relative ml-auto block w-[190px] cursor-pointer rounded-t-[10px] border-2 border-ink bg-paper px-3 pt-[22px] pb-1.5 pl-4 text-left outline-none"
        >
          <span aria-hidden className="learning-clipboard-clip checklist-dock-clip" />
          <span className="flex items-center gap-2">
            <span className="t-small-strong">验收清单</span>
            <span className="font-mono text-[11px] font-bold text-body">{badge}</span>
            <span aria-hidden className="ml-auto text-[11px]">
              {open ? '▾' : '▴'}
            </span>
          </span>
        </button>
      </span>

      <div
        className={`grid pointer-events-auto transition-[grid-template-rows,opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? 'visible [grid-template-rows:1fr] opacity-100'
            : 'invisible pointer-events-none [grid-template-rows:0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <section
            id={panelId}
            aria-label="验收清单面板"
            className="max-h-[min(560px,calc(100dvh_-_140px))] overflow-auto pt-2.5"
          >
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}
