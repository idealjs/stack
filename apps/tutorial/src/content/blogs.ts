/** 博客内容注册表——markdown 原文随仓，日期取首提日期（git） */
import gorzil from './blog/gorzil.md?raw'
import sapling from './blog/sapling_transformer.md?raw'

export interface BlogPost {
  slug: string
  title: string
  /** YYYY-MM-DD（首提日期） */
  date: string
  author: string
  raw: string
}

export const POSTS: BlogPost[] = [
  {
    slug: 'gorzil',
    title: 'gorzil：面向多人协作的 AI 原生工具开发自述',
    date: '2026-08-19',
    author: 'cqh963852',
    raw: gorzil,
  },
  {
    slug: 'sapling-transformer',
    title: 'sapling_transformer 近半月开发自述',
    date: '2025-07-17',
    author: 'cqh963852',
    raw: sapling,
  },
]

/** 按月分组（navbar 第三行的日期分类） */
export interface BlogMonth {
  key: string // YYYY-MM
  posts: BlogPost[]
}

export const MONTHS: BlogMonth[] = [...POSTS]
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .reduce<BlogMonth[]>((acc, p) => {
    const key = p.date.slice(0, 7)
    const last = acc[acc.length - 1]
    if (last && last.key === key) last.posts.push(p)
    else acc.push({ key, posts: [p] })
    return acc
  }, [])

/** 文章所属月（用于文章页 navbar 高亮） */
export const monthOf = (slug: string) => POSTS.find((p) => p.slug === slug)!.date.slice(0, 7)
