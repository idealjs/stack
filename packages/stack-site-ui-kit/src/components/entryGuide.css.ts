import { style } from '@vanilla-extract/css'
import { theme } from '@idealjs/stack-ui-kit/tokens'

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
  borderColor: theme.color.ink,
  backgroundColor: theme.color.paper,
  padding: '0.75rem',
  boxShadow: theme.shadow.ink,
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
  borderColor: theme.color.ink,
  fontSize: '14px',
})

export const guideName = style({
  fontSize: theme.text.t3,
  lineHeight: `var(--tw-leading, ${theme.text['t3--line-height']})`,
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
  fontSize: theme.text.small,
  lineHeight: `var(--tw-leading, ${theme.text['small--line-height']})`,
  color: theme.color.mute,
})

export const pathChip = style({
  borderRadius: '9999px',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: theme.color.ink,
  padding: '0.125rem 0.625rem',
  fontSize: theme.text.small,
  lineHeight: `var(--tw-leading, ${theme.text['small--line-height']})`,
  textDecoration: 'none',
  backgroundColor: '#ffffff',
})

export const pathChipEntry = style({
  backgroundColor: theme.color.clash2a,
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
  fontSize: theme.text.small,
  lineHeight: theme.text['small--line-height'],
  color: theme.color.mute,
})
