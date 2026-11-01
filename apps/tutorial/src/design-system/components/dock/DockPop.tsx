import type { ReactNode } from 'react'
import { useDockEscape } from './shared'

export interface DockPopProps {
  comp: string
  panelId: string
  label: string
  meta?: string
  accentClass: string
  open: boolean
  onToggle: () => void
  panelClassName?: string
  fill?: boolean
  children: ReactNode
}

export function DockPop({
  comp,
  panelId,
  label,
  meta,
  accentClass,
  open,
  onToggle,
  panelClassName = '',
  fill = false,
  children,
}: DockPopProps) {
  useDockEscape(open, onToggle)

  return (
    <div className="relative">
      <span className="hover-host block">
        <button
          type="button"
          data-comp={comp}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={`hoverable-shadow lift-sm flex cursor-pointer items-center gap-2 rounded-t-lg border-2 border-ink py-2 pr-4 pl-3 text-[12.5px] font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none ${accentClass}`}
        >
          <span aria-hidden className="size-3 shrink-0 rounded-full border-2 border-ink bg-paper" />
          <span>{label}</span>
          {meta && (
            <span className="hidden font-mono text-[11px] opacity-70 sm:inline">{meta}</span>
          )}
          <span aria-hidden className="ml-0.5">
            {open ? '▾' : '▴'}
          </span>
        </button>
      </span>

      <section
        id={panelId}
        aria-label={`${label}面板`}
        tabIndex={-1}
        className={`absolute right-0 bottom-[calc(100%+8px)] origin-bottom-right rounded-b-lg rounded-tl-lg border-2 border-ink p-2 shadow-ink transition-[opacity,transform,visibility] duration-200 outline-none motion-reduce:transition-none ${accentClass} ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible pointer-events-none translate-y-2 scale-[0.97] opacity-0'
        } ${panelClassName}`}
      >
        <span
          aria-hidden
          className="absolute right-0 bottom-0 size-4 border-t-2 border-l-2 border-ink bg-paper-deep"
        />
        <div className={`min-h-0 ${fill ? 'h-full' : ''}`}>{children}</div>
      </section>
    </div>
  )
}
