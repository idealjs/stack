import type { ReactNode } from 'react'

const TONE_BG = {
  clash1a: 'bg-clash1a',
  clash1b: 'bg-clash1b',
  clash2a: 'bg-clash2a',
  clash2b: 'bg-clash2b',
  clash3a: 'bg-clash3a',
  clash3b: 'bg-clash3b',
} as const

const BASE =
  'inline-block cursor-pointer rounded-xl border-2 border-ink px-4 py-2 text-small font-bold text-ink no-underline shadow-ink transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-ink-lift'

export function Button({
  tone = 'clash1a',
  href,
  disabled = false,
  children,
}: {
  tone?: keyof typeof TONE_BG

  href?: string

  disabled?: boolean
  children: ReactNode
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="inline-block cursor-not-allowed rounded-xl border-2 border-dashed border-ink/40 px-4 py-2 text-small font-bold text-mute"
      >
        {children}
      </span>
    )
  }
  if (href) {
    return (
      <a href={href} className={`${BASE} ${TONE_BG[tone]}`}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={`${BASE} ${TONE_BG[tone]}`}>
      {children}
    </button>
  )
}
