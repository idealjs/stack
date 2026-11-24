import * as styles from '@idealjs/stack-ui-kit/styles'
import type { ReactNode } from 'react'
import type { NavRowGroup, NavSectionLink } from './SiteNavbar'
import { SiteNavbar } from './SiteNavbar'
export interface SiteNav {
  brand: NavSectionLink
  rows: NavRowGroup[]
}

export interface SiteFooterGroup {
  label: string
  links: { href: string; label: string }[]
}

const SITE_SHELL = 'mx-auto w-full max-w-[1200px] px-6 2xl:max-w-[1600px]'
const SITE_SHELL_SLIM = 'mx-auto w-full max-w-[1200px] px-3 2xl:max-w-[1600px]'

export function SiteFooter({ groups }: { groups: SiteFooterGroup[] }) {
  return (
    <footer className={`border-t-2 border-dashed ${styles.borderInk15} pt-3`}>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
        {groups.map(({ label, links }) => (
          <span key={label} className="flex items-baseline gap-x-2 text-[12.5px]">
            <i className={`${styles.tSmallMute} not-italic`}>{label}</i>
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className={`${styles.tSmallMute}`}> · </span>}
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-bold ${styles.textBody} no-underline ${styles.hoverTextInk} hover:underline`}
                >
                  {l.label}
                </a>
              </span>
            ))}
          </span>
        ))}
      </div>
      <p className={`${styles.tSmallMute} mt-1.5`}>© 2026 idealjs stack · 保留所有权利</p>
    </footer>
  )
}

export function SitePage({
  nav,
  active,
  viewTransitionName,
  sidebar,
  footerGroups,
  title,
  subtitle,
  desc,
  children,
}: SitePageProps) {
  if (sidebar) {
    return (
      <div className={`flex min-h-dvh ${styles.textContent} ${styles.textBody}`}>
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full min-w-0 max-w-[1200px] flex-1 px-3 py-4 2xl:max-w-[1600px] max-lg:pr-12 max-lg:pt-16">
            {children}
          </main>
          <div
            className={`flex-none ${styles.bgPaper}`}
            style={{ viewTransitionName: 'site-footer' }}
          >
            <div className={`${SITE_SHELL_SLIM} pb-6`}>
              <SiteFooter groups={footerGroups} />
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <main
      data-scroll-root
      className={`flex h-dvh flex-col overflow-y-auto ${styles.textContent} ${styles.textBody}`}
    >
      {nav && (
        <div
          className={`sticky top-0 z-50 flex-none ${styles.bgPaper}`}
          style={viewTransitionName ? { viewTransitionName } : undefined}
        >
          <div className={`${SITE_SHELL} pt-8`}>
            <SiteNavbar brand={nav.brand} rows={nav.rows} active={active} />
          </div>
        </div>
      )}
      <div className={`${SITE_SHELL} flex-1 pb-8`}>
        {(title || subtitle || desc) && (
          <div className="mb-7">
            {title && (
              <h1 className={`m-0 ${styles.textT1} font-extrabold ${styles.textInk}`}>{title}</h1>
            )}
            {subtitle && (
              <p className={`m-0 mt-2 ${styles.textT2} font-bold ${styles.textInk}`}>{subtitle}</p>
            )}
            {desc && <p className={`m-0 mt-2 ${styles.textContent} ${styles.textMute}`}>{desc}</p>}
          </div>
        )}
        {children}
      </div>
      <div
        className={`sticky bottom-0 mt-auto flex-none ${styles.bgPaper}`}
        style={{ viewTransitionName: 'site-footer' }}
      >
        <div className={`${SITE_SHELL} pb-6`}>
          <SiteFooter groups={footerGroups} />
        </div>
      </div>
    </main>
  )
}

export interface SitePageProps {
  nav?: SiteNav

  active?: string

  viewTransitionName?: string

  sidebar?: ReactNode

  footerGroups: SiteFooterGroup[]

  title?: string

  subtitle?: string

  desc?: string

  children: ReactNode
}
