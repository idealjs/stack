/** 页面公共骨架 */
import type { ReactNode } from 'react'
import '../styles/tokens.css'

export function Page({ tag, title, desc, children }: { tag: string; title: string; desc: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10">
      <header>
        <span className="inline-block rounded-lg bg-[#efe6fb] px-3 py-1 font-mono text-[15px] font-bold text-[#6d28d9]">{tag}</span>
        <h1 className="mt-2 mb-1 text-[28px] font-extrabold text-ink">{title}</h1>
        <p className="m-0 text-[14.5px] text-[#6b6b6b]">{desc}</p>
      </header>
      <div className="mt-8">{children}</div>
      <footer className="mt-12 border-t-2 border-dashed border-ink/15 pt-3 text-[12px] text-[#8a8a8a]">
        design-lab · 孟菲斯 × 拟物卡 · stack idealjs ·{' '}
        <a className="underline" href="/index.html">
          返回目录
        </a>
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
