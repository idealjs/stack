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
    ch1: paletteVars.palette.coral,
    ch2: paletteVars.palette.pink,
    ch3: paletteVars.palette.mustard,
    ch4: paletteVars.palette.teal,
    ch5: paletteVars.palette.blue,
    ch6: paletteVars.palette.violet,
    ch7: paletteVars.palette.green,
  },
  'page-flip': {
    spring:
      'linear(0, 0.31 15%, 0.58 28%, 0.79 40%, 0.93 51%, 1.01 60%, 1.03 66%, 1.02 74%, 1 84%, 1)',
  },
})
