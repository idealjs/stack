import { style } from '@vanilla-extract/css'
import { themeVars } from '@idealjs/stack-ui-kit/tokens'

export const scene = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '1rem',
  backgroundColor: themeVars.color.paper,
})

export const plainCard = style({
  position: 'relative',
  display: 'block',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: '#ffffff',
  padding: '0.75rem',
  textDecoration: 'none',
})

export const plainCardTitle = style({
  display: 'block',
  fontSize: '13px',
  fontWeight: 800,
  color: themeVars.color.ink,
})

export const cardBadge = style({
  position: 'absolute',
  right: '-0.5rem',
  top: '-0.5rem',
  zIndex: 10,
  display: 'flex',
  height: '1.5rem',
  minWidth: '1.5rem',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: '#ffffff',
  padding: '0 0.25rem',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '11px',
  fontWeight: 700,
  color: themeVars.color.ink,
})
