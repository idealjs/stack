/** 教程站页面骨架：站头导航跨页常驻（view-transition-name 共享元素，页间不闪烁） */
import type { ReactNode } from 'react'
import type { ChapterId } from './types'
import { CHAPTERS } from './chapters'
import '../styles/tokens.css'

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
  /** 站头高亮的章节；书架页不传 */
  active?: ChapterId
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8">
      <header
        className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-hard"
        style={{ viewTransitionName: 'site-header' }}
      >
        <a href="/index.html" className="mr-2 rounded-lg bg-ink px-2.5 py-1 font-mono text-[13px] font-bold text-paper no-underline">
          stack·教程
        </a>
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className={`rounded-lg px-2.5 py-1 text-[12.5px] font-bold no-underline transition-colors ${
              n.id === active ? 'bg-clash2a text-ink' : 'text-body hover:bg-black/5'
            }`}
          >
            {n.label}
          </a>
        ))}
      </header>
      {(title || desc) && (
        <div className="mb-7 mt-7">
          {title && <h1 className="m-0 text-[28px] font-extrabold text-ink">{title}</h1>}
          {desc && <p className="m-0 mt-1 text-[14.5px] text-[#6b6b6b]">{desc}</p>}
        </div>
      )}
      {children}
      <footer className="mt-12 border-t-2 border-dashed border-ink/15 pt-3 text-[12px] text-[#8a8a8a]">
        stack·教程 · 孟菲斯 × 拟物卡 · 靶子先行，步骤＝目标＋验收
      </footer>
    </main>
  )
}

export function Section({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-[13.5px] font-bold text-ink">
        {label}
        {note && <i className="ml-2 text-[11.5px] font-normal not-italic text-[#6b6b6b]">{note}</i>}
      </h2>
      {children}
    </section>
  )
}
