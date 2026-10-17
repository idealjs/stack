/** 博客页——日期页（月内文章卡片预览）+ 文章页（markdown 风格化渲染）。
 * 迷你 md 解析：#/##/###、> 引言、``` 代码块、-/* 列表、**粗体**、`行内码`。 */
import type { ReactNode } from 'react'
import { Page, Section } from '../lib/ui'
import { MONTHS, POSTS, monthOf } from '../content/blogs'
import { BrickDot, Mark, Tri } from '@stack/design-system'

/* ── 行内：**粗体** 与 `行内码` ── */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) parts.push(<b key={i++}>{t.slice(2, -2)}</b>)
    else parts.push(
      <code key={i++} className="rounded bg-paper-deep px-1 py-0.5 font-mono text-[0.9em] text-ink">
        {t.slice(1, -1)}
      </code>,
    )
    last = m.index + t.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/* ── 块级渲染（对齐字体系统：h2=t2、h3=t3、正文=content、列表=积木点） ── */
function Markdown({ raw }: { raw: string }) {
  const lines = raw.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n')
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const ln = lines[i]
    if (!ln.trim() || ln.trim() === '{/* truncate */}') {
      i++
      continue
    }
    if (ln.startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      out.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-xl border-2 border-ink bg-ink p-4 font-mono text-small leading-relaxed text-paper shadow-ink"
        >
          {buf.join('\n')}
        </pre>,
      )
      continue
    }
    if (ln.startsWith('> ')) {
      out.push(
        <blockquote key={key++} className="m-0 rounded-xl border-2 border-dashed border-ink/40 bg-paper-deep/60 p-4">
          <p className="m-0 text-content text-body">{inline(ln.slice(2))}</p>
        </blockquote>,
      )
      i++
      continue
    }
    if (ln.startsWith('# ')) {
      out.push(
        <h1 key={key++} className="m-0 text-t1 font-extrabold text-ink">
          {inline(ln.slice(2))}
        </h1>,
      )
      i++
      continue
    }
    if (ln.startsWith('## ')) {
      out.push(
        <h2 key={key++} className="m-0 flex items-center gap-2 text-t2 font-extrabold text-ink">
          <Tri size={13} />
          {inline(ln.slice(3))}
        </h2>,
      )
      i++
      continue
    }
    if (ln.startsWith('### ')) {
      out.push(
        <h3 key={key++} className="m-0 text-t3 font-bold text-ink">
          {inline(ln.slice(4))}
        </h3>,
      )
      i++
      continue
    }
    if (/^\d+\. |- /.test(ln)) {
      const items: string[] = []
      const ordered = /^\d+\. /.test(ln)
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : /^- /.test(lines[i]))) {
        items.push(lines[i].replace(/^(\d+\.|-) /, ''))
        i++
      }
      out.push(
        <ul key={key++} className="m-0 list-none space-y-2 p-0">
          {items.map((it, n) => (
            <li key={n} className="flex items-start gap-2.5">
              <span className="mt-[9px] flex shrink-0">
                <BrickDot size={11} on={ordered} />
              </span>
              <span className="text-content text-body">{inline(it)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }
    // 段落：连续非格式行合并
    const buf: string[] = [ln]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3} |> |```|\d+\. |- |\/\* |\{\/\*)/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    out.push(
      <p key={key++} className="m-0 text-content text-body">
        {inline(buf.join(' '))}
      </p>,
    )
  }
  return <div className="space-y-5">{out}</div>
}

/* ── 文章卡片（日期页预览） ── */
export function BlogCard({ post }: { post: (typeof POSTS)[number] }) {
  const quote =
    post.raw
      .split('\n')
      .find((l) => l.startsWith('> ') && l.trim() !== '{/* truncate */}') ??
    post.raw.split('\n').find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('---')) ??
    ''
  return (
    <a
      href={`/blog-${post.slug}.html`}
      className="block w-[420px] rounded-2xl border-2 border-ink bg-paper p-5 no-underline shadow-ink transition-transform duration-150 hover:-translate-y-[3px]"
    >
      <div className="flex items-center gap-2.5">
        <span className="rounded-full bg-clash3b/15 px-2.5 py-0.5 font-mono t-small-strong">{post.date}</span>
        <span className="t-small-mute">{post.author}</span>
      </div>
      <h2 className="m-0 mt-3 text-t3 font-extrabold text-ink">{post.title}</h2>
      <p className="m-0 mt-2 line-clamp-2 text-small leading-relaxed text-body">{quote.replace(/^> /, '').slice(0, 90)}…</p>
      <p className="m-0 mt-3 t-small-strong">
        阅读全文 <span aria-hidden>→</span>
      </p>
    </a>
  )
}

/* ── 日期页：某月的文章卡片 ── */
export function BlogDatePage({ dateKey }: { dateKey: string }) {
  const month = MONTHS.find((m) => m.key === dateKey)!
  return (
    <Page
      active={`blog-${dateKey}`}
      title={`博客 · ${dateKey}`}
      desc={`本月 ${month.posts.length} 篇——开发自述与工程笔记。`}
    >
      <Section label="本月文章" note="点卡片进入文章">
        <div className="flex flex-wrap gap-6">
          {month.posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </Section>
    </Page>
  )
}

/* ── 文章页 ── */
export function BlogPostPage({ slug }: { slug: string }) {
  const post = POSTS.find((p) => p.slug === slug)!
  return (
    <Page active={`blog-${monthOf(slug)}`}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-paper p-5 shadow-ink">
        <span className="t-display pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none" aria-hidden>
          {post.date.slice(2, 4)}
        </span>
        <h1 className="m-0 max-w-[46ch] text-t1 font-extrabold text-ink">{post.title}</h1>
        <p className="m-0 mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-clash3b/15 px-2.5 py-0.5 font-mono t-small-strong">{post.date}</span>
          <span className="t-small-mute">{post.author}</span>
          <Mark className="t-small-strong">开发自述</Mark>
        </p>
      </div>
      <article className="mt-8 max-w-[76ch]">
        <Markdown raw={post.raw} />
      </article>
      <div className="mt-10 flex items-center justify-between">
        <a
          href={`/blog-${monthOf(slug)}.html`}
          className="rounded-xl border-2 border-ink bg-paper px-4 py-2 text-small font-bold text-ink no-underline shadow-ink"
        >
          ← 返回 {monthOf(slug)}
        </a>
        <a href="/index.html" className="rounded-xl border-2 border-ink bg-ink px-4 py-2 text-small font-bold text-paper no-underline">
          返回首页
        </a>
      </div>
    </Page>
  )
}
