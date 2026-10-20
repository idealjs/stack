import type { ReactNode } from 'react'

export interface TaskEnvelopeProps {
  title: string
  summary: string
  recipient?: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function TaskEnvelope({
  title,
  summary,
  recipient = '你的 Agent',
  children,
  defaultOpen = false,
  className = '',
}: TaskEnvelopeProps) {
  return (
    <details
      data-comp="task-envelope"
      className={`learning-object learning-envelope ${className}`}
      open={defaultOpen}
    >
      <summary>
        <svg
          className="learning-envelope-seam"
          viewBox="0 0 320 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 0 L160 82 L320 0"
            fill="var(--color-paper-deep)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
        </svg>
        <span className="learning-envelope-postage" aria-hidden="true">
          ～<small>AGENT</small>
        </span>
        <span className="learning-eyebrow">TO / {recipient}</span>
        <b>{title}</b>
        <span className="learning-envelope-description">{summary}</span>
        <span className="learning-envelope-toggle">
          <span className="when-closed">打开任务 ↓</span>
          <span className="when-open">收起任务 ↑</span>
        </span>
      </summary>
      <div className="learning-envelope-letter learning-prose">{children}</div>
    </details>
  )
}
