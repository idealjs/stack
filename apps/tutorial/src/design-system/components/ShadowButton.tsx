import type { MouseEventHandler, ReactNode } from 'react'

export type ShadowButtonTone =
  | 'paper'
  | 'clash1a'
  | 'clash1b'
  | 'clash2a'
  | 'clash2b'
  | 'clash3a'
  | 'clash3b'

const TONE_BG: Record<ShadowButtonTone, string> = {
  paper: 'bg-paper',
  clash1a: 'bg-clash1a',
  clash1b: 'bg-clash1b',
  clash2a: 'bg-clash2a',
  clash2b: 'bg-clash2b',
  clash3a: 'bg-clash3a',
  clash3b: 'bg-clash3b',
}

export const SHADOW_BUTTON_BASE =
  'cursor-pointer items-center justify-center border-2 border-ink text-ink no-underline transition-[translate,box-shadow,background-color] duration-150 focus-visible:outline-[3px] focus-visible:outline-clash3b focus-visible:outline-offset-2'

export const SHADOW_BUTTON_REST = 'shadow-[3px_3px_0_var(--color-ink)]'

export const SHADOW_BUTTON_ACTIVE =
  'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)]'

const RING_REST =
  'bg-paper-deep shadow-[inset_0_0_0_2px_var(--color-ink),3px_3px_0_var(--color-ink)]'
const RING_ACTIVE =
  'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[inset_0_0_0_2px_var(--color-ink),1px_1px_0_var(--color-ink)]'

const SIZE = {
  md: 'rounded-xl px-4 py-2 text-small font-bold',

  sm: 'rounded-lg px-2.5 py-1 text-content font-bold',

  none: 'rounded-lg',
} as const

export interface ShadowButtonClassesOptions {
  tone?: ShadowButtonTone

  active?: boolean

  size?: keyof typeof SIZE

  className?: string
}

export function shadowButtonClasses({
  tone = 'paper',
  active = false,
  size = 'md',
  className = '',
}: ShadowButtonClassesOptions = {}) {
  return [
    SHADOW_BUTTON_BASE,
    SIZE[size],
    active
      ? `hoverable-shadow shadow-btn-ring ${RING_REST} ${RING_ACTIVE}`
      : `hoverable-shadow shadow-btn ${TONE_BG[tone]} ${SHADOW_BUTTON_REST} ${SHADOW_BUTTON_ACTIVE}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export interface ShadowButtonProps {
  tone?: ShadowButtonTone

  active?: boolean

  href?: string

  disabled?: boolean

  size?: keyof typeof SIZE

  className?: string
  children: ReactNode
  onClick?: MouseEventHandler<HTMLElement>
}

export function ShadowButton({
  tone = 'paper',
  active = false,
  href,
  disabled = false,
  size = 'md',
  className = '',
  children,
  onClick,
}: ShadowButtonProps) {
  const cls = `inline-flex ${shadowButtonClasses({ tone, active, size, className })}`
  if (disabled) {
    return (
      <span
        data-comp="shadow-button"
        aria-disabled
        className="inline-flex cursor-not-allowed items-center rounded-xl border-2 border-dashed border-ink/40 px-4 py-2 text-small font-bold text-mute"
      >
        {children}
      </span>
    )
  }
  return (
    <span className="hover-host inline-flex">
      {href ? (
        <a href={href} data-comp="shadow-button" className={cls}>
          {children}
        </a>
      ) : (
        <button type="button" data-comp="shadow-button" onClick={onClick} className={cls}>
          {children}
        </button>
      )}
    </span>
  )
}
