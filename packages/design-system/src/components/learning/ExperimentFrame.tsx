import type { ReactNode } from 'react'

export interface ExperimentFrameProps {
  title: string

  address?: string | null
  status?: 'ready' | 'running' | 'idle' | 'demo'
  caption?: string
  children: ReactNode
  className?: string
}

const STATUS = { ready: '运行正常', running: '运行中', idle: '未运行', demo: '可操作演示' } as const

export function ExperimentFrame({
  title,
  address = 'localhost:3000',
  status = 'ready',
  caption,
  children,
  className = '',
}: ExperimentFrameProps) {
  return (
    <section
      data-comp="experiment-frame"
      className={`learning-object learning-experiment ${className}`}
    >
      <header>
        <span className="learning-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <h3>{title}</h3>
      </header>
      {address !== null && (
        <div className="learning-address">
          <span aria-hidden="true">↗</span>
          <code>{address}</code>
        </div>
      )}
      <div className="learning-experiment-screen">{children}</div>
      <footer>
        <span className="learning-run-status" data-status={status}>
          <i aria-hidden="true" />
          {STATUS[status]}
        </span>
        {caption && <span>{caption}</span>}
      </footer>
    </section>
  )
}
