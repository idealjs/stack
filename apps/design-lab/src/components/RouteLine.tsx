/** RouteLine —— 关系线：线形即含义（实=先后 虚=相关 点=同族）
 * 拓扑：横平竖直 + R8 直角步进；并行不合并(4px)；站点 r6 半嵌卡边
 * （左贴描边、右骑硬投影外缘）；同口多线自动聚合胶囊（线止于胶囊边界）。 */
import type { ChapterId, Edge } from '../lib/types'

const STATION_COLORS = ['var(--color-clash2a)', 'var(--color-clash1b)', 'var(--color-clash3a)', 'var(--color-clash1a)']

export interface LaneNode {
  id: ChapterId
  borderLeft: number // 左描边 x（无影侧，入口贴这里）
  right: number // 右侧黑影外缘 x（描边 + 7，出口从这里出发）
  y: number // 卡中线 y
}

/** 水平出发 → R8 双弯直角步进 → 水平到达；同 y 时直线 */
function stepPath(x0: number, y0: number, x1: number, y1: number, r = 8): string {
  if (Math.abs(y1 - y0) < 1) return `M ${x0} ${y0} H ${x1}`
  const down = y1 > y0
  const sweep1 = down ? 1 : 0
  const sweep2 = down ? 0 : 1
  const cornerX = Math.max(x0 + r, x1 - 2 * r)
  return `M ${x0} ${y0} H ${cornerX} A ${r} ${r} 0 0 ${sweep1} ${cornerX + r} ${y0 + (down ? r : -r)} V ${y1 - (down ? r : -r)} A ${r} ${r} 0 0 ${sweep2} ${cornerX + 2 * r} ${y1} H ${x1}`
}

export function RouteLine({
  edges,
  nodes,
  width,
  height,
}: {
  edges: Edge[]
  nodes: Partial<Record<ChapterId, LaneNode>>
  width: number
  height: number
}) {
  const stationColor = (i: number) => STATION_COLORS[i % STATION_COLORS.length]

  const seqEdges = edges.filter((e) => e.kind === 'seq')
  const insByTo = new Map<ChapterId, Edge[]>()
  seqEdges.forEach((e) => insByTo.set(e.to, [...(insByTo.get(e.to) ?? []), e]))
  const firstIn = new Set<ChapterId>()
  insByTo.forEach((list) => firstIn.add(list[0].to))

  let si = 0
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute left-0 top-0"
      aria-hidden
    >
      {edges.map((e, i) => {
        const a = nodes[e.from]
        const b = nodes[e.to]
        if (!a || !b) return null
        const d = stepPath(a.right, a.y, b.borderLeft, b.y)
        if (e.kind === 'rel') return <path key={i} d={d} stroke="var(--color-ink)" strokeWidth={2} fill="none" strokeDasharray="4 2" />
        if (e.kind === 'family') return <path key={i} d={d} stroke="var(--color-ink)" strokeWidth={2.4} fill="none" strokeDasharray="0.1 6" strokeLinecap="round" />
        return <path key={i} d={d} stroke="var(--color-ink)" strokeWidth={2.5} fill="none" />
      })}
      {seqEdges.map((e) => {
        const a = nodes[e.from]
        const b = nodes[e.to]
        if (!a || !b) return null
        const ins = insByTo.get(e.to)!
        const capsule = ins.length > 1 && firstIn.has(e.to)
        // 源站点骑出边卡黑影外缘；目标：单线=圆点贴描边，多线=胶囊（只画一次）
        return (
          <g key={`st-${e.from}-${e.to}`}>
            <circle cx={a.right} cy={a.y} r={6} fill={stationColor(si++)} stroke="var(--color-ink)" strokeWidth={2} />
            {capsule ? (
              <rect x={b.borderLeft - 3} y={b.y - 10} width={6} height={20} rx={3} fill="var(--color-clash1a)" stroke="var(--color-ink)" strokeWidth={2} />
            ) : ins.length === 1 ? (
              <circle cx={b.borderLeft} cy={b.y} r={6} fill={stationColor(si++)} stroke="var(--color-ink)" strokeWidth={2} />
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
