import * as styles from '@idealjs/stack-ui-kit/styles'
import { ShadowButton, shadowButtonClasses } from '@idealjs/stack-ui-kit'
import type { NavRowGroup, NavSectionLink } from './SiteNavbar'

const SELECTED = `${styles.bgPaperDeep} ${styles.textInk} shadow-[inset_0_0_0_2px_var(--color-ink)]`
const IDLE = `${styles.textBody} ${styles.hoverBgPaperDeep}`

const LIGHT_PRESS = 'transition-[transform,background-color] duration-150 active:translate-y-[1px]'

export function SiteSidebar({
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
  return (
    <>
      <input
        id="site-sidebar-toggle"
        type="checkbox"
        aria-label="打开或收起侧栏导航"
        className="peer sr-only"
      />

      <span className={`${styles.hoverHost} fixed top-3 left-3 z-40 max-lg:inline-grid lg:hidden`}>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
        <label
          htmlFor="site-sidebar-toggle"
          aria-label="打开侧栏导航"
          aria-expanded="false"
          aria-controls="site-sidebar-drawer"
          className={`grid size-10 cursor-pointer place-items-center ${shadowButtonClasses({ size: 'none' })}`}
        >
          <span aria-hidden="true" className="flex flex-col gap-[5px]">
            <i className={`block h-[3px] w-5 rounded-sm ${styles.bgInk}`} />
            <i className={`block h-[3px] w-5 rounded-sm ${styles.bgInk}`} />
            <i className={`block h-[3px] w-5 rounded-sm ${styles.bgInk}`} />
          </span>
        </label>
      </span>

      <aside
        id="site-sidebar-drawer"
        className={`max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:overflow-y-auto max-lg:shadow-[8px_0_0_0_var(--color-ink)] max-lg:invisible max-lg:opacity-0 max-lg:-translate-x-full max-lg:transition-[transform,visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:translate-x-0 max-lg:peer-checked:opacity-100 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 overflow-y-auto border-r-2 ${styles.borderInk} ${styles.bgPaper} px-4 py-5`}
      >
        <div className="mb-5 flex items-center justify-between">
          <ShadowButton
            tone="ghost"
            href={brand.href}
            size="sm"
            nested
            className={`font-mono ${styles.hoverBgPaperDeep}`}
          >
            {brand.label}
          </ShadowButton>
          <span className="inline-flex lg:hidden">
            {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 纯 CSS checkbox 开合的触发 label，aria 状态为增强语义保留 */}
            <label
              htmlFor="site-sidebar-toggle"
              aria-label="收起侧栏导航"
              aria-expanded="true"
              aria-controls="site-sidebar-drawer"
              className={`grid size-8 cursor-pointer place-items-center text-lg font-extrabold leading-none ${shadowButtonClasses({ size: 'none', nested: true, className: `${styles.hoverBgPaperDeep}` })}`}
            >
              <span aria-hidden="true">×</span>
            </label>
          </span>
        </div>
        <nav aria-label="站内导航">
          {rows.map((row) => (
            <div
              key={row.sectionKey}
              className={`mt-3 border-t border-dashed ${styles.borderInk20} pt-3 first:mt-0 first:border-t-0 first:pt-0`}
            >
              {row.href ? (
                <a
                  href={row.href}
                  className={`no-underline ${rowOn(row) ? SELECTED : `${styles.textInk} ${styles.hoverBgPaperDeep}`} ${LIGHT_PRESS} block w-full rounded-lg px-2 py-0.5 ${styles.textT3} font-extrabold leading-tight`}
                >
                  {row.label}
                </a>
              ) : (
                <span
                  className={`block w-full rounded-lg px-2 py-0.5 ${styles.textT3} font-extrabold leading-tight ${rowOn(row) ? SELECTED : `${styles.textInk}`}`}
                >
                  {row.label}
                </span>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                {row.items.map((item) => {
                  const on = item.key === active
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      className={`rounded-lg px-2 py-0.5 ${styles.textContent} font-bold leading-snug no-underline ${LIGHT_PRESS} ${
                        on ? (item.color ? `${styles.textInk}` : SELECTED) : IDLE
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
        </nav>
      </aside>

      {/* biome-ignore lint/a11y/noLabelWithoutControl: 遮罩 label 关联的 checkbox 由纯 CSS 开合机制持有 */}
      <label
        htmlFor="site-sidebar-toggle"
        aria-hidden="true"
        className={`hidden max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:block max-lg:cursor-pointer max-lg:bg-ink/40 max-lg:invisible max-lg:opacity-0 max-lg:transition-[visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:opacity-100`}
      />
    </>
  )
}
