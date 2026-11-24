import type { ChapterId, FlipTarget } from '@idealjs/stack-site-ui-kit'
import { MONTHS } from '../content/blogs'
import { CHAPTERS } from './chapters'

export type PageKey =
  | 'index'
  | 'learn'
  | `ch${ChapterId}`
  | 'html'
  | 'css'
  | 'javascript'
  | 'blog'
  | `blog-${string}`
  | 'design'
  | 'design-colors'
  | 'design-typography'
  | 'design-symbols'
  | 'design-components'
  | 'design-shadow'
  | 'practice'

export interface PageMeta {
  key: PageKey
  path: string
  title: string
  color: string
  mono?: boolean
}

const CHAPTER_IDS = [1, 2, 3, 4, 5, 6, 7] as ChapterId[]

const chapterPages: PageMeta[] = CHAPTER_IDS.map((id) => ({
  key: `ch${id}`,
  path: `tutorial/ch${id}.html`,
  title: `第 ${id} 章 · ${CHAPTERS[id].title}`,
  color: CHAPTERS[id].color,
}))

const skillPages: PageMeta[] = [
  { key: 'html', path: 'skills/html.html', title: 'HTML', color: 'var(--color-clash2a)' },
  { key: 'css', path: 'skills/css.html', title: 'CSS', color: 'var(--color-clash2b)' },
  {
    key: 'javascript',
    path: 'skills/javascript.html',
    title: 'JavaScript',
    color: 'var(--color-clash3a)',
  },
]

const blogPages: PageMeta[] = [...MONTHS]
  .sort((a, b) => (a.key < b.key ? -1 : 1))
  .flatMap((month) => [
    {
      key: `blog-${month.key}`,
      path: `blog/${month.key}.html`,
      title: month.key,
      color: 'var(--color-paper-deep)',
      mono: true,
    },
    ...[...month.posts]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map(
        (post): PageMeta => ({
          key: `blog-${post.slug}`,
          path: `blog/${post.slug}.html`,
          title: post.title,
          color: 'var(--color-clash3b)',
        }),
      ),
  ])

const DESIGN_PAGES: { key: PageKey; leaf: string; title: string; color: string }[] = [
  { key: 'design-colors', leaf: 'colors', title: '颜色', color: 'var(--color-clash1a)' },
  { key: 'design-typography', leaf: 'typography', title: '字体', color: 'var(--color-clash1b)' },
  { key: 'design-symbols', leaf: 'symbols', title: '符号形状', color: 'var(--color-clash2a)' },
  { key: 'design-components', leaf: 'components', title: '组件', color: 'var(--color-clash2b)' },
  { key: 'design-shadow', leaf: 'shadow', title: '阴影', color: 'var(--color-clash3a)' },
]

export const PAGES: PageMeta[] = [
  { key: 'index', path: 'index.html', title: '首页', color: 'var(--color-clash1a)' },
  { key: 'learn', path: 'tutorial/index.html', title: '全栈教程', color: 'var(--color-clash1b)' },
  ...chapterPages,
  ...skillPages,
  { key: 'blog', path: 'blog/index.html', title: '博客', color: 'var(--color-clash3b)' },
  ...blogPages,
  { key: 'design', path: 'design/index.html', title: '设计系统', color: 'var(--color-clash2b)' },
  ...DESIGN_PAGES.map((p) => ({ ...p, path: `design/${p.leaf}.html` })),
  {
    key: 'practice',
    path: 'practice/index.html',
    title: '在线练习',
    color: 'var(--color-clash3b)',
  },
]

const BY_KEY = new Map(PAGES.map((page) => [page.key as string, page]))

export const pageOf = (key: PageKey): PageMeta | undefined => BY_KEY.get(key)

export const relHref = (from: PageKey, to: PageKey): string => {
  const source = BY_KEY.get(from)
  const target = BY_KEY.get(to)
  if (source === undefined || target === undefined) return '#'
  const prefix = source.path.includes('/') ? '../' : './'
  return `${prefix}${target.path}`
}

export const neighborsOf = (key: PageKey): { prev: PageMeta; next: PageMeta } | undefined => {
  const index = PAGES.findIndex((page) => page.key === key)
  if (index === -1) return undefined
  return {
    prev: PAGES[(index - 1 + PAGES.length) % PAGES.length],
    next: PAGES[(index + 1) % PAGES.length],
  }
}

export const DESIGN_KEYS = DESIGN_PAGES.map((p) => p.key)

export const flipTargetsOf = (from: PageKey): { prev?: FlipTarget; next?: FlipTarget } => {
  const neighbors = neighborsOf(from)
  if (neighbors === undefined) return {}
  const to = (meta: PageMeta): FlipTarget => ({
    href: relHref(from, meta.key),
    meta: { title: meta.title, color: meta.color },
  })
  return { prev: to(neighbors.prev), next: to(neighbors.next) }
}
