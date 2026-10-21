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
  const actions = useMemo<PinActions>(
    () => ({ sceneRef, register, unregister }),
    [register, unregister],
  )
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
  no: ChapterId

  chapter?: Chapter

  title?: string
  href?: string
  compact?: boolean

  className?: string
  style?: CSSProperties

  children?: ReactNode
}) {
  const actions = useContext(PinActionsContext)
  const ref = useRef<HTMLDivElement>(null)

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
    <div ref={ref} className={`hover-host ${className}`} style={style}>
      {chapter ? (
        <MemphisCard chapter={chapter} href={href} compact={compact} corner={badge} />
      ) : (
        <a
          href={href ?? `#ch${no}`}
          data-comp="course-card"
          className="hoverable-shadow relative block rounded-xl border-2 border-ink bg-white p-3 no-underline shadow-ink transition-[translate,box-shadow] duration-150"
        >
          <span className="block text-[13px] font-extrabold text-ink">{title ?? `卡片 ${no}`}</span>
          {children}
          {badge}
        </a>
      )}
    </div>
  )
}
