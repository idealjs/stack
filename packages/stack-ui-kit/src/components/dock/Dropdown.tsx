import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useRef } from 'react'
import { noTransitionOnReduce } from '../noTransitionOnReduce.css.ts'
import { hoverHost } from '../hoverHost.css.ts'
import {
  dropdownPanelBody,
  dropdownPanelBottom,
  dropdownPanelClip,
  dropdownPanelClosedBottom,
  dropdownPanelClosedTop,
  dropdownPanelOpenBottom,
  dropdownPanelOpenTop,
  dropdownPanelTop,
  dropdownTrigger,
  dropdownTriggerHost,
} from './dock.css.ts'
import { useDockDismiss, useDockEscape } from './shared'

export interface DropdownProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'type'> {
  comp: string
  panelId: string
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerClassName: string
  trigger: ReactNode
  placement?: 'bottom' | 'top'
  panelClassName?: string
  children: ReactNode
}

export function Dropdown({
  comp,
  panelId,
  label,
  open,
  onOpenChange,
  triggerClassName,
  trigger,
  placement = 'bottom',
  panelClassName = 'w-[min(380px,100vw_-_24px)]',
  children,
  ...rest
}: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useDockEscape(open, () => onOpenChange(false))
  useDockDismiss(open, () => onOpenChange(false), [triggerRef, panelRef])

  return (
    <>
      <span className={`${hoverHost} ${dropdownTriggerHost}`}>
        <button
          ref={triggerRef}
          type="button"
          data-comp={comp}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={label}
          title={label}
          onClick={() => onOpenChange(!open)}
          className={`${dropdownTrigger} ${triggerClassName}`}
          {...rest}
        >
          {trigger}
        </button>
      </span>
      <div
        ref={panelRef}
        className={`${
          placement === 'bottom' ? dropdownPanelBottom : dropdownPanelTop
        } ${noTransitionOnReduce} ${
          placement === 'bottom'
            ? open
              ? dropdownPanelOpenBottom
              : dropdownPanelClosedBottom
            : open
              ? dropdownPanelOpenTop
              : dropdownPanelClosedTop
        } ${panelClassName}`}
      >
        <div className={placement === 'bottom' ? dropdownPanelClip : ''}>
          <section id={panelId} aria-label={label} className={dropdownPanelBody}>
            {children}
          </section>
        </div>
      </div>
    </>
  )
}
