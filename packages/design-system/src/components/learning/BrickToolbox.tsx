export interface ToolboxBrick {
  id: string
  name: string
  what: string
  why: string
  family: string
  learned?: boolean
}

export interface BrickToolboxProps {
  title: string
  bricks: readonly ToolboxBrick[]
  className?: string
}

export function BrickToolbox({ title, bricks, className = '' }: BrickToolboxProps) {
  return (
    <section data-comp="brick-toolbox" className={`learning-object learning-toolbox ${className}`}>
      <header><span aria-hidden="true">● ● ●</span><h3>{title}</h3><small>{bricks.length} 块</small></header>
      <div className="learning-toolbox-tray">
        {bricks.map((brick, index) => (
          <details key={brick.id} className="learning-brick">
            <summary>
              <span className="learning-brick-studs" aria-hidden="true"><i /><i /></span>
              <span className="learning-eyebrow">{String(index + 1).padStart(2, '0')} / {brick.learned ? '已学' : '待学'}</span>
              <b>{brick.name}</b><span className="learning-brick-open" aria-hidden="true">＋</span>
            </summary>
            <dl>
              <dt>是什么</dt><dd>{brick.what}</dd>
              <dt>为何在这</dt><dd>{brick.why}</dd>
              <dt>带一族</dt><dd>{brick.family}</dd>
            </dl>
          </details>
        ))}
      </div>
    </section>
  )
}
