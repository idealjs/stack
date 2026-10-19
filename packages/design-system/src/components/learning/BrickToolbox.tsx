import { toneStyle } from './shared'
import type { LearningTone } from './shared'

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
}


export function BrickToolbox({ title, bricks, variant = 'lesson', className = '' }: BrickToolboxProps) {
  return (
    <section data-comp="brick-toolbox" data-variant={variant} className={`learning-object learning-toolbox ${className}`}>
      <header><span aria-hidden="true">● ● ●</span><h3>{title}</h3><small>{bricks.length} 块</small></header>
      <div className="learning-toolbox-tray">
        {bricks.map((brick, index) => (
          <details key={brick.id} className="learning-brick" style={brick.tone ? toneStyle(brick.tone) : undefined}>
            <summary>
              <span className="learning-brick-studs" aria-hidden="true"><i /><i /></span>
              {variant === 'overview'
                ? (
                    <span className="learning-brick-top">
                      <span className="learning-brick-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      {brick.stage && <span className="learning-brick-stage">{brick.stage}</span>}
                    </span>
                  )
                : <span className="learning-eyebrow">{`${String(index + 1).padStart(2, '0')} / ${brick.learned ? '已学' : '待学'}`}</span>}
              <b>{brick.name}</b><span className="learning-brick-open" aria-hidden="true">＋</span>
              {variant === 'overview' && brick.summary && <span className="learning-brick-summary">{brick.summary}</span>}
            </summary>
            <dl>
              <dt>是什么</dt><dd>{brick.what}</dd>
              <dt>{variant === 'overview' ? '在项目里做什么' : '为何在这'}</dt><dd>{brick.why}</dd>
              <dt>{variant === 'overview' ? '相关技术' : '带一族'}</dt><dd>{brick.family}</dd>
            </dl>
          </details>
        ))}
      </div>
    </section>
  )
}
