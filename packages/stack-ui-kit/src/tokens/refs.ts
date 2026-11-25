import type { paletteVars } from './palette.css'
import type { siteVars } from './site.css'
import type { themeVars } from './theme.css'

type Refs<T> = { readonly [K in keyof T]: T[K] extends string ? string : Refs<T[K]> }

export const palette: Refs<typeof paletteVars> = {
  palette: {
    coral: 'var(--palette-coral)',
    teal: 'var(--palette-teal)',
    mustard: 'var(--palette-mustard)',
    violet: 'var(--palette-violet)',
    pink: 'var(--palette-pink)',
    blue: 'var(--palette-blue)',
    green: 'var(--palette-green)',
    black: 'var(--palette-black)',
    cream: 'var(--palette-cream)',
    sand: 'var(--palette-sand)',
    clay: 'var(--palette-clay)',
    graphite: 'var(--palette-graphite)',
  },
}

export const theme: Refs<typeof themeVars> = {
  color: {
    clash1a: 'var(--color-clash1a)',
    clash1b: 'var(--color-clash1b)',
    clash2a: 'var(--color-clash2a)',
    clash2b: 'var(--color-clash2b)',
    clash3a: 'var(--color-clash3a)',
    clash3b: 'var(--color-clash3b)',
    ink: 'var(--color-ink)',
    paper: 'var(--color-paper)',
    'paper-deep': 'var(--color-paper-deep)',
    mute: 'var(--color-mute)',
    body: 'var(--color-body)',
  },
  shadow: {
    ink: 'var(--shadow-ink)',
    'ink-lift': 'var(--shadow-ink-lift)',
  },
  'drop-shadow': {
    ink: 'var(--drop-shadow-ink)',
    'ink-lift': 'var(--drop-shadow-ink-lift)',
  },
  text: {
    content: 'var(--text-content)',
    'content--line-height': 'var(--text-content--line-height)',
    t3: 'var(--text-t3)',
    't3--line-height': 'var(--text-t3--line-height)',
    t2: 'var(--text-t2)',
    't2--line-height': 'var(--text-t2--line-height)',
    t1: 'var(--text-t1)',
    't1--line-height': 'var(--text-t1--line-height)',
    small: 'var(--text-small)',
    'small--line-height': 'var(--text-small--line-height)',
  },
}

export const site: Refs<typeof siteVars> = {
  color: {
    ch1: 'var(--color-ch1)',
    ch2: 'var(--color-ch2)',
    ch3: 'var(--color-ch3)',
    ch4: 'var(--color-ch4)',
    ch5: 'var(--color-ch5)',
    ch6: 'var(--color-ch6)',
    ch7: 'var(--color-ch7)',
  },
  'page-flip': {
    spring: 'var(--page-flip-spring)',
  },
}
