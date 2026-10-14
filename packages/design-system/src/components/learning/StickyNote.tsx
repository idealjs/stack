import type { ReactNode } from 'react'
import { toneStyle } from './shared'
import type { LearningTone } from './shared'

export interface StickyNoteProps {
  title: string
  children: ReactNode
  tone?: LearningTone
  className?: string
}

export function StickyNote({ title, children, tone = 'yellow', className = '' }: StickyNoteProps) {
  return (
    <aside data-comp="sticky-note" className={`learning-object learning-note ${className}`} style={toneStyle(tone)}>
      <div className="learning-note-paper">
        <span className="learning-note-pin" aria-hidden="true" />
        <h3>{title}</h3>
        <div className="learning-prose">{children}</div>
        <span className="learning-note-fold" aria-hidden="true" />
      </div>
    </aside>
  )
}
