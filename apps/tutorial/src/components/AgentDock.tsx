import * as styles from '@idealjs/stack-ui-kit/styles'
import { Dropdown } from '@idealjs/stack-ui-kit'
import type { ReactNode } from 'react'

export function AgentDock({
  comp,
  panelId,
  label,
  meta,
  accentClass = `${styles.bgClash2a}`,
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
      triggerClassName={`${styles.hoverableShadow} ${styles.liftSm} flex cursor-pointer items-center gap-2 rounded-t-lg border-2 ${styles.borderInk} py-2 pr-4 pl-3 text-[12.5px] font-extrabold ${styles.textInk} shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none ${accentClass}`}
      trigger={
        <>
          <span
            aria-hidden
            className={`size-3 shrink-0 rounded-full border-2 ${styles.borderInk} ${styles.bgPaper}`}
          />
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
        className={`relative rounded-b-lg rounded-tl-lg border-2 ${styles.borderInk} p-2 ${styles.shadowInk} ${accentClass} ${panelClassName}`}
      >
        <span
          aria-hidden
          className={`absolute right-0 bottom-0 size-4 border-t-2 border-l-2 ${styles.borderInk} ${styles.bgPaperDeep}`}
        />
        <div className="h-full min-h-0">{children}</div>
      </div>
    </Dropdown>
  )
}
