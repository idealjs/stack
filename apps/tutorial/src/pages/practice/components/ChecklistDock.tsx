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
    <div className="fixed top-0 right-4 z-40 flex flex-col items-center sm:right-6">
      <span className="hover-host block">
        <button
          type="button"
          data-comp="checklist-clip"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex cursor-pointer flex-col items-center outline-none"
        >
          <span className="relative block h-[24px] w-[68px] rounded-[7px_7px_4px_4px] border-2 border-ink bg-clash1b shadow-[0_3px_0_var(--color-ink)] transition-transform duration-150 group-hover:-translate-y-0.5 motion-reduce:transition-none">
            <span
              aria-hidden
              className="absolute top-[-8px] left-[21px] block h-[12px] w-[22px] rounded-t-[6px] border-2 border-ink bg-paper"
            />
          </span>
          <span
            aria-hidden
            className="relative -mt-[2px] block h-[16px] w-[96px] rounded-t-[5px] border-2 border-ink bg-paper text-center font-mono text-[10px] leading-[14px] font-bold text-body"
          >
            {badge}
          </span>
          <span className="sr-only">验收清单</span>
        </button>
      </span>

      <section
        id={panelId}
        aria-label="验收清单面板"
        className={`absolute top-[calc(100%+6px)] right-0 max-h-[min(560px,calc(100dvh_-_80px))] w-[min(380px,calc(100vw-24px))] origin-top overflow-auto rounded-lg border-2 border-ink bg-paper-deep p-2 shadow-ink transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
        }`}
      >
        {children}
      </section>
    </div>
  )
}
