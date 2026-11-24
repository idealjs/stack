import { style } from '@vanilla-extract/css'

export const noTransitionOnReduce = style({
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
})
