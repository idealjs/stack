import type { LearningTone } from './shared'
import { toneStyle } from './shared'

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
  onStepClick?: (step: DataFlowStep) => void
}

export function DataFlowBoard({
  title,
  steps,
  note,
  className = '',
  onStepClick,
}: DataFlowBoardProps) {
  return (
    <section data-comp="data-flow-board" className={`learning-object learning-flow ${className}`}>
      {title && <h3>{title}</h3>}
      <ol className="learning-flow-line">
        {steps.map((step, index) => {
          const body = (
            <>
              <span className="learning-flow-badge" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <b className="learning-flow-title">{step.title}</b>
              <span className="learning-flow-detail">{step.detail}</span>
            </>
          )
          return (
            <li
              key={step.id}
              className="learning-flow-step"
              data-input={step.input ? 'true' : undefined}
              data-clickable={onStepClick ? 'true' : undefined}
              style={step.tone ? toneStyle(step.tone) : undefined}
            >
              {onStepClick ? (
                <button
                  type="button"
                  className="learning-flow-step-btn"
                  onClick={() => onStepClick(step)}
                >
                  {body}
                </button>
              ) : (
                body
              )}
            </li>
          )
        })}
      </ol>
      {note && <p className="learning-description">{note}</p>}
    </section>
  )
}
