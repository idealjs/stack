import * as styles from '@idealjs/stack-ui-kit/styles'
import { Dropdown } from '@idealjs/stack-ui-kit'
import type { ReactNode } from 'react'

export function TipsDock({
  panelId,
  label,
  open,
  onOpenChange,
  children,
}: {
  panelId: string
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Dropdown
      comp="tips-dock-trigger"
      panelId={panelId}
      label={label}
      open={open}
      onOpenChange={onOpenChange}
      triggerClassName={`flex items-center gap-1.5 rounded-full border-2 ${styles.borderInk} ${styles.bgPaper} px-3 py-1.5 text-[12.5px] font-extrabold ${styles.textInk} shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none hover:-translate-y-0.5`}
      trigger={
        <>
          <span aria-hidden>💡</span>
          <span>tips</span>
          <span aria-hidden className="text-[10px] leading-none">
            {open ? '▴' : '▾'}
          </span>
        </>
      }
    >
      {children}
    </Dropdown>
  )
}
