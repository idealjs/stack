import { useContext, useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { ChapterId, Edge } from '../lib/types'
import { PinsContext } from './RoutableCard'
const STATION_COLORS = [
  'var(--color-clash2a)',
  'var(--color-clash1b)',
  'var(--color-clash3a)',
  'var(--color-clash1a)',
]

export interface LaneNode {
  id: ChapterId
  borderLeft: number
  right: number
  y: number
}

function stepPath(x0: number, y0: number, x1: number, y1: number, r = 8): string {
  const dyAbs = Math.abs(y1 - y0)
  if (dyAbs < 8) return `M ${x0} ${y0} L ${x1} ${y1}`
  const rr = Math.max(0.5, Math.min(r, dyAbs / 2, (x1 - x0) / 3))
  const down = y1 > y0
  const sweep1 = down ? 1 : 0
  const sweep2 = down ? 0 : 1
  const cornerX = Math.max(x0 + rr, x1 - 2 * rr)
  return `M ${x0} ${y0} H ${cornerX} A ${rr} ${rr} 0 0 ${sweep1} ${cornerX + rr} ${y0 + (down ? rr : -rr)} V ${y1 - (down ? rr : -rr)} A ${rr} ${rr} 0 0 ${sweep2} ${cornerX + 2 * rr} ${y1} H ${x1}`
}

const HOVER_LIFT = -3

export function RouteLine({
  edges,
  nodes,
  width,
  height,
  follow = true,
}: {
  edges: Edge[]

  nodes?: Partial<Record<ChapterId, LaneNode>>
  width: number
  height: number

  follow?: boolean
}) {
  const scene = useContext(PinsContext)

  const resolved: Partial<Record<ChapterId, LaneNode>> = { ...scene, ...nodes }
  const stationColor = (i: number) => STATION_COLORS[i % STATION_COLORS.length]

  const [hovered, setHovered] = useState<ChapterId | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (!follow) return
    const host = svgRef.current?.parentElement
    if (!host) return
    const offs = [...host.querySelectorAll<HTMLElement>('a[data-comp="course-card"]')].map(
      (card) => {
        const m = card.getAttribute('href')?.match(/ch(\d)/)
        if (!m) return () => {}
        const id = +m[1] as ChapterId
        const on = () => setHovered(id)
        const off = () => setHovered(null)
        card.addEventListener('mouseenter', on)
        card.addEventListener('mouseleave', off)
        return () => {
          card.removeEventListener('mouseenter', on)
          card.removeEventListener('mouseleave', off)
        }
      },
    )
    return () => offs.forEach((off) => off())
  }, [follow])

  const dy = (id: ChapterId) => (id === hovered ? HOVER_LIFT : 0)

  const seqEdges = edges.filter((e) => e.kind === 'seq')
  const insByTo = new Map<ChapterId, Edge[]>()
  seqEdges.forEach((e) => insByTo.set(e.to, [...(insByTo.get(e.to) ?? []), e]))
  const firstIn = new Set<ChapterId>()
  insByTo.forEach((list) => firstIn.add(list[0].to))

  let si = 0
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute left-0 top-0 z-10"
      aria-hidden
    >
      {edges.map((e, i) => {
        const a = resolved[e.from]
        const b = resolved[e.to]
        if (!a || !b) return null
        const d = stepPath(a.right, a.y + dy(e.from), b.borderLeft, b.y + dy(e.to))
        const follow = { d: `path("${d}")`, transition: 'd 150ms ease' } as React.CSSProperties
        if (e.kind === 'rel')
          return (
            <path
              key={i}
              d={d}
              style={follow}
              stroke="var(--color-ink)"
              strokeWidth={2}
              fill="none"
              strokeDasharray="4 2"
            />
          )
        if (e.kind === 'family')
          return (
            <path
              key={i}
              d={d}
              style={follow}
              stroke="var(--color-ink)"
              strokeWidth={2.4}
              fill="none"
              strokeDasharray="0.1 6"
              strokeLinecap="round"
            />
          )
        return (
          <path
            key={i}
            d={d}
            style={follow}
            stroke="var(--color-ink)"
            strokeWidth={2.5}
            fill="none"
          />
        )
      })}
      {seqEdges.map((e) => {
        const a = resolved[e.from]
        const b = resolved[e.to]
        if (!a || !b) return null
        const ins = insByTo.get(e.to)!
        const capsule = ins.length > 1 && firstIn.has(e.to)

        return (
          <g key={`st-${e.from}-${e.to}`}>
            <g
              style={{
                transform: `translateY(${dy(e.from)}px)`,
                transition: 'transform 150ms ease',
              }}
            >
              <circle
                cx={a.right}
                cy={a.y}
                r={6}
                fill={stationColor(si++)}
                stroke="var(--color-ink)"
                strokeWidth={2}
              />
            </g>
            {(capsule || ins.length === 1) && (
              <g
                style={{
                  transform: `translateY(${dy(e.to)}px)`,
                  transition: 'transform 150ms ease',
                }}
              >
                {capsule ? (
                  <rect
                    x={b.borderLeft - 3}
                    y={b.y - 10}
                    width={6}
                    height={20}
                    rx={3}
                    fill="var(--color-clash1a)"
                    stroke="var(--color-ink)"
                    strokeWidth={2}
                  />
                ) : (
                  <circle
                    cx={b.borderLeft}
                    cy={b.y}
                    r={6}
                    fill={stationColor(si++)}
                    stroke="var(--color-ink)"
                    strokeWidth={2}
                  />
                )}
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
