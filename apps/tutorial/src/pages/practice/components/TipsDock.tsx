import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function TipsDock({
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
    <div className="pointer-events-none fixed top-[52px] right-4 z-40 w-[min(380px,calc(100vw-24px))] sm:top-3 sm:right-6">
      <button
        type="button"
        data-comp="tips-dock-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="tips · 喂给陪练"
        title="tips · 喂给陪练"
        onClick={onToggle}
        className="pointer-events-auto ml-auto flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12.5px] font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] outline-none transition-[translate] duration-150 motion-reduce:transition-none hover:-translate-y-0.5"
      >
        <span aria-hidden>💡</span>
        <span>tips</span>
        <span aria-hidden className="text-[10px] leading-none">
          {open ? '▴' : '▾'}
        </span>
      </button>

      <div
        className={`pointer-events-auto mt-2 grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? 'visible [grid-template-rows:1fr] opacity-100'
            : 'invisible pointer-events-none [grid-template-rows:0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <section
            id={panelId}
            aria-label="喂给陪练面板"
            className="max-h-[min(560px,calc(100dvh-160px))] overflow-auto"
          >
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}
