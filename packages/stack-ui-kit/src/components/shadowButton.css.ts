import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

export const shadowButtonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  color: themeVars.color.ink,
  textDecoration: 'none',
  transitionProperty: 'translate, box-shadow, background-color, filter',
  transitionDuration: '150ms',
  ':focus-visible': {
    outlineWidth: '3px',
    outlineStyle: 'solid',
    outlineColor: themeVars.color.clash3b,
    outlineOffset: '2px',
  },
})

export const shadowButtonSize = {
  md: style({
    borderRadius: '0.75rem',
    padding: '0.5rem 1rem',
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small--line-height)',
    fontWeight: 700,
  }),
  sm: style({
    borderRadius: '0.5rem',
    padding: '0.25rem 0.625rem',
    fontSize: 'var(--text-content)',
    lineHeight: 'var(--text-content--line-height)',
    fontWeight: 700,
  }),
  none: style({
    borderRadius: '0.5rem',
  }),
} as const

export const shadowButtonToneBg = {
  ghost: style({}),
  paper: style({ backgroundColor: themeVars.color.paper }),
  clash1a: style({ backgroundColor: themeVars.color.clash1a }),
  clash1b: style({ backgroundColor: themeVars.color.clash1b }),
  clash2a: style({ backgroundColor: themeVars.color.clash2a }),
  clash2b: style({ backgroundColor: themeVars.color.clash2b }),
  clash3a: style({ backgroundColor: themeVars.color.clash3a }),
  clash3b: style({ backgroundColor: themeVars.color.clash3b }),
} as const

export const shadowButtonRest = style({
  boxShadow: `3px 3px 0 ${themeVars.color.ink}`,
})

export const shadowButtonPressed = style({
  ':active': {
    translate: '2px 2px',
    boxShadow: `1px 1px 0 ${themeVars.color.ink}`,
  },
})

export const shadowButtonRingRest = style({
  backgroundColor: themeVars.color['paper-deep'],
  boxShadow: `inset 0 0 0 2px ${themeVars.color.ink}, 3px 3px 0 ${themeVars.color.ink}`,
})

export const shadowButtonRingPressed = style({
  ':active': {
    translate: '2px 2px',
    boxShadow: `inset 0 0 0 2px ${themeVars.color.ink}, 1px 1px 0 ${themeVars.color.ink}`,
  },
})

export const shadowButtonHost = style({
  display: 'inline-flex',
})

export const shadowButtonDisabled = style({
  display: 'inline-flex',
  cursor: 'not-allowed',
  alignItems: 'center',
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

export const shadowButtonNested = style({
  ':hover': {
    filter: 'brightness(0.95)',
  },
  ':active': {
    translate: '0 1px',
  },
})
