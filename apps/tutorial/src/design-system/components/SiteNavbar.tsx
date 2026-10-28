import type { CSSProperties, ReactNode } from 'react'
import { Fragment } from 'react'
import { ShadowButton, shadowButtonClasses } from './ShadowButton'

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

const SELECTED = 'bg-paper-deep text-ink'
const IDLE = 'text-body hover:bg-paper-deep'

const LIGHT_PRESS =
  'transition-[transform,background-color,border-color] duration-150 active:translate-y-[1px]'

function RowLabel({
  on,
  href,
  children,
  className,
  style,
}: {
  on: boolean
  href?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const cls = `w-full rounded-lg border-2 px-2 py-0.5 text-left text-t3 font-extrabold leading-tight ${LIGHT_PRESS} ${
    on ? 'border-ink' : 'border-transparent text-ink hover:border-ink'
  } ${className ?? ''}`
  if (!href)
    return (
      <span className={cls} style={style}>
        {children}
      </span>
    )
  return (
    <a href={href} className={`no-underline ${cls}`} style={style}>
      {children}
    </a>
  )
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
  let bandCursor = 1
  const bands = rows.map((row) => {
    const divider = bandCursor
    const span = Math.max(1, Math.ceil(row.items.length / 6))
    const band = { row, divider, start: divider + 1, span }
    bandCursor = divider + 1 + span
    return band
  })
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

      <div className="flex flex-wrap items-center gap-1.5 max-lg:peer-checked:[&>span]:invisible">
        <span className="hover-host mr-auto inline-flex">
          <ShadowButton
            tone="ghost"
            href={brand.href}
            size="none"
            className="px-2.5 py-0.5 font-mono text-t2 font-extrabold"
          >
            {brand.label}
          </ShadowButton>
        </span>
        <span className="hover-host hidden max-lg:inline-flex">
          {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
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
        </span>
      </div>

      <div
        id="site-nav-drawer"
        className="max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-r-2 max-lg:border-ink max-lg:bg-paper max-lg:px-4 max-lg:py-5 max-lg:shadow-[8px_0_0_0_var(--color-ink)] max-lg:invisible max-lg:opacity-0 max-lg:-translate-x-full max-lg:transition-[transform,visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:translate-x-0 max-lg:peer-checked:opacity-100"
      >
        <div className="lg:hidden max-lg:mb-5 max-lg:flex max-lg:items-center max-lg:justify-between">
          <span className="hover-host inline-flex">
            <ShadowButton tone="ghost" href={brand.href} size="sm" className="font-mono">
              {brand.label}
            </ShadowButton>
          </span>
          <span className="hover-host inline-flex">
            {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
            <label
              htmlFor="site-nav-toggle"
              aria-label="收起导航菜单"
              aria-expanded="true"
              aria-controls="site-nav-drawer"
              className={`grid size-8 place-items-center text-lg font-extrabold leading-none ${shadowButtonClasses({ size: 'none' })}`}
            >
              <span aria-hidden="true">×</span>
            </label>
          </span>
        </div>
        <div className="grid gap-x-1.5 gap-y-2 max-lg:grid-cols-2 lg:mt-3 lg:grid-cols-[96px_repeat(6,minmax(0,180px))]">
          {bands.map(({ row, divider, start, span }) => (
            <Fragment key={row.sectionKey}>
              <div
                aria-hidden="true"
                className="col-span-full border-t border-dashed border-ink/20 lg:[grid-column:1/-1] lg:[grid-row:var(--divider)]"
                style={{ '--divider': divider } as CSSProperties}
              />
              <RowLabel
                on={rowOn(row)}
                href={row.href}
                className="self-start max-lg:col-span-2 lg:[grid-column:1] lg:[grid-row:var(--band)]"
                style={{ '--band': `${start} / span ${span}` } as CSSProperties}
              >
                {row.label}
              </RowLabel>
              <div
                className="grid min-w-0 gap-1.5 max-lg:col-span-2 max-lg:grid-cols-2 lg:col-span-6 lg:col-start-2 lg:grid-cols-subgrid lg:[grid-row:var(--band)]"
                style={{ '--band': `${start} / span ${span}` } as CSSProperties}
              >
                {row.items.map((item) => {
                  const on = item.key === active
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      className={`rounded-lg px-2.5 py-0.5 text-left text-content font-bold leading-snug no-underline ${LIGHT_PRESS} ${
                        on ? (item.color ? 'text-ink' : SELECTED) : IDLE
                      } ${item.mono ? 'font-mono' : ''}`}
                      style={on && item.color ? { background: item.color } : undefined}
                    >
                      {item.label}
                    </a>
                  )
                })}
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* biome-ignore lint/a11y/noLabelWithoutControl: 遮罩 label 关联的 checkbox 由纯 CSS 开合机制持有 */}
      <label
        htmlFor="site-nav-toggle"
        aria-hidden="true"
        className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:block max-lg:cursor-pointer max-lg:bg-ink/40 max-lg:invisible max-lg:opacity-0 max-lg:transition-[visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:opacity-100"
      />
    </header>
  )
}
