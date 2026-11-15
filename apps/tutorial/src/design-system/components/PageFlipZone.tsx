import type { CSSProperties, ReactNode, RefObject } from 'react'
import { useEffect, useRef } from 'react'

const CHARGE_DAMPING = 0.12
const CHARGE_RATE_CAP = 220
const FLIP_THRESHOLD = 55
const QUIET_MS = 250
const GESTURE_GAP_MS = 100
const SPRING_STIFFNESS = 170
const SPRING_DAMPING = 18

export interface FlipMeta {
  title: string
  color: string
}

export interface FlipTarget {
  href: string
  meta: FlipMeta
}

export interface PageFlipZoneProps {
  prev?: FlipTarget
  next?: FlipTarget
  children: ReactNode
}

const edgeStyle = {
  opacity: 'calc(var(--flip-progress) * 12)',
  '--flip-progress': 0,
  '--flip-pointer': 'none',
} as CSSProperties

const EDGE_ANCHOR = {
  next: {
    container: 'bottom-0',
    badge: 'bottom-4',
    bar: 'bottom-0',
    label: (title: string) => `▼ 继续滚动 · 下一页：${title}`,
  },
  prev: {
    container: 'top-0',
    badge: 'top-4',
    bar: 'top-0',
    label: (title: string) => `▲ 继续滚动 · 上一页：${title}`,
  },
} as const

interface FlipEdgeProps {
  side: 'prev' | 'next'
  target: FlipTarget
  edgeRef: RefObject<HTMLDivElement>
  onFlip: () => void
}

function FlipEdge({ side, target, edgeRef, onFlip }: FlipEdgeProps) {
  const anchor = EDGE_ANCHOR[side]
  return (
    <div
      ref={edgeRef}
      data-flip-edge={side}
      className={`pointer-events-none fixed inset-x-0 ${anchor.container} z-40`}
      style={edgeStyle}
    >
      <div className={`absolute inset-x-0 ${anchor.badge} flex justify-center`}>
        <button
          type="button"
          onClick={onFlip}
          className="cursor-pointer rounded-full border-2 border-ink px-3 py-1 text-[12px] font-bold text-ink shadow-ink transition-[translate,box-shadow] duration-150 [pointer-events:var(--flip-pointer)] hover:-translate-y-0.5 hover:shadow-ink-lift active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)]"
          style={{ background: target.meta.color }}
        >
          {anchor.label(target.meta.title)}
        </button>
      </div>
      <div aria-hidden className={`absolute inset-x-0 ${anchor.bar} h-1 bg-ink/15`}>
        <div
          className="h-full w-full origin-left bg-ink"
          style={{ transform: 'scaleX(var(--flip-progress))' }}
        />
      </div>
    </div>
  )
}

