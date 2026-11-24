import type { MouseEventHandler, ReactNode } from 'react'
import { hoverHost } from './hoverHost.css.ts'
import { hoverableShadow, shadowBtn, shadowBtnRing } from './effectClasses.css.ts'
import {
  shadowButtonBase,
  shadowButtonDisabled,
  shadowButtonHost,
  shadowButtonNested,
  shadowButtonPressed,
  shadowButtonRest,
  shadowButtonRingPressed,
  shadowButtonRingRest,
  shadowButtonSize,
  shadowButtonToneBg,
} from './shadowButton.css.ts'

export type ShadowButtonTone =
  | 'ghost'
  | 'paper'
  | 'clash1a'
  | 'clash1b'
  | 'clash2a'
  | 'clash2b'
  | 'clash3a'
  | 'clash3b'

export const SHADOW_BUTTON_BASE = shadowButtonBase

export const SHADOW_BUTTON_REST = shadowButtonRest

export const SHADOW_BUTTON_ACTIVE = shadowButtonPressed

export const SHADOW_BUTTON_NESTED = shadowButtonNested

export interface ShadowButtonClassesOptions {
  tone?: ShadowButtonTone

  active?: boolean

  nested?: boolean

  size?: keyof typeof shadowButtonSize

  className?: string
}

export function shadowButtonClasses({
  tone = 'paper',
  active = false,
  nested = false,
  size = 'md',
  className = '',
}: ShadowButtonClassesOptions = {}) {
  return [
    SHADOW_BUTTON_BASE,
    shadowButtonSize[size],
    nested
      ? `${shadowButtonToneBg[tone]} ${SHADOW_BUTTON_NESTED}`
      : active
        ? `${hoverableShadow} ${shadowBtnRing} ${shadowButtonRingRest} ${shadowButtonRingPressed}`
        : `${hoverableShadow} ${shadowBtn} ${shadowButtonToneBg[tone]} ${SHADOW_BUTTON_REST} ${SHADOW_BUTTON_ACTIVE}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export interface ShadowButtonProps {
  tone?: ShadowButtonTone

  active?: boolean

  nested?: boolean

  href?: string

  disabled?: boolean

  size?: keyof typeof shadowButtonSize

  className?: string
  children: ReactNode
  onClick?: MouseEventHandler<HTMLElement>
}

export function ShadowButton({
  tone = 'paper',
  active = false,
  nested = false,
  href,
  disabled = false,
  size = 'md',
  className = '',
  children,
  onClick,
}: ShadowButtonProps) {
  const cls = shadowButtonClasses({ tone, active, nested, size, className })
  if (disabled) {
    return (
      <span data-comp="shadow-button" aria-disabled className={shadowButtonDisabled}>
        {children}
      </span>
    )
  }
  const inner = href ? (
    <a href={href} data-comp="shadow-button" className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" data-comp="shadow-button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
  return nested ? inner : <span className={`${hoverHost} ${shadowButtonHost}`}>{inner}</span>
}
