/** ShadowButton —— 孟菲斯按压按钮：按压三部曲是本组件存在的意义。
 * 规格与 .learning-action 同源，投影比卡片（shadow-hard 5px）小一号，是按钮的体量：
 * - 静置：paper / tone 实底＋ink 2px 描边＋硬投影 3px 3px；
 * - hover：浮起 2px，投影跟涨到 5px（阴影随位移，同 Button 的跟随规格）；
 * - active 按压：朝阴影方向压进 translate(2px,2px)，投影收到 1px。
 * 有 href 渲染链接（a），无 href 渲染动作按钮（button）；disabled＝虚线描边占位，不动不起。
 * 类配方 shadowButtonClasses 一并导出：站头汉堡/× 是 <label htmlFor>（纯 CSS 抽屉开关），
 * 换不成 a/button，外部元素与组件共用同一份配方，数字只写这一处，避免两份漂移。 */
import type { MouseEventHandler, ReactNode } from 'react'

/** 实底色：paper（默认）或 clash 六色 token 名 */
export type ShadowButtonTone = 'paper' | 'clash1a' | 'clash1b' | 'clash2a' | 'clash2b' | 'clash3a' | 'clash3b'

const TONE_BG: Record<ShadowButtonTone, string> = {
  paper: 'bg-paper',
  clash1a: 'bg-clash1a',
  clash1b: 'bg-clash1b',
  clash2a: 'bg-clash2a',
  clash2b: 'bg-clash2b',
  clash3a: 'bg-clash3a',
  clash3b: 'bg-clash3b',
}

/** 结构段：描边/按压底色语言/focus 环（clash3b outline，对齐 learning 组件）。
 * 不含 display 与投影——display 由渲染形态自定（组件 inline-flex、label 方寸自定）。 */
export const SHADOW_BUTTON_BASE =
  'cursor-pointer items-center justify-center border-2 border-ink text-ink no-underline transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-[3px] focus-visible:outline-clash3b focus-visible:outline-offset-2'

/** 静置段：硬投影 3px 3px */
export const SHADOW_BUTTON_REST = 'shadow-[3px_3px_0_var(--color-ink)]'

/** hover 段：浮起 2px，投影 3→5 */
export const SHADOW_BUTTON_HOVER = 'hover:-translate-y-[2px] hover:shadow-[5px_5px_0_var(--color-ink)]'

/** active 段：压进 translate(2px,2px)，投影收到 1px */
export const SHADOW_BUTTON_ACTIVE = 'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)]'

/** 高亮段（导航选中语义）：纸按压底＋ink 内描边环；内环随三部曲全程挂在投影里，
 * 与按压位移叠加不打架（外影照常 3→5→1，环不动） */
const RING_REST = 'bg-paper-deep shadow-[inset_0_0_0_2px_var(--color-ink),3px_3px_0_var(--color-ink)]'
const RING_HOVER = 'hover:-translate-y-[2px] hover:shadow-[inset_0_0_0_2px_var(--color-ink),5px_5px_0_var(--color-ink)]'
const RING_ACTIVE = 'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[inset_0_0_0_2px_var(--color-ink),1px_1px_0_var(--color-ink)]'

const SIZE = {
  /** 标本/CTA 体量（对齐 Button） */
  md: 'rounded-xl px-4 py-2 text-small font-bold',
  /** 导航紧凑体量（站头分块链） */
  sm: 'rounded-lg px-2.5 py-1 text-content font-bold',
  /** 方寸自定：尺寸/字号类由调用方给（汉堡 size-10、× size-8 等方形 label） */
  none: 'rounded-lg',
} as const

export interface ShadowButtonClassesOptions {
  /** 实底色；active 高亮时被纸按压底覆盖 */
  tone?: ShadowButtonTone
  /** 高亮（active key 命中）：paper-deep 底＋ink 内描边环 */
  active?: boolean
  /** md 标本体 / sm 导航紧凑 / none 方寸自定 */
  size?: keyof typeof SIZE
  /** 追加类（margins、font-mono 等） */
  className?: string
}

/** 类配方：组件与外部 <label>（纯 CSS 抽屉开关）共用，同一份三部曲数字。 */
export function shadowButtonClasses({
  tone = 'paper',
  active = false,
  size = 'md',
  className = '',
}: ShadowButtonClassesOptions = {}) {
  return [
    SHADOW_BUTTON_BASE,
    SIZE[size],
    active ? RING_REST : TONE_BG[tone],
    active ? `${RING_HOVER} ${RING_ACTIVE}` : `${SHADOW_BUTTON_REST} ${SHADOW_BUTTON_HOVER} ${SHADOW_BUTTON_ACTIVE}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export interface ShadowButtonProps {
  /** 实底色（paper 或 clash 色板 token 名）；active 高亮时被纸按压底覆盖 */
  tone?: ShadowButtonTone
  /** 高亮（选中）：paper-deep 底＋ink 内描边环，与按压位移叠加不打架 */
  active?: boolean
  /** 跳转目标：渲染为链接（a）；缺省渲染为动作按钮（button[type=button]） */
  href?: string
  /** 未上线/敬请期待：虚线描边占位，不动不起 */
  disabled?: boolean
  /** md 标本体（默认）/ sm 导航紧凑 / none 方寸自定 */
  size?: keyof typeof SIZE
  /** 追加类（margins、font-mono 等） */
  className?: string
  children: ReactNode
  onClick?: MouseEventHandler<HTMLElement>
}

export function ShadowButton({
  tone = 'paper',
  active = false,
  href,
  disabled = false,
  size = 'md',
  className = '',
  children,
  onClick,
}: ShadowButtonProps) {
  const cls = `inline-flex ${shadowButtonClasses({ tone, active, size, className })}`
  if (disabled) {
    return (
      <span
        data-comp="shadow-button"
        aria-disabled
        className="inline-flex cursor-not-allowed items-center rounded-xl border-2 border-dashed border-ink/40 px-4 py-2 text-small font-bold text-mute"
      >
        {children}
      </span>
    )
  }
  if (href) {
    return (
      <a href={href} data-comp="shadow-button" className={cls}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" data-comp="shadow-button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
