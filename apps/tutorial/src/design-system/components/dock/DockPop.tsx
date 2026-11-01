import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useDockDismiss, useDockEscape } from './shared'

export interface DockPopProps {
  comp: string
  panelId: string
  label: string
  meta?: string
  accentClass: string
  open: boolean
  onOpenChange: (open: boolean) => void
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
  onOpenChange,
  panelClassName = '',
  fill = false,
  children,
}: DockPopProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useDockEscape(open, () => onOpenChange(false))
  useDockDismiss(open, () => onOpenChange(false), [rootRef])

  return (
    <div ref={rootRef} className="relative">
      <span className="hover-host block">
        <button
          type="button"
          data-comp={comp}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange(!open)}
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
        className={`absolute right-0 bottom-full mb-2 origin-bottom-right rounded-b-lg rounded-tl-lg border-2 border-ink p-2 shadow-ink transition-[opacity,transform,visibility] outline-none motion-reduce:transition-none ${accentClass} ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100 duration-200'
            : 'invisible pointer-events-none translate-y-2 scale-[0.97] opacity-0 duration-100'
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
