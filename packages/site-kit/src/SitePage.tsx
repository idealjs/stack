/** SitePage —— 站点整页骨架：站头（design-system 的 SiteNavbar 装配）＋页眉块＋children＋页脚。
 * 从 apps/tutorial/src/lib/ui.tsx 的 Page 平移而来，只做「参数化的骨架」：
 * - 导航行数据 / 品牌 / active key 由调用方经 nav 传入（SiteNavbar 的 active 是单个 key，
 *   语义（章节 id、'learn' 等）→ key 的翻译属于调用方的内容语义，不进本包）；
 * - 页脚是站点级身份（友情链接/社交/源码＋版权行），属骨架的一部分，数据随包走。
 * 站头为 view-transition-name 共享元素，站内页间导航不闪烁。 */
import type { ReactNode } from 'react'
import type { NavSectionLink, NavRowGroup } from '../../../apps/tutorial/src/design-system'
import { SiteNavbar } from '../../../apps/tutorial/src/design-system'

/** 站点导航配置：品牌＋内容行（全部由调用方装配） */
export interface SiteNav {
  brand: NavSectionLink
  rows: NavRowGroup[]
}

/** 页脚链接（站点级身份；外链全部新窗口打开） */
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

export function SitePage({
  nav,
  active,
  viewTransitionName,
  title,
  subtitle,
  desc,
  children,
}: SitePageProps) {
  const { brand, rows } = nav
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8 text-content text-body">
      <SiteNavbar
        brand={brand}
        rows={rows}
        active={active}
        viewTransitionName={viewTransitionName}
      />
      {(title || subtitle || desc) && (
        <div className="mb-7">
          {title && <h1 className="m-0 text-t1 font-extrabold text-ink">{title}</h1>}
          {subtitle && <p className="m-0 mt-2 text-t2 font-bold text-ink">{subtitle}</p>}
          {desc && <p className="m-0 mt-2 text-content text-mute">{desc}</p>}
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

export interface SitePageProps {
  nav: SiteNav
  /** 当前位置的导航 key（SiteNavbar 的 key 语义：品牌 / 分块 / 条目） */
  active?: string
  viewTransitionName?: string
  /** 章节页标题在章头横幅里，可省 */
  title?: string
  /** 首页标语等补充标题 */
  subtitle?: string
  desc?: string
  children: ReactNode
}
