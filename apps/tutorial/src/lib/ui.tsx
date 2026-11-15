import '../design-system'
import type { ReactNode } from 'react'
import { PageTurnBar } from '../components/PageTurnBar'
import { MONTHS } from '../content/blogs'
import type {
  ChapterId,
  NavItemLink,
  NavRowGroup,
  SiteFooterGroup,
  SiteNav,
} from '../design-system'
import { PageFlipZone, SitePage } from '../design-system'
import { CHAPTERS } from './chapters'
import { flipTargetsOf, type PageKey, relHref } from './pages'

export type DesignKey =
  | 'design-colors'
  | 'design-typography'
  | 'design-symbols'
  | 'design-components'
  | 'design-shadow'

export type SkillKey = 'html' | 'css' | 'javascript'

const DESIGN: { label: string; key: DesignKey }[] = [
  { label: '颜色', key: 'design-colors' },
  { label: '字体', key: 'design-typography' },
  { label: '符号形状', key: 'design-symbols' },
  { label: '组件', key: 'design-components' },
  { label: '阴影', key: 'design-shadow' },
]

const SKILLS: { label: string; key: SkillKey }[] = [
  { label: 'HTML', key: 'html' },
  { label: 'CSS', key: 'css' },
  { label: 'JavaScript', key: 'javascript' },
]

export const FOOTER_GROUPS: SiteFooterGroup[] = [
  { label: '友情链接', links: [{ href: 'https://idealjs.com', label: 'idealjs.com' }] },
  {
    label: '社交网络',
    links: [{ href: 'https://github.com/idealjs', label: 'GitHub' }],
  },
  {
    label: '源码',
    links: [
      { href: 'https://gitea.idealjs.com/idealjs/stack', label: 'Gitea' },
      { href: 'https://github.com/idealjs/stack', label: 'GitHub 镜像' },
    ],
  },
]

const chapterItems = (from: PageKey): NavItemLink[] =>
  ([1, 2, 3, 4, 5, 6, 7] as ChapterId[]).map((id) => ({
    key: `ch${id}`,
    label: CHAPTERS[id].title,
    href: relHref(from, `ch${id}`),
    color: CHAPTERS[id].color,
  }))

export const siteNavFor = (from: PageKey): SiteNav => ({
  brand: { key: 'index', label: 'idealjs stack', href: relHref(from, 'index') },
  rows: [
    {
      sectionKey: 'tutorial',
      label: '全栈教程',
      href: relHref(from, 'learn'),
      items: chapterItems(from),
    },
    {
      sectionKey: 'skills',
      label: '技能熟悉',
      items: SKILLS.map((n) => ({ key: n.key, label: n.label, href: relHref(from, n.key) })),
    },
    {
      sectionKey: 'blog',
      label: '博客',
      href: relHref(from, 'blog'),
      items: MONTHS.map((m) => ({
        key: `blog-${m.key}`,
        label: m.key,
        href: relHref(from, `blog-${m.key}`),
        mono: true,
      })),
    },
    {
      sectionKey: 'design',
      label: '设计系统',
      href: relHref(from, 'design'),
      items: DESIGN.map((n) => ({ key: n.key, label: n.label, href: relHref(from, n.key) })),
    },
    {
      sectionKey: 'practice',
      label: '在线练习',
      href: relHref(from, 'practice'),
      items: [
        { key: 'practice-starter', label: '重建中', href: relHref(from, 'practice'), mono: true },
      ],
    },
  ] satisfies NavRowGroup[],
})

export function Page({
  title,
  subtitle,
  desc,
  active,
  chain,
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
    | SkillKey
    | `blog-${string}`
  chain?: PageKey
  children: ReactNode
}) {
  const pageKey = (chain ?? (typeof active === 'number' ? `ch${active}` : active)) as PageKey
  const activeKey =
    active === 'index'
      ? 'index'
      : active === 'learn'
        ? 'tutorial'
        : typeof active === 'number'
          ? `ch${active}`
          : active

  const flips = flipTargetsOf(pageKey)

  return (
    <SitePage
      nav={siteNavFor(pageKey)}
      active={activeKey}
      viewTransitionName="site-header"
      footerGroups={FOOTER_GROUPS}
      title={title}
      subtitle={subtitle}
      desc={desc}
    >
      <PageFlipZone prev={flips.prev} next={flips.next}>
        {children}
        <PageTurnBar from={pageKey} />
      </PageFlipZone>
    </SitePage>
  )
}

export function Section({
  label,
  note,
  id,
  className = '',
  children,
}: {
  label?: string
  note?: string
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`mb-8 ${className}`}>
      {(label || note) && (
        <h2 className="mb-2.5 flex flex-wrap items-baseline gap-2">
          {label && <span className="t-small-strong">{label}</span>}
          {note && <i className="t-small-mute not-italic">{note}</i>}
        </h2>
      )}
      {children}
    </section>
  )
}
