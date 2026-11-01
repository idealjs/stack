import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { useDockEscape } from './shared'

export interface DropdownProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'type'> {
  comp: string
  panelId: string
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerClassName: string
  trigger: ReactNode
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
  children,
  ...rest
}: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useDockEscape(open, () => onOpenChange(false))

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onOpenChange])

  return (
    <>
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
      <div
        ref={panelRef}
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
