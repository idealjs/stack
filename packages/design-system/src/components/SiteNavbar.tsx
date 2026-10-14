/** SiteNavbar —— 站头：品牌行＋内容行（行首标签＋条目）。
 * 字号走字体系统：品牌 t2（站内最大标题）、行首 t3、条目 content——title 层级高于正文。
 * 行首与条目分列 grid 两栏：条目换行只在右栏内流式，不伸进行首列。
 * 高亮细节由单个 active key 推导，组件外不写样式分支：
 * - 命中品牌＝teal 实底（clash1b）＋ink 描边；未命中＝普通方框。
 * - 命中分块 key，或该分块行内任一条目 key＝分块与行首一起高亮
 *   （纸按压色＋ink 内描边环，选中不借黑）。
 * - 命中条目＝条目高亮：自带 color 用该色实底（章节语义），否则同内描边环。
 * - 行首标签未选中时 hover 浮出纸按压色（与条目同一语言）。 */
import type { ReactNode } from 'react'

export interface NavSectionLink {
  key: string
  label: string
  href: string
}

export interface NavItemLink {
  key: string
  label: string
  href: string
  /** 选中态实底色（如章节色）；缺省用纸按压色＋内描边环 */
  color?: string
  /** 条目文字用等宽（如博客月份） */
  mono?: boolean
}

export interface NavRowGroup {
  /** 对应 NavSectionLink.key：分块与行首随行内选中一起高亮 */
  sectionKey: string
  label: string
  /** 行首标签的落点页；传入则行首渲染为链接（分区着陆页） */
  href?: string
  items: NavItemLink[]
}

const SELECTED = 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]'
const IDLE = 'text-body hover:bg-paper-deep'

function RowLabel({ on, href, children }: { on: boolean; href?: string; children: ReactNode }) {
  // 行首＝t3 标题；占满 grid 首列，三行行首对齐、条目起始位置一致
  const cls = `w-full rounded-lg px-2 py-0.5 text-left text-t3 font-extrabold leading-tight transition-colors ${on ? SELECTED : 'text-ink hover:bg-paper-deep'}`
  if (!href) return <span className={cls}>{children}</span>
  return (
    <a href={href} className={`no-underline ${cls}`}>
      {children}
    </a>
  )
}

export function SiteNavbar({
  brand,
  sections,
  rows,
  active,
  viewTransitionName,
}: {
  brand: NavSectionLink
  /** 第一行分块（顺序即排列） */
  sections: NavSectionLink[]
  /** 第二行起的内容行 */
  rows: NavRowGroup[]
  /** 当前位置 key＝品牌 key / 分块 key / 条目 key */
  active?: string
  viewTransitionName?: string
}) {
  const rowOn = (row: NavRowGroup) =>
    active === row.sectionKey || row.items.some((i) => i.key === active)
  return (
    <header
      className="mb-8 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-hard"
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {/* 第一行：品牌（站内最大标题，t2）＋ 分块 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <a
          href={brand.href}
          className={`mr-2 rounded-lg border-2 px-2.5 py-0.5 font-mono text-t2 font-extrabold leading-snug no-underline transition-colors ${
            active === brand.key
              ? 'border-ink bg-clash1b text-ink'
              : 'border-ink bg-paper text-ink hover:bg-paper-deep'
          }`}
        >
          {brand.label}
        </a>
        {sections.map((s) => {
          const row = rows.find((r) => r.sectionKey === s.key)
          const on = active === s.key || (row ? rowOn(row) : false)
          return (
            <a
              key={s.key}
              href={s.href}
              className={`rounded-lg px-2.5 py-1 text-content font-bold no-underline transition-colors ${on ? SELECTED : IDLE}`}
            >
              {s.label}
            </a>
          )
        })}
      </div>
      {/* 第二行起：行首（t3）与条目（content）分列两栏，条目换行不伸进行首列 */}
      {rows.map((row) => (
        <div
          key={row.sectionKey}
          className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-1.5 border-t border-dashed border-ink/20 pt-2"
        >
          <RowLabel on={rowOn(row)} href={row.href}>
            {row.label}
          </RowLabel>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {row.items.map((item) => {
              const on = item.key === active
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`rounded-lg px-2.5 py-0.5 text-content font-bold leading-snug no-underline transition-colors ${
                    on ? (item.color ? 'text-ink' : SELECTED) : IDLE
                  } ${item.mono ? 'font-mono' : ''}`}
                  style={on && item.color ? { background: item.color } : undefined}
                >
                  {item.label}
                </a>
              )
            })}
          </div>
        </div>
      ))}
    </header>
  )
}
