/** 教程站页面骨架：站头导航跨页常驻（view-transition-name 共享元素，页间不闪烁）。
 * 选中语义：章节项＝该章色（与章头横幅统一）；书架/设计册＝纸按压色＋ink 内描边环。
 * 黑色只属于文字与 logo——hover 与选中都不借黑。 */
import '@stack/design-system'
import type { ReactNode } from 'react'
import type { ChapterId } from '@stack/design-system'
import { CHAPTERS } from './chapters'
import { MONTHS } from '../content/blogs'

/** 设计系统四册（自 design-lab 迁入） */
export type DesignKey = 'design-colors' | 'design-typography' | 'design-symbols' | 'design-components'

const DESIGN: { href: string; label: string; key: DesignKey }[] = [
  { href: '/design-colors.html', label: '颜色', key: 'design-colors' },
  { href: '/design-typography.html', label: '字体', key: 'design-typography' },
  { href: '/design-symbols.html', label: '符号形状', key: 'design-symbols' },
  { href: '/design-components.html', label: '组件', key: 'design-components' },
]

const NAV: { href: string; label: string; id?: ChapterId }[] = [
  { href: '/index.html', label: '书架' },
  ...([1, 2, 3, 4, 5, 6] as ChapterId[]).map((id) => ({
    href: `/ch${id}.html`,
    label: `${id}·${CHAPTERS[id].title}`,
    id,
  })),
]

export function Page({
  title,
  desc,
  active,
  children,
}: {
  /** 章节页标题在章头横幅里，可省 */
  title?: string
  desc?: string
  /** 站头高亮：章节 id / 书架 / 设计系统册 / 博客月（blog-YYYY-MM） */
  active?: ChapterId | 'index' | DesignKey | `blog-${string}`
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8 text-content text-body">
      <header
        className="mb-8 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-hard"
        style={{ viewTransitionName: 'site-header' }}
      >
        {/* 第一行：教程（书架 + 六章） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <a href="/index.html" className="mr-2 rounded-lg bg-ink px-2.5 py-1 font-mono text-[13px] font-bold text-paper no-underline">
            stack·教程
          </a>
          {NAV.map((n) => {
            const on = n.id ? n.id === active : active === 'index'
            return (
              <a
                key={n.href}
                href={n.href}
                className={`rounded-lg px-2.5 py-1 text-[12.5px] font-bold no-underline transition-colors ${
                  on ? (n.id ? 'text-ink' : 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]') : 'text-body hover:bg-paper-deep'
                }`}
                style={on && n.id ? { background: CHAPTERS[n.id].color } : undefined}
              >
                {n.label}
              </a>
            )
          })}
        </div>
        {/* 第二行：设计系统四册 */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-dashed border-ink/20 pt-2">
          <span className="t-small-mute mr-1">设计系统</span>
          {DESIGN.map((n) => {
            const on = n.key === active
            return (
              <a
                key={n.href}
                href={n.href}
                className={`rounded-lg px-2.5 py-1 text-[12.5px] font-bold no-underline transition-colors ${
                  on ? 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'text-body hover:bg-paper-deep'
                }`}
              >
                {n.label}
              </a>
            )
          })}
        </div>
        {/* 第三行：博客（按月分类） */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-dashed border-ink/20 pt-2">
          <span className="t-small-mute mr-1">博客</span>
          {MONTHS.map((m) => {
            const on = active === `blog-${m.key}`
            return (
              <a
                key={m.key}
                href={`/blog-${m.key}.html`}
                className={`rounded-lg px-2.5 py-1 font-mono text-[12.5px] font-bold no-underline transition-colors ${
                  on ? 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]' : 'text-body hover:bg-paper-deep'
                }`}
              >
                {m.key}
              </a>
            )
          })}
        </div>
      </header>
      {(title || desc) && (
        <div className="mb-7">
          {title && <h1 className="m-0 text-t1 font-extrabold text-ink">{title}</h1>}
          {desc && <p className="m-0 mt-2 max-w-[72ch] text-content text-mute">{desc}</p>}
        </div>
      )}
      {children}
      <footer className="mt-12 border-t-2 border-dashed border-ink/15 pt-3 t-small-mute">
        stack·教程 · 孟菲斯 × 拟物卡 · 靶子先行，步骤＝目标＋验收
      </footer>
    </main>
  )
}

export function Section({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2.5 flex flex-wrap items-baseline gap-2">
        <span className="t-small-strong">{label}</span>
        {note && <i className="t-small-mute not-italic">{note}</i>}
      </h2>
      {children}
    </section>
  )
}
