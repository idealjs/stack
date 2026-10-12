/** Button —— 孟菲斯按钮：hover 时上层浮起 3px（-translate-y）、
 * 下层硬阴影 5px→8px 跟随位移（shadow-hard→shadow-hard-lift），两层反向分开。
 * tone＝clash 色板实底＋ink 描边＋ink 文字；有 href 渲染链接（a），
 * 无 href 渲染动作按钮（button）；disabled＝虚线描边占位（敬请期待），不动不起。
 * 与 MemphisCard 的 -3px 拿起规格一致；box-shadow 一并过渡，阴影位移平滑。 */
import type { ReactNode } from 'react'

const TONE_BG = {
  clash1a: 'bg-clash1a',
  clash1b: 'bg-clash1b',
  clash2a: 'bg-clash2a',
  clash2b: 'bg-clash2b',
  clash3a: 'bg-clash3a',
  clash3b: 'bg-clash3b',
} as const

const BASE =
  'inline-block cursor-pointer rounded-xl border-2 border-ink px-4 py-2 text-small font-bold text-ink no-underline shadow-hard transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-hard-lift'

export function Button({
  tone = 'clash1a',
  href,
  disabled = false,
  children,
}: {
  /** 实底色（clash 色板 token 名）；disabled 时忽略 */
  tone?: keyof typeof TONE_BG
  /** 跳转目标：渲染为链接；缺省且未 disabled 时渲染为动作按钮（button） */
  href?: string
  /** 未上线/敬请期待：虚线描边占位，无 hover 位移 */
  disabled?: boolean
  children: ReactNode
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="inline-block cursor-not-allowed rounded-xl border-2 border-dashed border-ink/40 px-4 py-2 text-small font-bold text-mute"
      >
        {children}
      </span>
    )
  }
  if (href) {
    return (
      <a href={href} className={`${BASE} ${TONE_BG[tone]}`}>
        {children}
      </a>
    )
  }
  return <button type="button" className={`${BASE} ${TONE_BG[tone]}`}>{children}</button>
}
