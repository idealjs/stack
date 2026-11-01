import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useDockEscape } from './shared'

export interface DockDropProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'type'> {
  comp: string
  panelId: string
  label: string
  open: boolean
  onToggle: () => void
  triggerClassName: string
  trigger: ReactNode
  children: ReactNode
}

export function DockDrop({
  comp,
  panelId,
  label,
  open,
  onToggle,
  triggerClassName,
  trigger,
  children,
  ...rest
}: DockDropProps) {
  useDockEscape(open, onToggle)

  return (
    <>
      <button
        type="button"
        data-comp={comp}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        title={label}
        onClick={onToggle}
        className={`pointer-events-auto relative cursor-pointer outline-none ${triggerClassName}`}
        {...rest}
      >
        {trigger}
      </button>
      <div
        className={`pointer-events-auto absolute top-[calc(100%+8px)] right-0 grid w-[min(380px,calc(100vw-24px))] transition-[grid-template-rows,opacity,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? 'visible [grid-template-rows:1fr] opacity-100'
            : 'invisible pointer-events-none [grid-template-rows:0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <section
            id={panelId}
            aria-label={label}
            className="max-h-[min(560px,calc(100dvh-160px))] overflow-auto"
          >
            {children}
          </section>
        </div>
      </div>
    </>
  )
}
