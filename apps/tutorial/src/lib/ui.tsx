import '../design-system'
import type { ReactNode } from 'react'
import type { ChapterId, NavItemLink, NavRowGroup } from '../design-system'
import { SitePage } from '@stack/site-kit'
import { CHAPTERS } from './chapters'
import { MONTHS } from '../content/blogs'

export type DesignKey =
  | 'design-colors'
  | 'design-typography'
  | 'design-symbols'
  | 'design-components'
  | 'design-shadow'

const DESIGN: { href: string; label: string; key: DesignKey }[] = [
  { href: '/design-colors.html', label: '颜色', key: 'design-colors' },
  { href: '/design-typography.html', label: '字体', key: 'design-typography' },
  { href: '/design-symbols.html', label: '符号形状', key: 'design-symbols' },
  { href: '/design-components.html', label: '组件', key: 'design-components' },
  { href: '/design-shadow.html', label: '阴影', key: 'design-shadow' },
]

const CHAPTER_ITEMS: NavItemLink[] = ([1, 2, 3, 4, 5, 6] as ChapterId[]).map((id) => ({
  key: `ch${id}`,
  label: CHAPTERS[id].title,
  href: `/ch${id}.html`,
  color: CHAPTERS[id].color,
}))

const NAV_ROWS: NavRowGroup[] = [
  { sectionKey: 'tutorial', label: '全栈教程', href: '/learn.html', items: CHAPTER_ITEMS },
  {
    sectionKey: 'blog',
    label: '博客',
    href: '/blog.html',
    items: MONTHS.map((m) => ({
      key: `blog-${m.key}`,
      label: m.key,
      href: `/blog-${m.key}.html`,
      mono: true,
    })),
  },
  {
    sectionKey: 'design',
    label: '设计系统',
    href: '/design.html',
    items: DESIGN.map((n) => ({ key: n.key, label: n.label, href: n.href })),
  },
  {
    sectionKey: 'practice',
    label: '在线练习',
    href: '/practice.html',
    items: [{ key: 'practice-starter', label: '重建中', href: '/practice.html', mono: true }],
  },
]

export function Page({
  title,
  subtitle,
  desc,
  active,
  children,
}: {
  title?: string
  subtitle?: string
  desc?: string
  active?:
    | ChapterId
    | 'index'
    | 'learn'
    | 'blog'
    | 'design'
    | 'practice'
    | DesignKey
    | `blog-${string}`
  children: ReactNode
}) {
  const activeKey =
    active === 'index'
      ? 'index'
      : active === 'learn'
        ? 'tutorial'
        : typeof active === 'number'
          ? `ch${active}`
          : active

  return (
    <SitePage
      nav={{
        brand: { key: 'index', label: 'idealjs stack', href: '/index.html' },
        rows: NAV_ROWS,
      }}
      active={activeKey}
      viewTransitionName="site-header"
      title={title}
      subtitle={subtitle}
      desc={desc}
    >
      {children}
    </SitePage>
  )
}

export { Section } from '@stack/site-kit'
