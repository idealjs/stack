
import type { CSSProperties, ReactNode } from 'react'
import { ShadowButton, shadowButtonClasses, SHADOW_BUTTON_ACTIVE } from './ShadowButton'

export interface NavSectionLink {
  key: string
  label: string
  href: string
}

export interface NavItemLink {
  key: string
  label: string
  href: string
  
  color?: string
  
  mono?: boolean
}

export interface NavRowGroup {
  
  sectionKey: string
  label: string
  
  href?: string
  items: NavItemLink[]
}

const SELECTED = 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]'
const IDLE = 'text-body hover:bg-paper-deep'

const LIGHT_PRESS = 'transition-[transform,background-color] duration-150 active:translate-y-[1px]'

function RowLabel({ on, href, children }: { on: boolean; href?: string; children: ReactNode }) {
  
  const cls = `w-full rounded-lg px-2 py-0.5 text-left text-t3 font-extrabold leading-tight ${LIGHT_PRESS} ${on ? SELECTED : 'text-ink hover:bg-paper-deep'}`
  if (!href) return <span className={cls}>{children}</span>
  return (
    <a href={href} className={`no-underline ${cls}`}>
      {children}
    </a>
  )
}


function itemGridStyle(n: number): CSSProperties {
  const cols = Math.min(n, 6)
  return {
    ['--cols' as string]: cols,
    ['--cols-sm' as string]: Math.min(n, 2),
    maxWidth: `min(100%, calc(${cols} * 180px))`,
  }
}

export function SiteNavbar({
  brand,
  rows,
  active,
  viewTransitionName,
}: {
  brand: NavSectionLink
  
  rows: NavRowGroup[]
  
  active?: string
  viewTransitionName?: string
}) {
  const rowOn = (row: NavRowGroup) =>
    active === row.sectionKey || row.items.some((i) => i.key === active)
  return (
    <header
      className="relative max-lg:z-50 mb-8 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-ink"
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
            <input
        id="site-nav-toggle"
        type="checkbox"
        aria-label="打开或收起导航菜单"
        className="peer sr-only"
      />

            <div className="flex flex-wrap items-center gap-1.5 max-lg:peer-checked:[&>label]:invisible">
        <a
          href={brand.href}
          className={`mr-auto rounded-lg border-2 px-2.5 py-0.5 font-mono text-t2 font-extrabold leading-snug no-underline transition-[transform,box-shadow,background-color] duration-150 ${SHADOW_BUTTON_ACTIVE} ${
            active === brand.key
              ? 'border-ink bg-clash1b text-ink'
              : 'border-ink bg-paper text-ink hover:bg-paper-deep'
          }`}
        >
          {brand.label}
        </a>
        <label
          htmlFor="site-nav-toggle"
          aria-label="打开导航菜单"
          aria-expanded="false"
          aria-controls="site-nav-drawer"
          className={`hidden max-lg:grid max-lg:size-10 max-lg:place-items-center ${shadowButtonClasses({ size: 'none' })}`}
        >
          <span aria-hidden="true" className="flex flex-col gap-[5px]">
            <i className="block h-[3px] w-5 rounded-sm bg-ink" />
            <i className="block h-[3px] w-5 rounded-sm bg-ink" />
            <i className="block h-[3px] w-5 rounded-sm bg-ink" />
          </span>
        </label>
      </div>

            <div id="site-nav-drawer" className="max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-r-2 max-lg:border-ink max-lg:bg-paper max-lg:p-3 max-lg:shadow-[8px_0_0_0_var(--color-ink)] max-lg:invisible max-lg:-translate-x-full max-lg:transition-[transform,visibility] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:translate-x-0">
                <div className="lg:hidden max-lg:mb-3 max-lg:flex max-lg:items-center max-lg:justify-between">
          <ShadowButton
            href={brand.href}
            size="sm"
            tone={active === brand.key ? 'clash1b' : 'paper'}
            className="font-mono"
          >
            {brand.label}
          </ShadowButton>
          <label
            htmlFor="site-nav-toggle"
            aria-label="收起导航菜单"
            aria-expanded="true"
            aria-controls="site-nav-drawer"
            className={`grid size-8 place-items-center text-lg font-extrabold leading-none ${shadowButtonClasses({ size: 'none' })}`}
          >
            <span aria-hidden="true">×</span>
          </label>
        </div>
                {rows.map((row) => (
          <div
            key={row.sectionKey}
            className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-1.5 border-t border-dashed border-ink/20 pt-2 max-lg:grid-cols-1 max-lg:items-start"
          >
            <RowLabel on={rowOn(row)} href={row.href}>
              {row.label}
            </RowLabel>
            <div
              className="grid min-w-0 grid-cols-[repeat(var(--cols,1),minmax(0,1fr))] gap-1.5 max-lg:max-w-none max-lg:grid-cols-[repeat(var(--cols-sm,1),minmax(0,1fr))]"
              style={itemGridStyle(row.items.length)}
            >
              {row.items.map((item) => {
                const on = item.key === active
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`rounded-lg px-2.5 py-0.5 text-center text-content font-bold leading-snug no-underline ${LIGHT_PRESS} ${
                      on ? (item.color ? 'text-ink' : SELECTED) : IDLE
                    } ${item.mono ? 'font-mono' : ''}`}
                    style={on && item.color ? { background: item.color } : undefined}
                  >
                    {item.label}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>

            <label
        htmlFor="site-nav-toggle"
        aria-hidden="true"
        className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:block max-lg:cursor-pointer max-lg:bg-ink/40 max-lg:invisible max-lg:opacity-0 max-lg:transition-[visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:opacity-100"
      />
    </header>
  )
}
