import * as styles from '@idealjs/stack-ui-kit/styles'
import { BrickDot, Mark, Tri } from '@idealjs/stack-ui-kit'
import type { ReactNode } from 'react'
import { MONTHS, monthOf, POSTS } from '../content/blogs'
import { type PageKey, relHref } from '../lib/pages'
import { Page, Section } from '../lib/ui'

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let i = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) parts.push(<b key={i++}>{t.slice(2, -2)}</b>)
    else
      parts.push(
        <code
          key={i++}
          className={`rounded ${styles.bgPaperDeep} px-1 py-0.5 font-mono text-[0.9em] ${styles.textInk}`}
        >
          {t.slice(1, -1)}
        </code>,
      )
    last = m.index + t.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function Markdown({ raw }: { raw: string }) {
  const lines = raw.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n')
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const ln = lines[i]
    if (!ln.trim() || ln.trim() === '') {
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
          className={`overflow-x-auto rounded-xl border-2 ${styles.borderInk} ${styles.bgInk} p-4 font-mono ${styles.textSmall} leading-relaxed ${styles.textPaper} ${styles.shadowInk}`}
        >
          {buf.join('\n')}
        </pre>,
      )
      continue
    }
    if (ln.startsWith('> ')) {
      out.push(
        <blockquote
          key={key++}
          className={`m-0 rounded-xl border-2 border-dashed ${styles.borderInk40} ${styles.bgPaperDeep}/60 p-4`}
        >
          <p className={`m-0 ${styles.textContent} ${styles.textBody}`}>{inline(ln.slice(2))}</p>
        </blockquote>,
      )
      i++
      continue
    }
    if (ln.startsWith('# ')) {
      out.push(
        <h1 key={key++} className={`m-0 ${styles.textT1} font-extrabold ${styles.textInk}`}>
          {inline(ln.slice(2))}
        </h1>,
      )
      i++
      continue
    }
    if (ln.startsWith('## ')) {
      out.push(
        <h2
          key={key++}
          className={`m-0 flex items-center gap-2 ${styles.textT2} font-extrabold ${styles.textInk}`}
        >
          <Tri size={13} />
          {inline(ln.slice(3))}
        </h2>,
      )
      i++
      continue
    }
    if (ln.startsWith('### ')) {
      out.push(
        <h3 key={key++} className={`m-0 ${styles.textT3} font-bold ${styles.textInk}`}>
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
            // biome-ignore lint/suspicious/noArrayIndexKey: 静态 markdown 列表渲染，顺序恒定、文本可重复
            <li key={n} className="flex items-start gap-2.5">
              <span className="mt-[9px] flex shrink-0">
                <BrickDot size={11} on={ordered} />
              </span>
              <span className={`${styles.textContent} ${styles.textBody}`}>{inline(it)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

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
      <p key={key++} className={`m-0 ${styles.textContent} ${styles.textBody}`}>
        {inline(buf.join(' '))}
      </p>,
    )
  }
  return <div className="space-y-5">{out}</div>
}

export function BlogCard({ post, from }: { post: (typeof POSTS)[number]; from: PageKey }) {
  const quote =
    post.raw.split('\n').find((l) => l.startsWith('> ') && l.trim() !== '') ??
    post.raw
      .split('\n')
      .find(
        (l) => l.trim() && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('---'),
      ) ??
    ''
  return (
    <span className={`${styles.hoverHost} block w-fit`}>
      <a
        href={relHref(from, `blog-${post.slug}`)}
        className={`${styles.hoverableShadow} block w-[420px] rounded-2xl border-2 ${styles.borderInk} ${styles.bgPaper} p-5 no-underline ${styles.shadowInk} transition-[translate,box-shadow] duration-150`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`rounded-full ${styles.bgClash3b15} px-2.5 py-0.5 font-mono ${styles.tSmallStrong}`}
          >
            {post.date}
          </span>
          <span className={`${styles.tSmallMute}`}>{post.author}</span>
        </div>
        <h2 className={`m-0 mt-3 ${styles.textT3} font-extrabold ${styles.textInk}`}>
          {post.title}
        </h2>
        <p
          className={`m-0 mt-2 line-clamp-2 ${styles.textSmall} leading-relaxed ${styles.textBody}`}
        >
          {quote.replace(/^> /, '').slice(0, 90)}…
        </p>
        <p className={`m-0 mt-3 ${styles.tSmallStrong}`}>
          阅读全文 <span aria-hidden>→</span>
        </p>
      </a>
    </span>
  )
}

export function BlogDatePage({ dateKey }: { dateKey: string }) {
  const month = MONTHS.find((m) => m.key === dateKey)
  if (!month) throw new Error(`unknown month: ${dateKey}`)
  return (
    <Page
      active={`blog-${dateKey}`}
      title={`博客 · ${dateKey}`}
      desc={`本月 ${month.posts.length} 篇——开发自述与工程笔记。`}
    >
      <Section label="本月文章" note="点卡片进入文章">
        <div className="flex flex-wrap gap-6">
          {month.posts.map((p) => (
            <BlogCard key={p.slug} post={p} from={`blog-${dateKey}`} />
          ))}
        </div>
      </Section>
    </Page>
  )
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = POSTS.find((p) => p.slug === slug)
  if (!post) throw new Error(`unknown post: ${slug}`)
  return (
    <Page active={`blog-${monthOf(slug)}`} chain={`blog-${slug}`}>
      <div
        className={`relative overflow-hidden rounded-2xl border-2 ${styles.borderInk} ${styles.bgPaper} p-5 ${styles.shadowInk}`}
      >
        <span
          className={`${styles.tDisplay} pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none`}
          aria-hidden
        >
          {post.date.slice(2, 4)}
        </span>
        <h1 className={`m-0 max-w-[46ch] ${styles.textT1} font-extrabold ${styles.textInk}`}>
          {post.title}
        </h1>
        <p className="m-0 mt-3 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full ${styles.bgClash3b15} px-2.5 py-0.5 font-mono ${styles.tSmallStrong}`}
          >
            {post.date}
          </span>
          <span className={`${styles.tSmallMute}`}>{post.author}</span>
          <Mark className={`${styles.tSmallStrong}`}>开发自述</Mark>
        </p>
      </div>
      <article className="mt-8 max-w-[76ch]">
        <Markdown raw={post.raw} />
      </article>
      <div className="mt-10 flex items-center justify-between">
        <a
          href={relHref(`blog-${slug}`, `blog-${monthOf(slug)}`)}
          className={`rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} px-4 py-2 ${styles.textSmall} font-bold ${styles.textInk} no-underline ${styles.shadowInk}`}
        >
          ← 返回 {monthOf(slug)}
        </a>
        <a
          href={relHref(`blog-${slug}`, 'index')}
          className={`rounded-xl border-2 ${styles.borderInk} ${styles.bgInk} px-4 py-2 ${styles.textSmall} font-bold ${styles.textPaper} no-underline`}
        >
          返回首页
        </a>
      </div>
    </Page>
  )
}
