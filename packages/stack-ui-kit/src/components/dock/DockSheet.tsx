import type { ReactNode } from 'react'
import { noTransitionOnReduce } from '../noTransitionOnReduce.css.ts'
import {
  sheetBody,
  sheetClose,
  sheetMask,
  sheetMaskClosed,
  sheetMaskOpen,
  sheetPanel,
  sheetPanelClosed,
  sheetPanelOpen,
  sheetTab,
  sheetTabArrow,
  sheetTabLabel,
  sheetTabsRail,
  sheetToolbar,
} from './dock.css.ts'
import { useDockEscape } from './shared'

export interface DockSheetTab {
  id: string
  comp: string
  label: string
  accentClass: string
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
      className={`${sheetTab} ${noTransitionOnReduce} ${tab.accentClass}`}
    >
      <span aria-hidden className={sheetTabArrow}>
        ◀
      </span>
      <span className={sheetTabLabel}>{tab.label}</span>
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
        className={`${sheetMask} ${noTransitionOnReduce} ${open ? sheetMaskOpen : sheetMaskClosed}`}
      />

      <div className={sheetTabsRail}>
        {tabs.map((tab) => (
          <SheetTab
            key={tab.id}
            tab={tab}
            panelId={panelId}
            open={open}
            onOpen={() => onTabOpen?.(tab.id)}
          />
        ))}
      </div>

      <section
        id={panelId}
        aria-label={label}
        className={`${sheetPanel} ${noTransitionOnReduce} ${
          open ? sheetPanelOpen : sheetPanelClosed
        }`}
      >
        <div className={sheetToolbar}>
          {toolbar}
          <button
            type="button"
            onClick={onToggle}
            aria-label="收起侧栏"
            title="收起侧栏"
            className={sheetClose}
          >
            ✕
          </button>
        </div>
        <div className={sheetBody}>{children}</div>
      </section>
    </>
  )
}
