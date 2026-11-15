import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useRef } from 'react'
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

const PANEL_ANCHOR = {
  bottom: 'top-full mt-2',
  top: 'bottom-full mb-2',
} as const

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
      <span className="hover-host inline-flex">
        <button
          ref={triggerRef}
          type="button"
          data-comp={comp}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={label}
          title={label}
          onClick={() => onOpenChange(!open)}
          className={`pointer-events-auto relative cursor-pointer outline-none ${triggerClassName}`}
          {...rest}
        >
          {trigger}
        </button>
      </span>
      <div
        ref={panelRef}
        className={`pointer-events-auto absolute right-0 ${PANEL_ANCHOR[placement]} ${panelClassName} ${
          placement === 'bottom'
            ? `grid transition-[grid-template-rows,opacity,visibility] ease-out motion-reduce:transition-none ${
                open
                  ? 'visible [grid-template-rows:1fr] opacity-100 duration-200'
                  : 'invisible pointer-events-none [grid-template-rows:0fr] opacity-0 duration-100'
              }`
            : `origin-bottom-right transition-[opacity,transform,visibility] motion-reduce:transition-none ${
                open
                  ? 'visible translate-y-0 scale-100 opacity-100 duration-200'
                  : 'invisible pointer-events-none translate-y-2 scale-[0.97] opacity-0 duration-100'
              }`
        }`}
      >
        <div className={placement === 'bottom' ? 'min-h-0 overflow-hidden' : ''}>
          <section
            id={panelId}
            aria-label={label}
            className="max-h-[min(560px,100dvh_-_160px)] overflow-auto"
          >
            {children}
          </section>
        </div>
      </div>
    </>
  )
}
