/** 七个语义形状——装饰即语义（取自 ai-era-tutorial 词汇表） */
import type { CSSProperties, ReactNode } from 'react'

interface ShapeProps {
  size?: number
  className?: string
  style?: CSSProperties
}

/** ▲ 靶子：目标，卡头打头 */
export const Tri = ({ size = 24, className, style }: ShapeProps) => (
  <svg width={size} height={size * 0.92} viewBox="0 0 26 24" className={className} style={style} aria-hidden>
    <path d="M13 2 L25 22 L1 22 Z" fill="var(--color-clash1a)" stroke="var(--color-ink)" strokeWidth="2" />
  </svg>
)

/** ● 积木：清单点列，实心=已学 */
export const BrickDot = ({ size = 14, on = false, className, style }: ShapeProps & { on?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" className={className} style={style} aria-hidden>
    <circle cx="7" cy="7" r="5" fill={on ? 'var(--color-clash2a)' : 'var(--color-paper)'} stroke="var(--color-ink)" strokeWidth="2" />
  </svg>
)

/** ○ 预期：可核对的结果 */
export const Ring = ({ size = 24, className, style }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 26 24" className={className} style={style} aria-hidden>
    <circle cx="13" cy="12" r="8" fill="none" stroke="var(--color-clash1b)" strokeWidth="4" />
    <circle cx="13" cy="12" r="8" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
  </svg>
)

/** ～ 代理区：横波，交给 agent */
export const Wave = ({ size = 40, className, style }: ShapeProps) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 40 20" className={className} style={style} aria-hidden>
    <path d="M2 12 q5 -16 10 0 t10 0 t10 0" fill="none" stroke="var(--color-clash3b)" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/** 荧光标记 价值区：色块骑在文字背后——是标记不是形状，
 * 无描边、微斜、两端比字宽（荧光笔划过的手感），过程就地写清 */
export const Mark = ({ children, className }: { children: ReactNode; className?: string }) => (
  <mark
    className={`-rotate-1 rounded-[3px] bg-clash2a px-[4px] py-[1px] font-bold text-ink [box-decoration-break:clone] ${className ?? ''}`}
  >
    {children}
  </mark>
)

/** ⌇ 脱靶：竖立颤抖——图形入口，读者追随图形进入阅读 */
export const Tremble = ({ size = 24, className, style }: ShapeProps) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 24 34" className={className} style={style} aria-hidden>
    <path
      d="M 12 32 L 8 27 L 16 22 L 8 17 L 16 12 L 12 7 L 14 2"
      fill="none"
      stroke="var(--color-clash1a)"
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
)

/** ＋ 指派学习：位置/预期/场景三样 */
export const Cross = ({ size = 18, className, style }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className} style={style} aria-hidden>
    <path d="M9 1 v16 M1 9 h16" stroke="var(--color-clash2b)" strokeWidth="4" strokeLinecap="round" />
    <path d="M9 1 v16 M1 9 h16" stroke="var(--color-ink)" strokeWidth="1.2" />
  </svg>
)

/** 脱靶标记：图形 + 文字，无容器（图形是第一视觉） */
export function MissMark({ how, looks }: { how: string; looks: string }) {
  return (
    <div className="flex items-start gap-3">
      <Tremble size={22} className="mt-0.5 shrink-0" />
      <div>
        <b className="text-[13px]">脱靶 · {how}</b>
        <p className="m-0 mt-0.5 text-[12px] leading-relaxed text-body">{looks}</p>
      </div>
    </div>
  )
}
