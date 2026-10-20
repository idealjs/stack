import { toneStyle } from './shared'
import type { LearningTone } from './shared'

export interface DataFlowStep {
  id: string
  title: string
  detail: string

  tone?: LearningTone

  input?: boolean
}

export interface DataFlowBoardProps {
  title?: string
  steps: readonly DataFlowStep[]
  note?: string
  className?: string
}

export function DataFlowBoard({ title, steps, note, className = '' }: DataFlowBoardProps) {
  return (
    <section data-comp="data-flow-board" className={`learning-object learning-flow ${className}`}>
      {title && <h3>{title}</h3>}
      <ol className="learning-flow-line">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="learning-flow-step"
            data-input={step.input ? 'true' : undefined}
            style={step.tone ? toneStyle(step.tone) : undefined}
          >
            <span className="learning-flow-badge" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <b className="learning-flow-title">{step.title}</b>
            <span className="learning-flow-detail">{step.detail}</span>
          </li>
        ))}
      </ol>
      {note && <p className="learning-description">{note}</p>}
    </section>
  )
}
