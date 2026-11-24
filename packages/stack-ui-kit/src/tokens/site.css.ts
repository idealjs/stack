import { createTheme, createThemeContract } from '@vanilla-extract/css'
import { paletteVars } from './palette.css'

export const siteVars = createThemeContract({
  color: {
    ch1: null,
    ch2: null,
    ch3: null,
    ch4: null,
    ch5: null,
    ch6: null,
    ch7: null,
  },
  'page-flip': {
    spring: null,
  },
})

export const siteClass = createTheme(siteVars, {
  color: {
    ch1: paletteVars.coral,
    ch2: paletteVars.pink,
    ch3: paletteVars.mustard,
    ch4: paletteVars.teal,
    ch5: paletteVars.blue,
    ch6: paletteVars.violet,
    ch7: paletteVars.green,
  },
  'page-flip': {
    spring:
      'linear(0, 0.31 15%, 0.58 28%, 0.79 40%, 0.93 51%, 1.01 60%, 1.03 66%, 1.02 74%, 1 84%, 1)',
  },
})
