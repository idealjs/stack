import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function ChecklistDock({
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
    <div className="pointer-events-none fixed top-0 right-4 z-40 w-[min(380px,calc(100vw-24px))] sm:right-6">
      <div className="pointer-events-auto mt-[18px]">
        <span className="hover-host block">
          <button
            type="button"
            data-comp="checklist-clip"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="relative block h-[19px] w-full cursor-pointer rounded-t-[12px] border-2 border-b-0 border-ink bg-paper-deep outline-none"
          >
            <span aria-hidden className="learning-clipboard-clip checklist-dock-clip" />
            <span className="sr-only">验收清单</span>
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
              className="max-h-[min(560px,calc(100dvh_-_160px))] overflow-auto"
            >
              {children}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
