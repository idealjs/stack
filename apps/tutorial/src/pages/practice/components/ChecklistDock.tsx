import type { ReactNode } from 'react'
import { Dropdown } from '../../../design-system'

export function ChecklistDock({
  panelId,
  done,
  total,
  open,
  onOpenChange,
  children,
}: {
  panelId: string
  done: number
  total: number
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  const all = total > 0 && done >= total
  const progress = all ? 'all' : done > 0 ? 'partial' : 'none'
  const stripClass = all ? 'bg-clash1b' : done > 0 ? 'bg-clash2a' : 'bg-paper-deep'

  return (
    <Dropdown
      comp="checklist-clip"
      panelId={panelId}
      label="验收清单"
      open={open}
      onOpenChange={onOpenChange}
      data-progress={progress}
      triggerClassName="flex h-[34px] w-[116px] flex-col rounded-[7px_7px_4px_4px] border-2 border-ink bg-paper shadow-[3px_3px_0_var(--color-ink)]"
      trigger={
        <>
          <span
            aria-hidden
            className="absolute top-[-9px] left-1/2 block h-[13px] w-[24px] -translate-x-1/2 rounded-t-[6px] border-2 border-ink bg-paper"
          />
          <span
            aria-hidden
            className={`mx-1.5 mt-[5px] block h-[7px] rounded-[3px] transition-colors duration-200 motion-reduce:transition-none ${stripClass}`}
          />
          <span className="flex flex-1 items-center justify-center gap-1 pb-[3px] leading-none">
            <span className="t-small-strong">验收</span>
            <span className="font-mono text-[12px] font-bold text-ink">
              {done}/{total}
            </span>
          </span>
          <span className="sr-only">验收清单</span>
        </>
      }
    >
      {children}
    </Dropdown>
  )
}
