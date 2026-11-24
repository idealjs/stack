import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'
import { hoverHost } from './hoverHost.css.ts'

const ink = themeVars.color.ink

export const hoverableShadow = style({
  position: 'relative',
  selectors: {
    [`${hoverHost}:hover &`]: {
      translate: '0 -3px',
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
  },
})

export const shadowInk = style({
  boxShadow: themeVars.shadow.ink,
  selectors: {
    [`${hoverHost}:hover &`]: {
      boxShadow: themeVars.shadow['ink-lift'],
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
  },
})

export const shadowInkLift = style({
  boxShadow: themeVars.shadow['ink-lift'],
})

export const dropShadowInk = style({
  filter: `drop-shadow(${themeVars['drop-shadow'].ink})`,
  selectors: {
    [`${hoverHost}:hover &`]: {
      filter: `drop-shadow(${themeVars['drop-shadow']['ink-lift']})`,
    },
  },
})

export const dropShadowInkLift = style({
  filter: `drop-shadow(${themeVars['drop-shadow']['ink-lift']})`,
})

export const shadowBtn = style({
  boxShadow: `3px 3px 0 ${ink}`,
  selectors: {
    [`${hoverHost}:hover &`]: {
      translate: '0 -2px',
      boxShadow: `5px 5px 0 ${ink}`,
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
    [`${hoverHost}:hover &:active`]: {
      translate: '2px 2px',
      boxShadow: `1px 1px 0 ${ink}`,
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
  },
})

export const shadowBtnRing = style({
  boxShadow: `inset 0 0 0 2px ${ink}, 3px 3px 0 ${ink}`,
  selectors: {
    [`${hoverHost}:hover &`]: {
      translate: '0 -2px',
      boxShadow: `inset 0 0 0 2px ${ink}, 5px 5px 0 ${ink}`,
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
    [`${hoverHost}:hover &:active`]: {
      translate: '2px 2px',
      boxShadow: `inset 0 0 0 2px ${ink}, 1px 1px 0 ${ink}`,
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
  },
})

export const liftSm = style({
  selectors: {
    [`${hoverHost}:hover &`]: {
      translate: '0 -2px',
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
  },
})

export const ticketLift = style({
  transition: 'translate 150ms',
  selectors: {
    [`${hoverHost}:hover &`]: {
      translate: '0 -3px',
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          translate: 'none',
        },
      },
    },
  },
})

export const ticketShadow = style({
  filter: `drop-shadow(${themeVars['drop-shadow'].ink})`,
  transition: 'filter 150ms',
  selectors: {
    [`${hoverHost}:hover .${ticketLift} &`]: {
      filter: `drop-shadow(${themeVars['drop-shadow']['ink-lift']})`,
    },
  },
})
