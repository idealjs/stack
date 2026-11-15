import type { ReactNode } from 'react'
import { DockPop } from '../design-system'

export function AgentDock({
  comp,
  panelId,
  label,
  meta,
  accentClass = 'bg-clash2a',
  panelClassName = 'h-[min(540px,100dvh_-_120px)] w-[min(420px,100vw_-_24px)]',
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
    <DockPop
      comp={comp}
      panelId={panelId}
      label={label}
      meta={meta}
      accentClass={accentClass}
      open={open}
      onOpenChange={onOpenChange}
      panelClassName={panelClassName}
      fill
    >
      {children}
    </DockPop>
  )
}
