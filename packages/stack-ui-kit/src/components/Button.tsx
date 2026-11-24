import type { ReactNode } from 'react'
import { hoverHost } from './hoverHost.css.ts'
import { buttonBase, buttonDisabled, buttonHost, buttonNested, toneBg } from './button.css.ts'
import { hoverableShadow, shadowInk } from './effectClasses.css.ts'

export function Button({
  tone = 'clash1a',
  href,
  disabled = false,
  nested = false,
  children,
}: {
  tone?: keyof typeof toneBg

  href?: string

  disabled?: boolean

  nested?: boolean
  children: ReactNode
}) {
  if (disabled) {
    return (
      <span aria-disabled className={buttonDisabled}>
        {children}
      </span>
    )
  }
  const cls = `${nested ? buttonNested : `${buttonBase} ${hoverableShadow} ${shadowInk}`} ${toneBg[tone]}`
  if (href) {
    return nested ? (
      <a href={href} className={cls}>
        {children}
      </a>
    ) : (
      <span className={`${hoverHost} ${buttonHost}`}>
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
    <span className={`${hoverHost} ${buttonHost}`}>
      <button type="button" className={cls}>
        {children}
      </button>
    </span>
  )
}
