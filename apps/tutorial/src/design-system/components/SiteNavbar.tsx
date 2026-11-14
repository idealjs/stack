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
}: {
  brand: NavSectionLink

  rows: NavRowGroup[]

  active?: string
}) {
  const rowOn = (row: NavRowGroup) =>
    active === row.sectionKey || row.items.some((i) => i.key === active)
  const activeLabel = (() => {
    for (const row of rows) {
      if (row.sectionKey === active && !row.href) return row.label
      const hit = row.items.find((i) => i.key === active)
      if (hit) return hit.label
    }
    return undefined
  })()
  let bandCursor = 1
  const bands = rows.map((row) => {
    const divider = bandCursor
    const span = Math.max(1, Math.ceil(row.items.length / 6))
    const band = { row, divider, start: divider + 1, span }
    bandCursor = divider + 1 + span
    return band
  })
  return (
    <header className="relative max-lg:z-50 lg:z-30 mb-8 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-ink">
      <input
        id="site-nav-expand"
        type="checkbox"
        aria-label="展开或收起桌面导航网格"
        className="peer/nav-expand sr-only"
      />
      <input
        id="site-nav-toggle"
        type="checkbox"
        aria-label="打开或收起导航菜单"
        className="peer/nav-drawer sr-only"
      />

      <div className="relative z-40 flex flex-wrap items-center gap-1.5 max-lg:peer-checked/nav-drawer:[&_.nav-drawer-open]:invisible max-lg:peer-checked/nav-drawer:[&_.nav-drawer-close]:visible lg:peer-checked/nav-expand:[&_.nav-expand-open]:invisible lg:peer-checked/nav-expand:[&_.nav-expand-close]:visible">
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
        {activeLabel && (
          <span className="hidden rounded-lg bg-paper-deep px-2.5 py-0.5 text-t3 font-extrabold text-ink lg:inline-block">
            {activeLabel}
          </span>
        )}
        <span className="hover-host hidden lg:inline-grid">
          {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
          <label
            htmlFor="site-nav-expand"
            aria-label="展开导航网格"
            aria-expanded="false"
            aria-controls="site-nav-drawer"
            className={`nav-expand-open hidden lg:col-start-1 lg:row-start-1 lg:grid lg:size-10 lg:place-items-center ${shadowButtonClasses({ size: 'none' })}`}
          >
            <span aria-hidden="true" className="text-lg font-extrabold leading-none">
              ▼
            </span>
          </label>
          {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
          <label
            htmlFor="site-nav-expand"
            aria-label="收起导航网格"
            aria-expanded="true"
            aria-controls="site-nav-drawer"
            className={`nav-expand-close hidden lg:col-start-1 lg:row-start-1 lg:invisible lg:grid lg:size-10 lg:place-items-center ${shadowButtonClasses({ size: 'none' })}`}
          >
            <span aria-hidden="true" className="text-lg font-extrabold leading-none">
              ▲
            </span>
          </label>
        </span>
        <span className="hover-host hidden max-lg:inline-grid">
          {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
          <label
            htmlFor="site-nav-toggle"
            aria-label="打开导航菜单"
            aria-expanded="false"
            aria-controls="site-nav-drawer"
            className={`nav-drawer-open hidden max-lg:col-start-1 max-lg:row-start-1 max-lg:grid max-lg:size-10 max-lg:place-items-center ${shadowButtonClasses({ size: 'none' })}`}
          >
            <span aria-hidden="true" className="flex flex-col gap-[5px]">
              <i className="block h-[3px] w-5 rounded-sm bg-ink" />
              <i className="block h-[3px] w-5 rounded-sm bg-ink" />
              <i className="block h-[3px] w-5 rounded-sm bg-ink" />
            </span>
          </label>
          {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
          <label
            htmlFor="site-nav-toggle"
            aria-label="收起导航菜单"
            aria-expanded="true"
            aria-controls="site-nav-drawer"
            className={`nav-drawer-close hidden max-lg:col-start-1 max-lg:row-start-1 max-lg:invisible max-lg:grid max-lg:size-10 max-lg:place-items-center ${shadowButtonClasses({ size: 'none' })}`}
          >
            <span aria-hidden="true" className="text-lg font-extrabold leading-none">
              ×
            </span>
          </label>
        </span>
      </div>

      <div
        id="site-nav-drawer"
        className="max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-r-2 max-lg:border-ink max-lg:bg-paper max-lg:px-4 max-lg:py-5 max-lg:shadow-[8px_0_0_0_var(--color-ink)] max-lg:invisible max-lg:opacity-0 max-lg:-translate-x-full max-lg:transition-[transform,visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked/nav-drawer:visible max-lg:peer-checked/nav-drawer:translate-x-0 max-lg:peer-checked/nav-drawer:opacity-100 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-full lg:z-40 lg:mt-2 lg:rounded-2xl lg:border-2 lg:border-ink lg:bg-paper lg:p-3 lg:shadow-ink lg:invisible lg:opacity-0 lg:-translate-y-1 lg:transition-[transform,visibility,opacity] lg:duration-300 lg:ease-[cubic-bezier(0.32,0.72,0,1)] lg:motion-reduce:transition-none lg:peer-checked/nav-expand:pointer-events-auto lg:peer-checked/nav-expand:visible lg:peer-checked/nav-expand:opacity-100 lg:peer-checked/nav-expand:translate-y-0"
      >
        <div className="lg:hidden max-lg:mb-5">
          <span className="hover-host inline-flex">
            <ShadowButton tone="ghost" href={brand.href} size="sm" className="font-mono">
              {brand.label}
            </ShadowButton>
          </span>
        </div>
        <div className="grid gap-x-1.5 gap-y-2 max-lg:grid-cols-2 lg:grid-cols-[96px_repeat(6,minmax(0,180px))]">
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
        className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:block max-lg:cursor-pointer max-lg:bg-ink/40 max-lg:invisible max-lg:opacity-0 max-lg:transition-[visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked/nav-drawer:visible max-lg:peer-checked/nav-drawer:opacity-100"
      />
      {/* biome-ignore lint/a11y/noLabelWithoutControl: 桌面透明遮罩，点导航网格外任意处收起 overlay */}
      <label
        htmlFor="site-nav-expand"
        aria-hidden="true"
        className="hidden lg:fixed lg:inset-0 lg:z-20 lg:block lg:cursor-pointer lg:invisible lg:peer-checked/nav-expand:visible"
      />
    </header>
  )
}
