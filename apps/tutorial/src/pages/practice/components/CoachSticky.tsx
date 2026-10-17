/** 陪练 agent 便签——固定在练习场右下角的可折叠浮层。
 * 视觉语言取 design-system 的 StickyNote（图钉 / 折角 / tone 纸面，颜色只用 token），
 * 折叠态是一枚小便签 tab，展开态承载 ChatPanel 全部能力（children 注入）。
 * SSG 安全：renderToString 下不碰 window，副作用全在 effect/handler 里。 */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export const COACH_STICKY_PANEL_ID = 'coach-sticky-panel'

export function CoachSticky({ taskLabel, children }: { taskLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Esc 收起（焦点在面板内或页面任意处都生效）
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // 展开时把焦点交给面板（aria-label 播报），首个 Tab 落到面板内控件
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  return (
    /* 容器只含按钮参与布局（fixed 锚定右下角）；面板绝对定位向展开，
     * 折叠时不占布局空间——visibility 隐藏若仍占位，会把按钮顶离角落。 */
    <div className="fixed right-3 bottom-3 z-40 sm:right-4 sm:bottom-4">
      {/* 折叠/展开开关：同一枚按钮贯穿两个状态，aria 关系不变 */}
      <button
        type="button"
        data-comp="coach-sticky"
        aria-expanded={open}
        aria-controls={COACH_STICKY_PANEL_ID}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-t-lg border-2 border-ink bg-clash2a py-2 pr-4 pl-3 text-[12.5px] font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span aria-hidden className="size-3 shrink-0 rounded-full border-2 border-ink bg-paper" />
        <span>陪练 agent</span>
        <span className="font-mono text-[11px] opacity-70">{taskLabel}</span>
        <span aria-hidden className="ml-0.5">{open ? '▾' : '▴'}</span>
      </button>

      {/* 展开面板：绝对定位悬在按钮正上方；折叠时仍挂载（保留输入草稿），
       * visibility:hidden 把它摘出焦点链与无障碍树，且不占布局空间 */}
      <div
        ref={panelRef}
        id={COACH_STICKY_PANEL_ID}
        aria-label="陪练 agent 对话"
        tabIndex={-1}
        className={`absolute right-0 bottom-[calc(100%+8px)] h-[min(540px,calc(100dvh_-_120px))] w-[min(420px,calc(100vw-24px))] origin-bottom-right rounded-b-lg rounded-tl-lg border-2 border-ink bg-clash2a p-2 shadow-hard transition-[opacity,transform,visibility] duration-200 outline-none motion-reduce:transition-none ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible pointer-events-none translate-y-2 scale-[0.97] opacity-0'
        }`}
      >
        {/* 折角：叠在工作卡右下角上，呼应 StickyNote 的剪角 */}
        <span aria-hidden className="absolute right-0 bottom-0 size-4 border-t-2 border-l-2 border-ink bg-paper-deep" />
        <div className="h-full min-h-0">{children}</div>
      </div>
    </div>
  )
}
