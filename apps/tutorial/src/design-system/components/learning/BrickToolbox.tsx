import type { ReactNode } from 'react'
import type { LearningTone } from './shared'
import { toneStyle } from './shared'

export interface ToolboxBrick {
  id: string
  name: string
  what: string
  why: string
  family: string
  learned?: boolean

  summary?: string
  stage?: string

  tone?: LearningTone
}

export interface BrickToolboxProps {
  title: string
  bricks: readonly ToolboxBrick[]
  variant?: 'lesson' | 'overview'
  className?: string
  note?: ReactNode
  defaultCollapsed?: boolean
}

export function BrickToolbox({
  title,
  bricks,
  variant = 'lesson',
  className = '',
  note,
  defaultCollapsed = false,
}: BrickToolboxProps) {
  const header = (
    <>
      <span aria-hidden="true">● ● ●</span>
      <h3>{title}</h3>
      <small>{bricks.length} 块</small>
      {defaultCollapsed && (
        <span className="learning-toolbox-fold-mark" aria-hidden="true">
          ＋
        </span>
      )}
    </>
  )
  const tray = (
    <div className="learning-toolbox-tray">
      {note && <p className="learning-toolbox-note">{note}</p>}
      {bricks.map((brick, index) => (
        <details
          key={brick.id}
          className="learning-brick"
          style={brick.tone ? toneStyle(brick.tone) : undefined}
        >
          <summary>
            <span className="learning-brick-studs" aria-hidden="true">
              <i />
              <i />
            </span>
            {variant === 'overview' ? (
              <span className="learning-brick-top">
                <span className="learning-brick-num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {brick.stage && <span className="learning-brick-stage">{brick.stage}</span>}
              </span>
            ) : (
              <span className="learning-eyebrow">{`${String(index + 1).padStart(2, '0')} / ${brick.learned ? '已学' : '待学'}`}</span>
            )}
            <b>{brick.name}</b>
            <span className="learning-brick-open" aria-hidden="true">
              ＋
            </span>
            {variant === 'overview' && brick.summary && (
              <span className="learning-brick-summary">{brick.summary}</span>
            )}
          </summary>
          <dl>
            <dt>是什么</dt>
            <dd>{brick.what}</dd>
            <dt>{variant === 'overview' ? '在项目里做什么' : '为何在这'}</dt>
            <dd>{brick.why}</dd>
            <dt>{variant === 'overview' ? '相关技术' : '带一族'}</dt>
            <dd>{brick.family}</dd>
          </dl>
        </details>
      ))}
    </div>
  )
  if (defaultCollapsed) {
    return (
      <section
        data-comp="brick-toolbox"
        data-variant={variant}
        className={`learning-object learning-toolbox ${className}`}
      >
        <details className="learning-toolbox-fold">
          <summary className="learning-toolbox-header">{header}</summary>
          {tray}
        </details>
      </section>
    )
  }
  return (
    <section
      data-comp="brick-toolbox"
      data-variant={variant}
      className={`learning-object learning-toolbox ${className}`}
    >
      <header>{header}</header>
      {tray}
    </section>
  )
}
