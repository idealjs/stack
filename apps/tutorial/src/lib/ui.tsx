/** 教程站页面骨架：站头导航跨页常驻（view-transition-name 共享元素，页间不闪烁）。
 * 站头为 design-system 的 SiteNavbar 组件（五行：品牌＋分块 / 全栈教程 / 博客 / 设计系统 / 在线练习），
 * 本文件只负责把语义化的 active 翻译成导航 key，高亮细节由组件内部推导。 */
import '@stack/design-system'
import type { ReactNode } from 'react'
import type { ChapterId, NavItemLink, NavRowGroup, NavSectionLink } from '@stack/design-system'
import { SiteNavbar } from '@stack/design-system'
import { CHAPTERS } from './chapters'
import { MONTHS } from '../content/blogs'

/** 设计系统五册 */
export type DesignKey = 'design-colors' | 'design-typography' | 'design-symbols' | 'design-components' | 'design-shadow'

const DESIGN: { href: string; label: string; key: DesignKey }[] = [
  { href: '/design-colors.html', label: '颜色', key: 'design-colors' },
  { href: '/design-typography.html', label: '字体', key: 'design-typography' },
  { href: '/design-symbols.html', label: '符号形状', key: 'design-symbols' },
  { href: '/design-components.html', label: '组件', key: 'design-components' },
  { href: '/design-shadow.html', label: '阴影', key: 'design-shadow' },
]

const NAV_SECTIONS: NavSectionLink[] = [
  { key: 'tutorial', label: '全栈教程', href: '/learn.html' },
  { key: 'blog', label: '博客', href: '/blog.html' },
  { key: 'design', label: '设计系统', href: '/design.html' },
  { key: 'practice', label: '在线练习', href: '/practice.html' },
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
    items: MONTHS.map((m) => ({ key: `blog-${m.key}`, label: m.key, href: `/blog-${m.key}.html`, mono: true })),
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
    // v1 单任务直入练习场；任务库落地后由任务表生成（/practice.html?task=<id>）
    items: [{ key: 'practice-starter', label: '重建中', href: '/practice.html', mono: true }],
  },
]

/** 页脚链接（外链全部新窗口打开） */
const FOOTER_GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
  { label: '友情链接', links: [{ href: 'https://idealjs.com', label: 'idealjs.com' }] },
  {
    label: '社交网络',
    links: [{ href: 'https://github.com/idealjs', label: 'GitHub' }],
    // 待加：知乎 / Bilibili / X 等，格式同上
  },
  {
    label: '源码',
    links: [
      { href: 'https://gitea.idealjs.com/idealjs/stack', label: 'Gitea' },
      { href: 'https://github.com/idealjs/stack', label: 'GitHub 镜像' },
    ],
  },
]

export function Page({
  title,
  subtitle,
  desc,
  active,
  children,
}: {
  /** 章节页标题在章头横幅里，可省 */
  title?: string
  /** 首页标语等补充标题 */
  subtitle?: string
  desc?: string
  /** 站头高亮：章节 id / 首页 / 开始学习（learn）/ 分块着陆页（blog、design、practice）/ 设计系统册 / 博客月（blog-YYYY-MM） */
  active?: ChapterId | 'index' | 'learn' | 'blog' | 'design' | 'practice' | DesignKey | `blog-${string}`
  children: ReactNode
}) {
  // 语义 active → 导航 key：learn 页归入 tutorial 分块（高亮分块与行首，不选中任何条目）
  const activeKey =
    active === 'index'
      ? 'index'
      : active === 'learn'
        ? 'tutorial'
        : typeof active === 'number'
          ? `ch${active}`
          : active

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8 text-content text-body">
      <SiteNavbar
        brand={{ key: 'index', label: 'idealjs stack', href: '/index.html' }}
        sections={NAV_SECTIONS}
        rows={NAV_ROWS}
        active={activeKey}
        viewTransitionName="site-header"
      />
      {(title || subtitle || desc) && (
        <div className="mb-7">
          {title && <h1 className="m-0 text-t1 font-extrabold text-ink">{title}</h1>}
          {subtitle && <p className="m-0 mt-2 text-t2 font-bold text-ink">{subtitle}</p>}
          {desc && <p className="m-0 mt-2 max-w-[72ch] text-content text-mute">{desc}</p>}
        </div>
      )}
      {children}
      <footer className="mt-12 border-t-2 border-dashed border-ink/15 pt-3">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
          {FOOTER_GROUPS.map(({ label, links }) => (
            <span key={label} className="flex items-baseline gap-x-2 text-[12.5px]">
              <i className="t-small-mute not-italic">{label}</i>
              {links.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && <span className="t-small-mute"> · </span>}
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-body no-underline hover:text-ink hover:underline"
                  >
                    {l.label}
                  </a>
                </span>
              ))}
            </span>
          ))}
        </div>
        <p className="t-small-mute mt-1.5">© 2026 idealjs stack · 保留所有权利</p>
      </footer>
    </main>
  )
}

export function Section({ label, note, id, className = '', children }: { label: string; note?: string; id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mb-8 ${className}`}>
      <h2 className="mb-2.5 flex flex-wrap items-baseline gap-2">
        <span className="t-small-strong">{label}</span>
        {note && <i className="t-small-mute not-italic">{note}</i>}
      </h2>
      {children}
    </section>
  )
}
