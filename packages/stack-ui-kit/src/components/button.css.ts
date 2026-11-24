import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

export const buttonHost = style({
  display: 'inline-block',
})

export const buttonBase = style({
  display: 'inline-block',
  cursor: 'pointer',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  padding: '0.5rem 1rem',
  fontSize: 'var(--text-small)',
  lineHeight: 'var(--text-small--line-height)',
  fontWeight: 700,
  color: themeVars.color.ink,
  textDecoration: 'none',
  boxShadow: themeVars.shadow.ink,
  transitionProperty: 'translate, box-shadow, background-color, filter',
  transitionDuration: '150ms',
})

export const buttonDisabled = style({
  display: 'inline-block',
  cursor: 'not-allowed',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: `color-mix(in oklab, ${themeVars.color.ink} 40%, transparent)`,
  padding: '0.5rem 1rem',
  fontSize: 'var(--text-small)',
  lineHeight: 'var(--text-small--line-height)',
  fontWeight: 700,
  color: themeVars.color.mute,
})

export const toneBg = {
  clash1a: style({ backgroundColor: themeVars.color.clash1a }),
  clash1b: style({ backgroundColor: themeVars.color.clash1b }),
  clash2a: style({ backgroundColor: themeVars.color.clash2a }),
  clash2b: style({ backgroundColor: themeVars.color.clash2b }),
  clash3a: style({ backgroundColor: themeVars.color.clash3a }),
  clash3b: style({ backgroundColor: themeVars.color.clash3b }),
} as const

export const buttonNested = style({
  display: 'inline-block',
  cursor: 'pointer',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  padding: '0.5rem 1rem',
  fontSize: 'var(--text-small)',
  lineHeight: 'var(--text-small--line-height)',
  fontWeight: 700,
  color: themeVars.color.ink,
  textDecoration: 'none',
  transitionProperty: 'background-color, filter',
  transitionDuration: '150ms',
  ':hover': {
    filter: 'brightness(0.95)',
  },
  ':active': {
    translate: '0 1px',
  },
})
