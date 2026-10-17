/** RoutableScene / RoutableCard —— 可连线场景与卡：针脚自报，免手抄坐标。
 * 卡片自带卡片号（no），挂载时实测自身几何（相对场景原点），
 * 把针脚（左右描边中点＝RouteLine 的接点）注册进场景；回流/缩放自动重测。
 * 场景内的 RouteLine 免 nodes prop——针脚从 PinsContext 取，nodes 传入时优先。
 * 两个 context 分离：动作（注册/注销/场景引用）恒稳定，针脚表单独变化，
 * 卡片的测量 effect 只依赖稳定动作，不会因注册本身触发重注册循环。
 * 卡片号徽章经 MemphisCard 的 corner 插槽渲染，随卡片 hover 一起浮起。 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Chapter, ChapterId } from '../lib/types'
import type { LaneNode } from './RouteLine'
import { MemphisCard } from './MemphisCard'

export interface PinActions {
  sceneRef: React.RefObject<HTMLDivElement | null>
  register: (no: ChapterId, lane: LaneNode) => void
  unregister: (no: ChapterId) => void
}

export const PinActionsContext = createContext<PinActions | null>(null)
export const PinsContext = createContext<Partial<Record<ChapterId, LaneNode>>>({})

/** 可连线场景：相对定位容器＋针脚注册表。height 省略时由内容撑开（响应式布局用）。 */
export function RoutableScene({
  height,
  className = '',
  children,
}: {
  height?: number
  className?: string
  children: ReactNode
}) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [pins, setPins] = useState<Partial<Record<ChapterId, LaneNode>>>({})
  const register = useCallback(
    (no: ChapterId, lane: LaneNode) => setPins((m) => ({ ...m, [no]: lane })),
    [],
  )
  const unregister = useCallback(
    (no: ChapterId) =>
      setPins((m) => {
        const rest = { ...m }
        delete rest[no]
        return rest
      }),
    [],
  )
  const actions = useMemo<PinActions>(() => ({ sceneRef, register, unregister }), [register, unregister])
  return (
    <PinActionsContext.Provider value={actions}>
      <PinsContext.Provider value={pins}>
        <div
          ref={sceneRef}
          className={`relative overflow-hidden rounded-2xl bg-paper ${className}`}
          style={height !== undefined ? { height } : undefined}
        >
          {children}
        </div>
      </PinsContext.Provider>
    </PinActionsContext.Provider>
  )
}

/** 可连线卡：两种形态。
 * - 传 chapter：包裹 MemphisCard（真实教程入口）。
 * - 只传 title（plain 模式）：简洁纸卡＋卡片号徽章——RouteLine 组合演示、
 *   轻量路线图用；锚点同样挂 data-comp="course-card"，hover 浮起联动照常。
 * 两者都实测针脚并注册到场景；右上角渲染卡片号徽章。 */
export function RoutableCard({
  no,
  chapter,
  title,
  href,
  compact = false,
  className = '',
  style,
  children,
}: {
  /** 卡片号：站点序号＝RouteLine 边的 from/to */
  no: ChapterId
  /** MemphisCard 形态：真实章节入口 */
  chapter?: Chapter
  /** plain 形态：简洁卡标题（chapter 缺省时生效） */
  title?: string
  href?: string
  compact?: boolean
  /** 定位与布局（响应式类名也走这里，如 md:absolute md:left-[40px]） */
  className?: string
  style?: CSSProperties
  /** plain 形态的附加内容（标题下方） */
  children?: ReactNode
}) {
  const actions = useContext(PinActionsContext)
  const ref = useRef<HTMLDivElement>(null)
  // 注意必须用 useEffect：卡片是场景 div 的子组件，useLayoutEffect 触发时
  // 父级的 sceneRef 尚未挂载（React 自底向上提交），测量会拿到 null。
  useEffect(() => {
    const card = ref.current
    const scene = actions?.sceneRef.current
    if (!actions || !card || !scene) return
    const measure = () => {
      const cr = card.getBoundingClientRect()
      const sr = scene.getBoundingClientRect()
      actions.register(no, {
        id: no,
        borderLeft: Math.round(cr.left - sr.left),
        right: Math.round(cr.right - sr.left),
        y: Math.round(cr.top - sr.top + cr.height / 2),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(card)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      actions.unregister(no)
    }
  }, [no, actions])
  const badge = (
    <span
      aria-label={`卡片号 ${no}`}
      className="absolute -right-2 -top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-ink bg-white px-1 font-mono text-[11px] font-bold text-ink"
    >
      {no}
    </span>
  )
  return (
    <div ref={ref} className={className} style={style}>
      {chapter ? (
        <MemphisCard chapter={chapter} href={href} compact={compact} corner={badge} />
      ) : (
        <a
          href={href ?? `#ch${no}`}
          data-comp="course-card"
          className="relative block rounded-xl border-2 border-ink bg-white p-3 no-underline shadow-ink transition-transform duration-150 hover:-translate-y-[3px]"
        >
          <span className="block text-[13px] font-extrabold text-ink">{title ?? `卡片 ${no}`}</span>
          {children}
          {badge}
        </a>
      )}
    </div>
  )
}
