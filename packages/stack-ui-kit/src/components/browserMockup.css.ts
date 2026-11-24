import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

export const mockup = style({
  overflow: 'hidden',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
  boxShadow: themeVars.shadow.ink,
})

export const mockupBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  borderBottomWidth: 2,
  borderBottomStyle: 'solid',
  borderBottomColor: themeVars.color.ink,
  backgroundColor: themeVars.color['paper-deep'],
  padding: '0.625rem 0.75rem',
})

export const mockupDots = style({
  display: 'flex',
  flexShrink: 0,
  gap: '0.25rem',
})

export const mockupDot = style({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '9999px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
})

export const mockupAddress = style({
  display: 'flex',
  height: '1.75rem',
  minWidth: 0,
  flexGrow: 1,
  alignItems: 'center',
  gap: '0.375rem',
  overflow: 'hidden',
  borderRadius: '9999px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
  padding: '0 0.75rem',
})

export const mockupAddressIcon = style({
  width: '0.875rem',
  height: '0.875rem',
  flexShrink: 0,
  opacity: 0.6,
})

export const mockupAddressText = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  fontWeight: 700,
  color: themeVars.color.ink,
})

export const mockupViewport = style({
  backgroundColor: '#ffffff',
})
