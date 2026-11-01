import type { ReactNode } from 'react'
import { useDockEscape } from './shared'

export interface DockSheetTab {
  id: string
  comp: string
  label: string
  accentClass: string
  positionClass: string
}

export interface DockSheetProps {
  panelId: string
  label: string
  maskComp: string
  open: boolean
  onToggle: () => void
  tabs: DockSheetTab[]
  onTabOpen?: (id: string) => void
  toolbar?: ReactNode
  children: ReactNode
}

function SheetTab({
  tab,
  panelId,
  open,
  onOpen,
}: {
  tab: DockSheetTab
  panelId: string
  open: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      data-comp={tab.comp}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onOpen}
      className={`fixed right-0 z-30 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5 rounded-l-lg border-2 border-r-0 border-ink py-3 pr-2 pl-1.5 text-[12.5px] font-extrabold text-ink shadow-[-3px_3px_0_var(--color-ink)] transition-[translate] duration-150 motion-reduce:transition-none hover:-translate-x-0.5 ${tab.accentClass} ${tab.positionClass}`}
    >
      <span aria-hidden className="text-[10px] leading-none">
        ◀
      </span>
      <span className="[writing-mode:vertical-rl]">{tab.label}</span>
    </button>
  )
}

export function DockSheet({
  panelId,
  label,
  maskComp,
  open,
  onToggle,
  tabs,
  onTabOpen,
  toolbar,
  children,
}: DockSheetProps) {
  useDockEscape(open, onToggle)

  return (
    <>
      <div
        data-comp={maskComp}
        aria-hidden
        onClick={onToggle}
        className={`fixed inset-0 z-[45] bg-ink/45 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {tabs.map((tab) => (
        <SheetTab
          key={tab.id}
          tab={tab}
          panelId={panelId}
          open={open}
          onOpen={() => onTabOpen?.(tab.id)}
        />
      ))}

      <section
        id={panelId}
        aria-label={label}
        className={`fixed top-0 right-0 z-50 flex h-dvh w-[min(600px,calc(100vw-24px))] flex-col rounded-l-xl border-2 border-r-0 border-ink bg-paper shadow-ink transition-[transform,opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? 'visible translate-x-0 opacity-100'
            : 'invisible pointer-events-none translate-x-full opacity-0'
        }`}
      >
        <div className="flex shrink-0 items-center gap-x-2 border-b-2 border-ink px-4 py-2.5">
          {toolbar}
          <button
            type="button"
            onClick={onToggle}
            aria-label="收起侧栏"
            title="收起侧栏"
            className="ml-auto shrink-0 cursor-pointer rounded-md border-2 border-ink bg-white px-1.5 py-0.5 text-[12px] font-bold text-ink hover:bg-paper-deep"
          >
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">{children}</div>
      </section>
    </>
  )
}
