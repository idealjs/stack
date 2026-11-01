import type { ReactNode } from 'react'
import { DockDrop } from '../../../design-system'

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
  return (
    <DockDrop
      comp="tips-dock-trigger"
      panelId={panelId}
      label="tips · 喂给陪练"
      open={open}
      onToggle={onToggle}
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
    </DockDrop>
  )
}
