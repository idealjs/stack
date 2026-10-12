/** RouteLine —— 关系线：线形即含义（实=先后 虚=相关 点=同族）
 * 卡片联动（组件自带，消费方零接线）：自动监听场景内 a[data-comp="course-card"]
 * 的 hover——该卡浮起时站点 translateY(-3) 平滑跟随、连线以 CSS d: path() 过渡重算（150ms）
 * 拓扑：横平竖直 + R8 直角步进；并行不合并(4px)；站点 r6 半嵌卡边
 * （圆心骑左右描边，各半在卡上）；线层 z-10 置于卡之上，站点不被卡遮挡；
 * 同口多线自动聚合胶囊（线止于胶囊边界）。
 * 针脚来源：置于 RoutableScene 内由 RoutableCard 自动注册（实测，客户端水合后生效）；
 * nodes prop 可作为 SSG 静态回退——传入后服务端渲染即画出线条（数值与卡片定位一致，
 * 水合后实测值与之相同则无感切换）。两者同时给出时 nodes 优先。 */
import { useContext, useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { ChapterId, Edge } from '../lib/types'
import { PinsContext } from './RoutableCard'
const STATION_COLORS = ['var(--color-clash2a)', 'var(--color-clash1b)', 'var(--color-clash3a)', 'var(--color-clash1a)']

export interface LaneNode {
  id: ChapterId
  borderLeft: number // 左描边 x（入口圆心贴这里，点半嵌）
  right: number // 右描边 x（出口圆心贴这里，点半嵌——不接阴影）
  y: number // 卡中线 y
}

/* 水平出发 → 双弯直角步进 → 水平到达。
 * 微高差（<8px，含 hover 微浮 3px）＝斜线直连：M L 结构恒定，
 * 静置几何上是水平线，hover 时 CSS d 平滑插值成斜线（不折弯、不扭曲）。
 * 正常步进半径自适应：垂直/水平空间不足 2r 时收缩，防两段弧交叠倒置。 */
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

const HOVER_LIFT = -3 // 与 MemphisCard hover:-translate-y-[3px] 一致

export function RouteLine({
  edges,
  nodes,
  width,
  height,
  follow = true,
}: {
  edges: Edge[]
  /** SSG 静态回退针脚：服务端渲染即出线；水合后由 RoutableCard 实测接管 */
  nodes?: Partial<Record<ChapterId, LaneNode>>
  width: number
  height: number
  /** 自动跟随场景内卡片的 hover 浮起（默认开；传 false 关闭） */
  follow?: boolean
}) {
  const scene = useContext(PinsContext)
  // 场景实测针脚为底，nodes prop 显式传入时优先
  const resolved: Partial<Record<ChapterId, LaneNode>> = { ...scene, ...nodes }
  const stationColor = (i: number) => STATION_COLORS[i % STATION_COLORS.length]

  // 联动状态：hover 中的章（由场景卡自动驱动，无需消费方传参）
  const [hovered, setHovered] = useState<ChapterId | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (!follow) return
    const host = svgRef.current?.parentElement
    if (!host) return
    const offs = [...host.querySelectorAll<HTMLElement>('a[data-comp="course-card"]')]
      .map((card) => {
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
      })
    return () => offs.forEach((off) => off())
  }, [follow])
  /** 节点跟随位移：hovered 卡 -3px，其余 0 */
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
        if (e.kind === 'rel') return <path key={i} d={d} style={follow} stroke="var(--color-ink)" strokeWidth={2} fill="none" strokeDasharray="4 2" />
        if (e.kind === 'family') return <path key={i} d={d} style={follow} stroke="var(--color-ink)" strokeWidth={2.4} fill="none" strokeDasharray="0.1 6" strokeLinecap="round" />
        return <path key={i} d={d} style={follow} stroke="var(--color-ink)" strokeWidth={2.5} fill="none" />
      })}
      {seqEdges.map((e) => {
        const a = resolved[e.from]
        const b = resolved[e.to]
        if (!a || !b) return null
        const ins = insByTo.get(e.to)!
        const capsule = ins.length > 1 && firstIn.has(e.to)
        // 源/目标站点：圆心骑卡描边，各半在卡上；目标：单线=圆点，多线=胶囊（只画一次）
        return (
          <g key={`st-${e.from}-${e.to}`}>
            <g style={{ transform: `translateY(${dy(e.from)}px)`, transition: 'transform 150ms ease' }}>
              <circle cx={a.right} cy={a.y} r={6} fill={stationColor(si++)} stroke="var(--color-ink)" strokeWidth={2} />
            </g>
            {(capsule || ins.length === 1) && (
              <g style={{ transform: `translateY(${dy(e.to)}px)`, transition: 'transform 150ms ease' }}>
                {capsule ? (
                  <rect x={b.borderLeft - 3} y={b.y - 10} width={6} height={20} rx={3} fill="var(--color-clash1a)" stroke="var(--color-ink)" strokeWidth={2} />
                ) : (
                  <circle cx={b.borderLeft} cy={b.y} r={6} fill={stationColor(si++)} stroke="var(--color-ink)" strokeWidth={2} />
                )}
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
