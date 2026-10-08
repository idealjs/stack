/** 散落形状摆放——「卡片附近空当 ＋ 随机」：
 * 网格采样容器空白 → 过滤出距内容盒（[data-comp]）≤ near 的空当（不胡乱撒）→
 * 种子随机挑位（彼此保距）＋空当内随机偏移＋随机旋转。
 * 种子固定 → 每次渲染一致（视觉基线可测）；容器重排（ResizeObserver）自动重算。 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

type Place = { x: number; y: number; rot: number }

export function Scatter({
  shapes,
  seed = 7,
  near = 150,  // 空当须距某内容盒 ≤ near——只散在卡片附近
  margin = 34, // 与内容盒保持的最小间隙（≥ 最大形状半对角）
  step = 30,   // 采样网格密度
  minGap = 80, // 形状彼此最小间距
}: {
  shapes: ReactNode[]
  seed?: number
  near?: number
  margin?: number
  step?: number
  minGap?: number
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [places, setPlaces] = useState<Place[]>([])

  useLayoutEffect(() => {
    const layer = layerRef.current
    const host = layer?.parentElement
    if (!layer || !host) return

    const place = () => {
      const hb = host.getBoundingClientRect()
      const rects = [...host.querySelectorAll('[data-comp]')].map((el) => el.getBoundingClientRect())
      if (!rects.length || !hb.width) return
      const dist = (x: number, y: number, r: DOMRect) =>
        Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom))
      const cand: { x: number; y: number }[] = []
      for (let x = 36; x < hb.width - 36; x += step)
        for (let y = 36; y < hb.height - 36; y += step) {
          const px = hb.left + x
          const py = hb.top + y
          if (rects.every((r) => dist(px, py, r) >= margin) && rects.some((r) => dist(px, py, r) <= near))
            cand.push({ x, y })
        }
      const rnd = mulberry32(seed)
      for (let i = cand.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1))
        ;[cand[i], cand[j]] = [cand[j], cand[i]]
      }
      const taken: Place[] = []
      for (const c of cand) {
        if (taken.length >= shapes.length) break
        if (taken.some((t) => Math.hypot(t.x - c.x, t.y - c.y) < minGap)) continue
        taken.push({ x: c.x + (rnd() - 0.5) * 14, y: c.y + (rnd() - 0.5) * 14, rot: Math.round((rnd() - 0.5) * 52) })
      }
      setPlaces(taken)
    }

    place()
    const ro = new ResizeObserver(place)
    ro.observe(host)
    return () => ro.disconnect()
  }, [seed, near, margin, step, minGap, shapes.length])

  return (
    <div ref={layerRef} data-scatter-layer aria-hidden className="pointer-events-none absolute inset-0">
      {places.map((p, i) => (
        <div
          key={i}
          data-scatter
          className="absolute"
          style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%) rotate(${p.rot}deg)` }}
        >
          {shapes[i]}
        </div>
      ))}
    </div>
  )
}
