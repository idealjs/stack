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
  'inline-block cursor-pointer rounded-xl border-2 border-ink px-4 py-2 text-small font-bold text-ink no-underline shadow-ink hoverable-shadow transition-[translate,box-shadow,background-color,filter] duration-150'

const NESTED =
  'inline-block cursor-pointer rounded-xl border-2 border-ink px-4 py-2 text-small font-bold text-ink no-underline transition-[background-color,filter] duration-150 hover:brightness-95 active:translate-y-[1px]'

export function Button({
  tone = 'clash1a',
  href,
  disabled = false,
  nested = false,
  children,
}: {
  tone?: keyof typeof TONE_BG

  href?: string

  disabled?: boolean

  nested?: boolean
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
  const cls = `${nested ? NESTED : BASE} ${TONE_BG[tone]}`
  if (href) {
    return nested ? (
      <a href={href} className={cls}>
        {children}
      </a>
    ) : (
      <span className="hover-host inline-block">
        <a href={href} className={cls}>
          {children}
        </a>
      </span>
    )
  }
  return nested ? (
    <button type="button" className={cls}>
      {children}
    </button>
  ) : (
    <span className="hover-host inline-block">
      <button type="button" className={cls}>
        {children}
      </button>
    </span>
  )
}
