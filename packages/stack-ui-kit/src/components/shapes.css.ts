import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

export const mark = style({
  rotate: '-1deg',
  borderRadius: '3px',
  backgroundColor: themeVars.color.clash2a,
  padding: '1px 4px',
  fontWeight: 700,
  color: themeVars.color.ink,
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
})
