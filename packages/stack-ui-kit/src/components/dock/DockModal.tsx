import type { ReactNode } from 'react'
import { modalOverlay, modalPanel } from './dock.css.ts'
import { useDockEscape } from './shared'

export interface DockModalProps {
  label: string
  className?: string
  onClose: () => void
  children: ReactNode
}

export function DockModal({ label, className = '', onClose, children }: DockModalProps) {
  useDockEscape(true, onClose)

  return (
    <div className={modalOverlay} onClick={onClose} role="presentation">
      <section
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`${modalPanel} ${className}`}
      >
        {children}
      </section>
    </div>
  )
}
