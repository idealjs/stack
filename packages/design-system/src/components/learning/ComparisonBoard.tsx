import type { ReactNode } from 'react'

export interface ComparisonSide {
  label: string
  content: ReactNode
}

export interface ComparisonBoardProps {
  title: string
  left: ComparisonSide
  right: ComparisonSide
  caption?: string
  className?: string
}

export function ComparisonBoard({ title, left, right, caption, className = '' }: ComparisonBoardProps) {
  return (
    <section data-comp="comparison-board" className={`learning-object learning-comparison ${className}`}>
      <h3>{title}</h3>
      <div className="learning-comparison-pages">
        {[left, right].map((side, index) => (
          <section key={index} className="learning-comparison-page">
            <h4>{side.label}</h4><div className="learning-prose">{side.content}</div>
          </section>
        ))}
        <span className="learning-comparison-link" aria-hidden="true">↔</span>
      </div>
      {caption && <p className="learning-description">{caption}</p>}
    </section>
  )
}
