import { createTheme, createThemeContract } from '@vanilla-extract/css'
import { paletteVars } from './palette.css'

export const themeVars = createThemeContract({
  color: {
    clash1a: null,
    clash1b: null,
    clash2a: null,
    clash2b: null,
    clash3a: null,
    clash3b: null,
    ink: null,
    paper: null,
    'paper-deep': null,
    mute: null,
    body: null,
  },
  shadow: {
    ink: null,
    'ink-lift': null,
  },
  'drop-shadow': {
    ink: null,
    'ink-lift': null,
  },
  text: {
    content: null,
    'content--line-height': null,
    t3: null,
    't3--line-height': null,
    t2: null,
    't2--line-height': null,
    t1: null,
    't1--line-height': null,
    small: null,
    'small--line-height': null,
  },
})

export const themeClass = createTheme(themeVars, {
  color: {
    clash1a: paletteVars.palette.coral,
    clash1b: paletteVars.palette.teal,
    clash2a: paletteVars.palette.mustard,
    clash2b: paletteVars.palette.violet,
    clash3a: paletteVars.palette.pink,
    clash3b: paletteVars.palette.blue,
    ink: paletteVars.palette.black,
    paper: paletteVars.palette.cream,
    'paper-deep': paletteVars.palette.sand,
    mute: paletteVars.palette.clay,
    body: paletteVars.palette.graphite,
  },
  shadow: {
    ink: `5px 5px 0 ${themeVars.color.ink}`,
    'ink-lift': `8px 8px 0 ${themeVars.color.ink}`,
  },
  'drop-shadow': {
    ink: `5px 5px 0 ${themeVars.color.ink}`,
    'ink-lift': `8px 8px 0 ${themeVars.color.ink}`,
  },
  text: {
    content: '1rem',
    'content--line-height': '1.75',
    t3: '1.125rem',
    't3--line-height': '1.5',
    t2: '1.375rem',
    't2--line-height': '1.45',
    t1: '1.75rem',
    't1--line-height': '1.3',
    small: '0.75rem',
    'small--line-height': '1.65',
  },
})
