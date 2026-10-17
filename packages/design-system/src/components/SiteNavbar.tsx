/** SiteNavbar —— 站头：品牌行＋内容行（行首标签＋条目）。
 * 字号走字体系统：品牌 t2（站内最大标题）、行首 t3、条目 content——title 层级高于正文。
 * 行首与条目分列 grid 两栏：条目换行只在右栏内流式，不伸进行首列。
 * 高亮细节由单个 active key 推导，组件外不写样式分支：
 * - 命中品牌＝teal 实底（clash1b）＋ink 描边；未命中＝普通方框。
 * - 命中分块 key，或该分块行内任一条目 key＝分块与行首一起高亮
 *   （纸按压色＋ink 内描边环，选中不借黑）。
 * - 命中条目＝条目高亮：自带 color 用该色实底（章节语义），否则同内描边环。
 * - 行首标签未选中时 hover 浮出纸按压色（与条目同一语言）。
 *
 * 按压语言（ShadowButton 三部曲：静置 3px → hover 浮 2px/投影 5px → 按下压进 2px/投影收 1px）：
 * - 桌面 ≥lg 顶栏品牌与分块保形加压：静置像素零变化（视觉基线冻结在 design/colors/symbols
 *   三册的截图里），只追加 SHADOW_BUTTON_ACTIVE 按压段；行首/条目补轻压（translate-y 1px，
 *   一行十几个投影太吵，不加硬投影）。
 * - 移动端专属件整套换装：抽屉品牌/分块用 ShadowButton 组件（选中走 active 内环高亮，
 *   与按压位移叠加不打架）；汉堡/× 是 <label htmlFor>（纯 CSS checkbox 抽屉，换不成
 *   a/button），用导出的 shadowButtonClasses 类配方与组件同源。
 *
 * 移动端（<lg）导航收进左侧滑出 sidebar——纯 CSS 开关，零 JS：
 * daisyUI drawer 的同款思路，checkbox 前置 + 后续兄弟经 peer-checked（编译后即
 * `.peer:checked ~ *`）驱动；关闭走遮罩 label 与抽屉内 × label（点击切换 checkbox）。
 * 桌面（≥lg）新增 DOM 全部 display:none，像素零变化。checkbox 用 sr-only：
 * 保持可聚焦（Tab→Space 可开合），但不挡任何点击。纯 CSS 天然限制：无 Esc 关闭。
 * aria-expanded 用「对称触发器」补上：开/关两个 label 各自带反相的 aria-expanded，
 * CSS 保证任一时刻只有一个在可达树里（visibility:hidden 摘树），SR 读到的状态恒正确。
 * 层级：header 自带 view-transition-name＝自带堆叠上下文，抽屉的 z-50 会被困在里面，
 * 页面后文 z≥1 的定位元素（夹板纸夹、CoachSticky 等）会反盖抽屉——移动端把 header
 * 整体抬到 z-50，让遮罩/抽屉的层级在页面之上重新成立。 */
import type { ReactNode } from 'react'
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
  /** 选中态实底色（如章节色）；缺省用纸按压色＋内描边环 */
  color?: string
  /** 条目文字用等宽（如博客月份） */
  mono?: boolean
}

export interface NavRowGroup {
  /** 对应 NavSectionLink.key：分块与行首随行内选中一起高亮 */
  sectionKey: string
  label: string
  /** 行首标签的落点页；传入则行首渲染为链接（分区着陆页） */
  href?: string
  items: NavItemLink[]
}

const SELECTED = 'bg-paper-deep text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]'
const IDLE = 'text-body hover:bg-paper-deep'
/** 轻压反馈：与 ShadowButton 同源的按压方向（1px），行首/条目一行十几个不加硬投影 */
const LIGHT_PRESS = 'transition-[transform,background-color] duration-150 active:translate-y-[1px]'

function RowLabel({ on, href, children }: { on: boolean; href?: string; children: ReactNode }) {
  // 行首＝t3 标题；占满 grid 首列，三行行首对齐、条目起始位置一致
  const cls = `w-full rounded-lg px-2 py-0.5 text-left text-t3 font-extrabold leading-tight ${LIGHT_PRESS} ${on ? SELECTED : 'text-ink hover:bg-paper-deep'}`
  if (!href) return <span className={cls}>{children}</span>
  return (
    <a href={href} className={`no-underline ${cls}`}>
      {children}
    </a>
  )
}

