import type { ReactNode } from 'react'
import { Dropdown } from '../design-system'

export function AgentDock({
  comp,
  panelId,
  label,
  meta,
  accentClass = 'bg-clash2a',
  panelClassName = 'h-[min(540px,100dvh_-_120px)]',
  open,
  onOpenChange,
  children,
}: {
  comp: string
  panelId: string
  label: string
  meta?: string
  accentClass?: string
  panelClassName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Dropdown
      comp={comp}
      panelId={panelId}
      label={label}
      open={open}
      onOpenChange={onOpenChange}
      placement="top"
      panelClassName="w-[min(420px,100vw_-_24px)]"
      triggerClassName={`hoverable-shadow lift-sm flex cursor-pointer items-center gap-2 rounded-t-lg border-2 border-ink py-2 pr-4 pl-3 text-[12.5px] font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none ${accentClass}`}
      trigger={
        <>
          <span aria-hidden className="size-3 shrink-0 rounded-full border-2 border-ink bg-paper" />
          <span>{label}</span>
          {meta && (
            <span className="hidden font-mono text-[11px] opacity-70 sm:inline">{meta}</span>
          )}
          <span aria-hidden className="ml-0.5">
            {open ? '▾' : '▴'}
          </span>
        </>
      }
    >
      <div
        className={`relative rounded-b-lg rounded-tl-lg border-2 border-ink p-2 shadow-ink ${accentClass} ${panelClassName}`}
      >
        <span
          aria-hidden
          className="absolute right-0 bottom-0 size-4 border-t-2 border-l-2 border-ink bg-paper-deep"
        />
        <div className="h-full min-h-0">{children}</div>
      </div>
    </Dropdown>
  )
}
