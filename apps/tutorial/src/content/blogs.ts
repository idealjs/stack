
import gorzil from './blog/gorzil.md?raw'
import sapling from './blog/sapling_transformer.md?raw'

export interface BlogPost {
  slug: string
  title: string
  
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


export interface BlogMonth {
  key: string 
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


export const monthOf = (slug: string) => POSTS.find((p) => p.slug === slug)!.date.slice(0, 7)
