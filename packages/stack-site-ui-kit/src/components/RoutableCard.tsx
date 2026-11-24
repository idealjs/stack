import { hoverHost, hoverableShadow, shadowInk } from '@idealjs/stack-ui-kit/styles'
import type { CSSProperties, ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Chapter, ChapterId } from '../types'
import { MemphisCard } from './MemphisCard'
import type { LaneNode } from './RouteLine'
import { cardBadge, plainCard, plainCardTitle, scene } from './routableCard.css'
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
          className={`${scene} ${className}`}
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
    <span role="img" aria-label={`卡片号 ${no}`} className={cardBadge}>
      {no}
    </span>
  )
  return (
    <div ref={ref} className={`${hoverHost} ${className}`} style={style}>
      {chapter ? (
        <MemphisCard chapter={chapter} href={href} compact={compact} corner={badge} />
      ) : (
        <a
          href={href ?? `#ch${no}`}
          data-comp="course-card"
          className={`${hoverableShadow} ${plainCard} ${shadowInk}`}
        >
          <span className={plainCardTitle}>{title ?? `卡片 ${no}`}</span>
          {children}
          {badge}
        </a>
      )}
    </div>
  )
}
