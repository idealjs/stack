import { createTheme, createThemeContract } from '@vanilla-extract/css'

export const paletteVars = createThemeContract({
  palette: {
    coral: null,
    teal: null,
    mustard: null,
    violet: null,
    pink: null,
    blue: null,
    green: null,
    black: null,
    cream: null,
    sand: null,
    clay: null,
    graphite: null,
  },
})

export const paletteClass = createTheme(paletteVars, {
  palette: {
    coral: '#ff6b6b',
    teal: '#4ecdc4',
    mustard: '#ffd93d',
    violet: '#a78bfa',
    pink: '#ff8fab',
    blue: '#5b8def',
    green: '#51cf66',
    black: '#111111',
    cream: '#fff9f0',
    sand: '#f2ead9',
    clay: '#8a7a5c',
    graphite: '#3d3d3d',
  },
})