export function SiteNavbar({
  brand,
  sections,
  rows,
  active,
  viewTransitionName,
}: {
  brand: NavSectionLink
  /** 第一行分块（顺序即排列） */
  sections: NavSectionLink[]
  /** 第二行起的内容行 */
  rows: NavRowGroup[]
  /** 当前位置 key＝品牌 key / 分块 key / 条目 key */
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
      {/* 纯 CSS 抽屉开关（daisyUI drawer 同款）：checkbox 前置，后续兄弟经 peer-checked 驱动；sr-only 保聚焦不挡点击 */}
      <input
        id="site-nav-toggle"
        type="checkbox"
        aria-label="打开或收起导航菜单"
        className="peer sr-only"
      />

      {/* 第一行：品牌（站内最大标题，t2）＋ 分块（桌面）；移动端右侧换汉堡开关。
          顶栏两枚保形加压：静置像素零变化（基线冻结），按压段来自 ShadowButton 配方 */}
      <div className="flex flex-wrap items-center gap-1.5 max-lg:peer-checked:[&>label]:invisible">
        <a
          href={brand.href}
          className={`mr-2 max-lg:mr-auto rounded-lg border-2 px-2.5 py-0.5 font-mono text-t2 font-extrabold leading-snug no-underline transition-[transform,box-shadow,background-color] duration-150 ${SHADOW_BUTTON_ACTIVE} ${
            active === brand.key
              ? 'border-ink bg-clash1b text-ink'
              : 'border-ink bg-paper text-ink hover:bg-paper-deep'
          }`}
        >
          {brand.label}
        </a>
        {sections.map((s) => {
          const row = rows.find((r) => r.sectionKey === s.key)
          const on = active === s.key || (row ? rowOn(row) : false)
          return (
            <a
              key={s.key}
              href={s.href}
              className={`max-lg:hidden rounded-lg px-2.5 py-1 text-content font-bold no-underline transition-[transform,box-shadow,background-color] duration-150 ${SHADOW_BUTTON_ACTIVE} ${on ? SELECTED : IDLE}`}
            >
              {s.label}
            </a>
          )
        })}
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

      {/* 内容区：桌面=常规两行流；移动端=左侧滑出 sidebar（checkbox 勾选时平移归位）。
          分块链在抽屉里有一份移动端专属副本（桌面分块留在顶栏），高亮逻辑同源 */}
<div id="site-nav-drawer" className="max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-r-2 max-lg:border-ink max-lg:bg-paper max-lg:p-3 max-lg:shadow-[8px_0_0_0_var(--color-ink)] max-lg:invisible max-lg:-translate-x-full max-lg:transition-[transform,visibility] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:translate-x-0">
        {/* 抽屉顶：品牌复述＋关闭开关（遮罩会盖住顶栏，汉堡够不着，必须在抽屉内给关闭）；桌面隐藏。
            两枚均在 lg:hidden 容器里、桌面不可见——整套 ShadowButton 换装不碰基线 */}
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
        {/* 分块（移动端）：纵向大链接，items-start 让按钮各抱内容、左缘对齐 */}
        <nav aria-label="分块" className="max-lg:mb-2 max-lg:flex max-lg:flex-col max-lg:items-start max-lg:gap-1.5 max-lg:border-b max-lg:border-dashed max-lg:border-ink/20 max-lg:pb-3 lg:hidden">
          {sections.map((s) => {
            const row = rows.find((r) => r.sectionKey === s.key)
            const on = active === s.key || (row ? rowOn(row) : false)
            return (
              <ShadowButton key={s.key} href={s.href} size="sm" active={on}>
                {s.label}
              </ShadowButton>
            )
          })}
        </nav>
        {/* 第二行起：行首（t3）与条目（content）分列两栏，条目换行不伸进行首列；抽屉内降为单列 */}
        {rows.map((row) => (
          <div
            key={row.sectionKey}
            className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-1.5 border-t border-dashed border-ink/20 pt-2 max-lg:grid-cols-1 max-lg:items-start"
          >
            <RowLabel on={rowOn(row)} href={row.href}>
              {row.label}
            </RowLabel>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {row.items.map((item) => {
                const on = item.key === active
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`rounded-lg px-2.5 py-0.5 text-content font-bold leading-snug no-underline ${LIGHT_PRESS} ${
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

      {/* 遮罩：点击关闭（label 切回 checkbox）；hidden 打底，桌面零 DOM 影响 */}
      <label
        htmlFor="site-nav-toggle"
        aria-hidden="true"
        className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:block max-lg:cursor-pointer max-lg:bg-ink/40 max-lg:invisible max-lg:opacity-0 max-lg:transition-[visibility,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:motion-reduce:transition-none max-lg:peer-checked:visible max-lg:peer-checked:opacity-100"
      />
    </header>
  )
}
