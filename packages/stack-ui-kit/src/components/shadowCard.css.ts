import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

export const shadowCardHost = style({
  display: 'block',
  width: 'fit-content',
})

export const shadowCardWrap = style({
  position: 'relative',
  width: 'fit-content',
  borderRadius: '0.75rem',
  boxShadow: themeVars.shadow.ink,
})

export const shadowCardHover = style({
  transitionProperty: 'translate, box-shadow',
  transitionDuration: '150ms',
})

export const shadowCardBody = style({
  position: 'relative',
  width: '200px',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
})

export const shadowCardTicketWidth = style({
  width: '200px',
})
