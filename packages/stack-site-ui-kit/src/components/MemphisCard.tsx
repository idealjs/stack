import { Ring, Tri } from '@idealjs/stack-ui-kit'
import { hoverHost, hoverableShadow, shadowInk } from '@idealjs/stack-ui-kit/styles'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import type { Chapter } from '../types'
import {
  brickDot,
  brickDots,
  cardHead,
  cardLink,
  cardTitle,
  cardZone,
  cardZoneBadge,
  cardZoneExpect,
  cardZoneGif,
  cardZoneGoal,
  cardZoneTextBase,
  cardZoneZoneText,
  entryBadge,
} from './memphisCard.css'

const FLIP_MS = 8000

export function BrickDots({ bricks }: { bricks: Chapter['target']['bricks'] }) {
  return (
    <span
      role="img"
      className={brickDots}
      aria-label={`积木 ${bricks.filter((b) => b.learned).length}/${bricks.length}`}
    >
      {bricks.map((b) => (
        <i
          key={b.name}
          className={brickDot}
          style={{ background: b.learned ? 'var(--color-ink)' : '#fff' }}
        />
      ))}
    </span>
  )
}

export function EntryBadge({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span role="img" className={entryBadge} aria-label={`推荐入口 ${n}`}>
      {'①②③'[n - 1]}
    </span>
  )
}

export function MemphisCard({
  chapter,
  entry,
  compact = false,
  zoneText,
  href,
  morph = false,
  corner,
}: {
  chapter: Chapter
  entry?: 1 | 2 | 3
  compact?: boolean

  zoneText?: ReactNode

  href?: string

  morph?: boolean

  corner?: ReactNode
}) {
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
    <span className={`${hoverHost} block`}>
      <a
        ref={boxRef}
        href={href ?? `#ch${chapter.id}`}
        data-comp="course-card"
        className={`group ${hoverableShadow} ${shadowInk} ${cardLink}`}
        onMouseEnter={() => setLocked(true)}
        onMouseLeave={() => setLocked(false)}
        onFocus={() => setLocked(true)}
        onBlur={() => setLocked(false)}
        aria-label={`${chapter.title}：${chapter.target.goal}`}
      >
        {entry && <EntryBadge n={entry} />}
        {corner}
        <div
          className={cardZone}
          style={{
            background: chapter.color,
            boxShadow: 'inset 0 3px 8px rgba(26,26,26,0.30), inset 0 -1px 0 rgba(255,255,255,0.55)',
            ...(morph ? { viewTransitionName: `ch-${chapter.id}` } : {}),
          }}
        >
          {showGif ? (
            chapter.gifUrl ? (
              <img src={chapter.gifUrl} alt={chapter.target.expectation} className={cardZoneGif} />
            ) : (
              <span className={`${cardZoneTextBase} ${cardZoneExpect}`}>
                ▶ {chapter.target.expectation}
              </span>
            )
          ) : flip ? (
            <span className={`${cardZoneTextBase} ${cardZoneGoal}`}>{chapter.target.goal}</span>
          ) : zoneText ? (
            <span className={`${cardZoneTextBase} ${cardZoneZoneText}`}>{zoneText}</span>
          ) : (
            <span style={{ fontSize: compact ? '28px' : '40px' }}>{chapter.emoji}</span>
          )}
          <span className={cardZoneBadge}>预期结果{showGif ? ' · GIF' : ''}</span>
          <Ring size={16} className="absolute bottom-1.5 right-1.5" />
        </div>
        <div className={cardHead}>
          <Tri size={14} />
          <b className={cardTitle}>{chapter.title}</b>
          {!compact && <BrickDots bricks={chapter.target.bricks} />}
        </div>
      </a>
    </span>
  )
}
