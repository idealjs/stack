import type { ReactNode } from 'react'
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
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl border-2 border-ink bg-paper p-5 shadow-ink ${className}`}
      >
        {children}
      </section>
    </div>
  )
}
