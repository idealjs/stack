import { toneStyle } from './shared'
import type { LearningTone } from './shared'

/** 流水线上的一个工位：编号由渲染顺序推导，不写入数据。 */
export interface DataFlowStep {
  id: string
  title: string
  detail: string
  /** 编号徽标的撞色；相邻工位换 tone 扫读性更好，不传回落纸色。 */
  tone?: LearningTone
  /** 起点工位＝等用户输入：虚线框提示「流程从这里开始」。 */
  input?: boolean
}

export interface DataFlowBoardProps {
  title?: string
  steps: readonly DataFlowStep[]
  note?: string
  className?: string
}

/** 数据流水线板：把一条数据流拆成工位卡，箭头固定读向——
 * 板面够宽时横排（→），窄栏自动退回竖排（↓）；外层 ol 语义，屏幕阅读器按顺序读出。 */
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
            <span className="learning-flow-badge" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <b className="learning-flow-title">{step.title}</b>
            <span className="learning-flow-detail">{step.detail}</span>
          </li>
        ))}
      </ol>
      {note && <p className="learning-description">{note}</p>}
    </section>
  )
}
