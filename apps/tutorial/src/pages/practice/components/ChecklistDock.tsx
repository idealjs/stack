import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function ChecklistDock({
  panelId,
  done,
  total,
  open,
  onToggle,
  children,
}: {
  panelId: string
  done: number
  total: number
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
      <div className="pointer-events-auto relative mt-[18px]">
        <button
          type="button"
          data-comp="checklist-clip"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="absolute top-[-9px] left-1/2 z-10 flex h-[34px] w-[116px] -translate-x-1/2 cursor-pointer flex-col rounded-[7px_7px_4px_4px] border-2 border-ink bg-paper shadow-[0_3px_0_var(--color-ink)] outline-none"
        >
          <span
            aria-hidden
            className="absolute top-[-9px] left-1/2 block h-[13px] w-[24px] -translate-x-1/2 rounded-t-[6px] border-2 border-ink bg-paper"
          />
          <span aria-hidden className="mx-1.5 mt-[5px] block h-[7px] rounded-[3px] bg-clash1b" />
          <span className="flex flex-1 items-center justify-center gap-1 pb-[3px] leading-none">
            <span className="t-small-strong">验收</span>
            <span className="font-mono text-[12px] font-bold text-ink">
              {done}/{total}
            </span>
          </span>
          <span className="sr-only">验收清单</span>
        </button>

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
