import type { CSSProperties } from 'react'
import type { Chapter } from '../lib/types'

export interface FlipPeekCardProps {
  chapter: Chapter
  side: 'prev' | 'next'
}

export function FlipPeekCard({ chapter, side }: FlipPeekCardProps) {
  const label = side === 'next' ? '下一章预览' : '上一章预览'
  return (
    <div
      data-flip-peek
      className="relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-ink p-5 shadow-ink"
      style={{ background: chapter.color } as CSSProperties}
    >
      <span
        className="t-display pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none"
        aria-hidden
      >
        0{chapter.id}
      </span>
      <span className="text-[44px] leading-none">{chapter.emoji}</span>
      <div className="flex-1">
        <div className="t-small-strong text-ink/70">{label}</div>
        <div className="mt-0.5 text-t1 font-extrabold text-ink">
          第 {chapter.id} 章 · {chapter.title}
        </div>
      </div>
    </div>
  )
}
