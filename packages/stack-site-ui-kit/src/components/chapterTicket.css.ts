import { style } from '@vanilla-extract/css'
import { theme } from '@idealjs/stack-ui-kit/tokens'

export const ticketFaceRow = style({
  display: 'flex',
  width: '200px',
  alignItems: 'stretch',
})

export const emojiZone = style({
  display: 'flex',
  width: '3rem',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
})

export const titleZone = style({
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center',
  paddingTop: '0.625rem',
  paddingBottom: '0.625rem',
  paddingLeft: '0.625rem',
  paddingRight: '0.5rem',
})

export const titleText = style({
  fontSize: theme.text.content,
  lineHeight: `var(--tw-leading, ${theme.text['content--line-height']})`,
  fontWeight: 700,
})

export const stubZone = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: theme.text.small,
  lineHeight: `var(--tw-leading, ${theme.text['small--line-height']})`,
  color: theme.color.mute,
})

export const stubDashed = style({ borderStyle: 'dashed' })
export const stubSolid = style({ borderStyle: 'solid' })
