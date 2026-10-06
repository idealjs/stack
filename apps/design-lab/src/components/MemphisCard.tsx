/** CourseCard —— 教程的入口载体（孟菲斯骨架 × 拟物纸感）
 * 卡头三件套＝靶子：▲目标 + ○预期结果(16:9 相框) + ●积木点列
 * 交互：hover/聚焦拿起（浮起+投影加深）并播放 GIF；desc ⇄ GIF 每 8000ms 翻转；
 *      hover/Tab 锁定；触屏与 prefers-reduced-motion 不翻转。 */
import { useEffect, useRef, useState } from 'react'
import type { Chapter } from '../lib/types'
import { Ring, Tri } from './shapes'

const FLIP_MS = 8000

export function BrickDots({ bricks }: { bricks: Chapter['target']['bricks'] }) {
  return (
    <span className="flex items-center gap-1" aria-label={`积木 ${bricks.filter((b) => b.learned).length}/${bricks.length}`}>
      {bricks.map((b, i) => (
        <i
          key={i}
          className="inline-block h-[7px] w-[7px] rounded-full border-[1.5px] border-ink"
          style={{ background: b.learned ? 'var(--color-ink)' : '#fff' }}
        />
      ))}
    </span>
  )
}

export function EntryBadge({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span
      className="absolute -left-[11px] -top-[11px] z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-paper bg-ink text-[12px] font-extrabold text-clash2a"
      aria-label={`推荐入口 ${n}`}
    >
      {'①②③'[n - 1]}
    </span>
  )
}

export function MemphisCard({ chapter, entry, compact = false }: { chapter: Chapter; entry?: 1 | 2 | 3; compact?: boolean }) {
  const [gifOn, setGifOn] = useState(false)
  const [locked, setLocked] = useState(false)
  const boxRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const coarse = matchMedia('(pointer: coarse)').matches
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setGifOn(true)
        else setGifOn(false)
      },
      { threshold: 0.3 },
    )
    if (boxRef.current) io.observe(boxRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!gifOn) return
    const t = setInterval(() => {
      setFlip((f) => !f)
    }, FLIP_MS)
    return () => clearInterval(t)
  }, [gifOn])

  const [flip, setFlip] = useState(false)
  const showGif = gifOn && (locked ? true : flip)

  return (
    <a
      ref={boxRef}
      href={`#ch${chapter.id}`}
      data-comp="course-card"
      className="group relative block rounded-[14px] border-2 border-ink bg-paper p-[11px] no-underline
                 shadow-hard transition-transform duration-150 focus-visible:outline-none
                 hover:-translate-y-[3px] hover:shadow-hard-lift
                 focus-visible:-translate-y-[3px] focus-visible:shadow-hard-lift"
      onMouseEnter={() => setLocked(true)}
      onMouseLeave={() => setLocked(false)}
      onFocus={() => setLocked(true)}
      onBlur={() => setLocked(false)}
      aria-label={`${chapter.title}：${chapter.target.goal}`}
    >
      {entry && <EntryBadge n={entry} />}
      {/* ○ 预期结果：16:9 相框（章节撞色只进这里） */}
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border-[3px] border-ink"
        style={{
          background: chapter.color,
          boxShadow: 'inset 0 3px 8px rgba(26,26,26,0.30), inset 0 -1px 0 rgba(255,255,255,0.55)',
        }}
      >
        {showGif ? (
          chapter.gifUrl ? (
            <img src={chapter.gifUrl} alt={chapter.target.expectation} className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-[11px] font-bold leading-snug text-paper">
              ▶ {chapter.target.expectation}
            </span>
          )
        ) : flip ? (
          <span className="px-3 text-center text-[11px] leading-snug text-ink/80 mix-blend-multiply">
            {chapter.target.goal}
          </span>
        ) : (
          /* 静置态：章节 emoji 是相框的视觉主体（对齐设计稿解剖卡） */
          <span style={{ fontSize: compact ? '28px' : '40px' }}>{chapter.emoji}</span>
        )}
        <span className="absolute left-1.5 top-1 text-[9px] font-bold tracking-wide text-paper">
          预期结果{showGif ? ' · GIF' : ''}
        </span>
        <Ring size={16} className="absolute bottom-1.5 right-1.5" />
      </div>
      {/* 卡头：▲ 目标 + 标题 + ● 积木点列 */}
      <div className="mt-2 flex items-center gap-2">
        <Tri size={14} />
        <b className="flex-1 text-[14px] text-[#2b1d10] [text-shadow:0_1px_1px_rgba(255,255,255,0.9)]">
          {chapter.title}
        </b>
        {!compact && <BrickDots bricks={chapter.target.bricks} />}
      </div>
    </a>
  )
}
