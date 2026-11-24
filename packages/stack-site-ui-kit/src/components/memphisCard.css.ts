import { style } from '@vanilla-extract/css'
import { themeVars } from '@idealjs/stack-ui-kit/tokens'

export const brickDots = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
})

export const brickDot = style({
  display: 'inline-block',
  height: '7px',
  width: '7px',
  borderRadius: '9999px',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
})

export const entryBadge = style({
  position: 'absolute',
  left: '-11px',
  top: '-11px',
  zIndex: 10,
  display: 'flex',
  height: '1.5rem',
  width: '1.5rem',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.paper,
  backgroundColor: themeVars.color.ink,
  fontSize: '12px',
  fontWeight: 800,
  color: themeVars.color.clash2a,
})

export const cardLink = style({
  position: 'relative',
  display: 'block',
  borderRadius: '14px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
  padding: '11px',
  textDecoration: 'none',
  ':focus-visible': {
    outline: 'none',
    translate: '0 -3px',
  },
})

export const cardZone = style({
  position: 'relative',
  display: 'flex',
  aspectRatio: '16 / 9',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: '0.5rem',
  borderWidth: 3,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
})

export const cardZoneGif = style({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
})

export const cardZoneTextBase = style({
  padding: '0 0.75rem',
  textAlign: 'center',
  fontSize: themeVars.text.small,
  lineHeight: '1.375',
})

export const cardZoneExpect = style({
  fontWeight: 700,
  color: themeVars.color.paper,
})

export const cardZoneGoal = style({
  color: 'color-mix(in oklab, var(--color-ink) 80%, transparent)',
  mixBlendMode: 'multiply',
})

export const cardZoneZoneText = style({
  fontWeight: 600,
  color: themeVars.color.ink,
})

export const cardZoneBadge = style({
  position: 'absolute',
  left: '0.375rem',
  top: '0.25rem',
  fontSize: themeVars.text.small,
  lineHeight: `var(--tw-leading, ${themeVars.text['small--line-height']})`,
  fontWeight: 700,
  letterSpacing: '0.025em',
  color: themeVars.color.paper,
})

export const cardHead = style({
  marginTop: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})

export const cardTitle = style({
  flexGrow: 1,
  fontSize: themeVars.text.t3,
  lineHeight: `var(--tw-leading, ${themeVars.text['t3--line-height']})`,
  color: '#2b1d10',
  textShadow: '0 1px 1px rgba(255,255,255,0.9)',
})
