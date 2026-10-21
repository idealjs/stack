import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export const COACH_STICKY_PANEL_ID = 'coach-sticky-panel'

export function CoachSticky({ taskLabel, children }: { taskLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  return (
    <div className="fixed right-3 bottom-3 z-40 sm:right-4 sm:bottom-4">
      <span className="hover-host block">
        <button
          type="button"
          data-comp="coach-sticky"
          aria-expanded={open}
          aria-controls={COACH_STICKY_PANEL_ID}
          onClick={() => setOpen((v) => !v)}
          className="hoverable-shadow lift-sm flex cursor-pointer items-center gap-2 rounded-t-lg border-2 border-ink bg-clash2a py-2 pr-4 pl-3 text-[12.5px] font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none"
        >
          <span aria-hidden className="size-3 shrink-0 rounded-full border-2 border-ink bg-paper" />
          <span>陪练 agent</span>
          <span className="font-mono text-[11px] opacity-70">{taskLabel}</span>
          <span aria-hidden className="ml-0.5">
            {open ? '▾' : '▴'}
          </span>
        </button>
      </span>

      <div
        ref={panelRef}
        id={COACH_STICKY_PANEL_ID}
        aria-label="陪练 agent 对话"
        tabIndex={-1}
        className={`absolute right-0 bottom-[calc(100%+8px)] h-[min(540px,calc(100dvh_-_120px))] w-[min(420px,calc(100vw-24px))] origin-bottom-right rounded-b-lg rounded-tl-lg border-2 border-ink bg-clash2a p-2 shadow-ink transition-[opacity,transform,visibility] duration-200 outline-none motion-reduce:transition-none ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible pointer-events-none translate-y-2 scale-[0.97] opacity-0'
        }`}
      >
        <span
          aria-hidden
          className="absolute right-0 bottom-0 size-4 border-t-2 border-l-2 border-ink bg-paper-deep"
        />
        <div className="h-full min-h-0">{children}</div>
      </div>
    </div>
  )
}
