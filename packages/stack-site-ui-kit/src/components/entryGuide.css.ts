import { style } from '@vanilla-extract/css'
import { themeVars } from '@idealjs/stack-ui-kit/tokens'

export const guideRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.25rem',
})

export const guideCard = style({
  width: '252px',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
  padding: '0.75rem',
  boxShadow: themeVars.shadow.ink,
})

export const guideHead = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})

export const guideIcon = style({
  display: 'flex',
  height: '26px',
  width: '26px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.5rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  fontSize: '14px',
})

export const guideName = style({
  fontSize: themeVars.text.t3,
  lineHeight: `var(--tw-leading, ${themeVars.text['t3--line-height']})`,
})

export const pathRow = style({
  marginTop: '0.5rem',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.375rem',
})

export const pathItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
})

export const pathArrow = style({
  fontSize: themeVars.text.small,
  lineHeight: `var(--tw-leading, ${themeVars.text['small--line-height']})`,
  color: themeVars.color.mute,
})

export const pathChip = style({
  borderRadius: '9999px',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  padding: '0.125rem 0.625rem',
  fontSize: themeVars.text.small,
  lineHeight: `var(--tw-leading, ${themeVars.text['small--line-height']})`,
  textDecoration: 'none',
  backgroundColor: '#ffffff',
})

export const pathChipEntry = style({
  backgroundColor: themeVars.color.clash2a,
  fontWeight: 800,
})

export const pathChipLink = style({
  selectors: {
    '&:hover': {
      filter: 'brightness(0.96)',
    },
  },
})

export const guideNote = style({
  margin: 0,
  marginTop: '0.5rem',
  fontSize: themeVars.text.small,
  lineHeight: themeVars.text['small--line-height'],
  color: themeVars.color.mute,
})
