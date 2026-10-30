import type { ReactNode } from 'react'
import type { NavRowGroup, NavSectionLink } from '../design-system'
import { SiteNavbar } from '../design-system'

export interface SiteNav {
  brand: NavSectionLink
  rows: NavRowGroup[]
}

const FOOTER_GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
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

export function SiteFooter() {
  return (
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
  )
}

export function SitePage({
  nav,
  active,
  viewTransitionName,
  title,
  subtitle,
  desc,
  children,
}: SitePageProps) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8 text-content text-body">
      {nav && (
        <SiteNavbar
          brand={nav.brand}
          rows={nav.rows}
          active={active}
          viewTransitionName={viewTransitionName}
        />
      )}
      {(title || subtitle || desc) && (
        <div className="mb-7">
          {title && <h1 className="m-0 text-t1 font-extrabold text-ink">{title}</h1>}
          {subtitle && <p className="m-0 mt-2 text-t2 font-bold text-ink">{subtitle}</p>}
          {desc && <p className="m-0 mt-2 text-content text-mute">{desc}</p>}
        </div>
      )}
      {children}
      <SiteFooter />
    </main>
  )
}

export interface SitePageProps {
  nav?: SiteNav

  active?: string
  viewTransitionName?: string

  title?: string

  subtitle?: string
  desc?: string
  children: ReactNode
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
