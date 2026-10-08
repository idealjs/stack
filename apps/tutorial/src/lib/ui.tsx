/** 教程站页面骨架：站头导航跨页常驻（view-transition-name 共享元素，页间不闪烁）。
 * 选中项背景色＝该章色（与章头 title 横幅统一）；书架/设计册选中为 ink。 */
import type { ReactNode } from 'react'
import type { ChapterId } from './types'
import { CHAPTERS } from './chapters'
import '../styles/tokens.css'

/** 设计系统四册（自 design-lab 迁入） */
export type DesignKey = 'design-colors' | 'design-symbols' | 'design-components' | 'design-examples'

const DESIGN: { href: string; label: string; key: DesignKey }[] = [
  { href: '/design-colors.html', label: '颜色', key: 'design-colors' },
  { href: '/design-symbols.html', label: '符号形状', key: 'design-symbols' },
  { href: '/design-components.html', label: '组件', key: 'design-components' },
  { href: '/design-examples.html', label: '样例', key: 'design-examples' },
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
  /** 站头高亮：章节 id / 书架 / 设计系统册 */
  active?: ChapterId | 'index' | DesignKey
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8 text-content text-body">
      <header
        className="mb-8 flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-hard"
        style={{ viewTransitionName: 'site-header' }}
      >
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
                on ? (n.id ? 'text-ink' : 'bg-ink text-paper') : 'text-body hover:bg-black/5'
              }`}
              style={on && n.id ? { background: CHAPTERS[n.id].color } : undefined}
            >
              {n.label}
            </a>
          )
        })}
        <span className="mx-1 h-4 w-[2px] rounded bg-ink/20" aria-hidden />
        {DESIGN.map((n) => {
          const on = n.key === active
          return (
            <a
              key={n.href}
              href={n.href}
              className={`rounded-lg px-2.5 py-1 text-[12.5px] font-bold no-underline transition-colors ${
                on ? 'bg-ink text-paper' : 'text-body hover:bg-black/5'
              }`}
            >
              设计·{n.label}
            </a>
          )
        })}
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