export function PageFlipZone({ prev, next, children }: PageFlipZoneProps) {
  const nextEdgeRef = useRef<HTMLDivElement>(null)
  const prevEdgeRef = useRef<HTMLDivElement>(null)
  const edgesRef = useRef({ prev, next })
  const flipRef = useRef<(side: 1 | -1) => void>(() => {})
  edgesRef.current = { prev, next }

  useEffect(() => {
    let target = 0
    let position = 0
    let velocity = 0
    let frame = 0
    let stepLastAt = 0
    let lastWheelAt = 0
    let gesture = 0
    let arrivalGesture = -1
    let lastScrollTop = 0
    let lastChargeAt = 0
    let quietTimer = 0
    let direction = 0
    let flipping = false

    const scroller = () =>
      document.querySelector<HTMLElement>('[data-scroll-root]') ?? document.documentElement

    const atTop = () => scroller().scrollTop <= 0
    const atBottom = () => {
      const el = scroller()
      return el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    }

    const wheelDistance = (event: WheelEvent) => {
      if (event.deltaMode === 1) return event.deltaY * 40
      if (event.deltaMode === 2) return event.deltaY * scroller().clientHeight
      return event.deltaY
    }

    const setProgress = (side: 1 | -1, progress: number) => {
      const edge = side > 0 ? nextEdgeRef.current : prevEdgeRef.current
      if (edge) {
        edge.style.setProperty('--flip-progress', progress.toFixed(4))
        edge.style.setProperty('--flip-pointer', progress > 0 ? 'auto' : 'none')
      }
    }

    const paint = () => {
      const progress = Math.max(0, Math.min(position / FLIP_THRESHOLD, 1))
      setProgress(1, direction > 0 ? progress : 0)
      setProgress(-1, direction < 0 ? progress : 0)
    }

    const settled = () => Math.abs(target - position) < 0.5 && Math.abs(velocity) < 0.5

    const step = (now: number) => {
      const dt = stepLastAt === 0 ? 1 / 60 : Math.min((now - stepLastAt) / 1000, 1 / 30)
      stepLastAt = now
      velocity += (SPRING_STIFFNESS * (target - position) - SPRING_DAMPING * velocity) * dt
      position += velocity * dt
      if (settled()) {
        position = target
        velocity = 0
        if (target === 0) direction = 0
        paint()
        frame = 0
        stepLastAt = 0
        return
      }
      paint()
      frame = requestAnimationFrame(step)
    }

    const wake = () => {
      if (frame === 0) {
        stepLastAt = 0
        frame = requestAnimationFrame(step)
      }
    }

    const settleBack = () => {
      window.clearTimeout(quietTimer)
      quietTimer = 0
      target = 0
      lastChargeAt = 0
      wake()
    }

    const flip = (side: number) => {
      const edges = edgesRef.current
      const targetEdge = side > 0 ? edges.next : edges.prev
      direction = side
      flipping = true
      if (targetEdge) {
        sessionStorage.setItem('vt', side > 0 ? 'next' : 'prev')
        window.location.assign(targetEdge.href)
      } else {
        flipping = false
        settleBack()
      }
    }
    flipRef.current = flip

    const onWheel = (event: WheelEvent) => {
      if (flipping || event.deltaY === 0) return
      const now = performance.now()
      if (now - lastWheelAt > GESTURE_GAP_MS) gesture += 1
      lastWheelAt = now

      const distance = wheelDistance(event)
      const pullingNext = distance > 0 && atBottom() && !!edgesRef.current.next
      const pullingPrev = distance < 0 && atTop() && !!edgesRef.current.prev
      if (!pullingNext && !pullingPrev) {
        if (direction !== 0) settleBack()
        return
      }
      if (gesture === arrivalGesture) return

      event.preventDefault()
      direction = pullingNext ? 1 : -1
      const held = lastChargeAt === 0 ? 1 / 60 : Math.min((now - lastChargeAt) / 1000, 0.15)
      lastChargeAt = now
      window.clearTimeout(quietTimer)
      target = Math.min(
        target + Math.min(Math.abs(distance) * CHARGE_DAMPING, CHARGE_RATE_CAP * held),
        FLIP_THRESHOLD,
      )
      if (target >= FLIP_THRESHOLD) {
        quietTimer = window.setTimeout(() => {
          quietTimer = 0
          if (target >= FLIP_THRESHOLD) flip(direction)
        }, QUIET_MS)
        wake()
        return
      }
      wake()
    }

    const onScroll = () => {
      if (flipping) return
      const el = scroller()
      const top = el.scrollTop
      if (top > lastScrollTop && (atTop() || atBottom())) arrivalGesture = gesture
      lastScrollTop = top
      const holding = (direction > 0 && atBottom()) || (direction < 0 && atTop())
      if (!holding && (position !== 0 || target !== 0)) settleBack()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (flipping || event.metaKey || event.ctrlKey || event.altKey) return
      const node = event.target
      if (
        node instanceof HTMLElement &&
        (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(node.tagName))
      ) {
        return
      }
      const flippingNext =
        atBottom() && !!edgesRef.current.next && ['ArrowDown', 'PageDown', ' '].includes(event.key)
      const flippingPrev =
        atTop() && !!edgesRef.current.prev && ['ArrowUp', 'PageUp'].includes(event.key)
      if (flippingNext || flippingPrev) {
        event.preventDefault()
        direction = flippingNext ? 1 : -1
        flip(direction)
      }
    }

    const root = scroller()
    window.addEventListener('wheel', onWheel, { passive: false })
    root.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('wheel', onWheel)
      root.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(quietTimer)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      {children}
      {next && (
        <FlipEdge
          side="next"
          target={next}
          edgeRef={nextEdgeRef}
          onFlip={() => flipRef.current(1)}
        />
      )}
      {prev && (
        <FlipEdge
          side="prev"
          target={prev}
          edgeRef={prevEdgeRef}
          onFlip={() => flipRef.current(-1)}
        />
      )}
    </>
  )
}
