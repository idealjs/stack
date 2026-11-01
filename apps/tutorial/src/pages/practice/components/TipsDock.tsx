import type { ReactNode } from 'react'
import { Dropdown } from '../../../design-system'

export function TipsDock({
  panelId,
  open,
  onOpenChange,
  children,
}: {
  panelId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Dropdown
      comp="tips-dock-trigger"
      panelId={panelId}
      label="tips · 喂给陪练"
      open={open}
      onOpenChange={onOpenChange}
      triggerClassName="flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12.5px] font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none hover:-translate-y-0.5"
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
