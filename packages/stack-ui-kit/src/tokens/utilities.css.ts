import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

const alpha = (color: string, ratio: string): string =>
  `color-mix(in oklab, ${color} ${ratio}, transparent)`

export const pageBase = style({
  backgroundColor: themeVars.color.paper,
  color: themeVars.color.ink,
})

export const bgClash1a = style({ backgroundColor: themeVars.color.clash1a })
export const bgClash1b = style({ backgroundColor: themeVars.color.clash1b })
export const bgClash2a = style({ backgroundColor: themeVars.color.clash2a })
export const bgClash2b = style({ backgroundColor: themeVars.color.clash2b })
export const bgClash3a = style({ backgroundColor: themeVars.color.clash3a })
export const bgClash3b = style({ backgroundColor: themeVars.color.clash3b })
export const bgInk = style({ backgroundColor: themeVars.color.ink })
export const bgPaper = style({ backgroundColor: themeVars.color.paper })
export const bgPaperDeep = style({ backgroundColor: themeVars.color['paper-deep'] })

export const bgInk15 = style({ backgroundColor: alpha(themeVars.color.ink, '15%') })
export const bgInk40 = style({ backgroundColor: alpha(themeVars.color.ink, '40%') })
export const bgInk45 = style({ backgroundColor: alpha(themeVars.color.ink, '45%') })
export const bgClash3b15 = style({ backgroundColor: alpha(themeVars.color.clash3b, '15%') })
export const bgPaperDeep60 = style({ backgroundColor: alpha(themeVars.color['paper-deep'], '60%') })

export const hoverBgClash1a80 = style({
  ':hover': { backgroundColor: alpha(themeVars.color.clash1a, '80%') },
})
export const hoverBgClash1b80 = style({
  ':hover': { backgroundColor: alpha(themeVars.color.clash1b, '80%') },
})
export const hoverBgPaperDeep = style({
  ':hover': { backgroundColor: themeVars.color['paper-deep'] },
})

export const textInk = style({ color: themeVars.color.ink })
export const textInk80 = style({ color: alpha(themeVars.color.ink, '80%') })
export const textPaper = style({ color: themeVars.color.paper })
export const textMute = style({ color: themeVars.color.mute })
export const textBody = style({ color: themeVars.color.body })
export const textClash1a = style({ color: themeVars.color.clash1a })
export const textClash2a = style({ color: themeVars.color.clash2a })

export const hoverTextInk = style({
  ':hover': { color: themeVars.color.ink },
})

export const borderInk = style({ borderColor: themeVars.color.ink })
export const borderInk10 = style({ borderColor: alpha(themeVars.color.ink, '10%') })
export const borderInk15 = style({ borderColor: alpha(themeVars.color.ink, '15%') })
export const borderInk20 = style({ borderColor: alpha(themeVars.color.ink, '20%') })
export const borderInk25 = style({ borderColor: alpha(themeVars.color.ink, '25%') })
export const borderInk40 = style({ borderColor: alpha(themeVars.color.ink, '40%') })
export const borderInk60 = style({ borderColor: alpha(themeVars.color.ink, '60%') })
export const borderPaper = style({ borderColor: themeVars.color.paper })
export const borderTransparent = style({ borderColor: 'transparent' })

export const textContent = style({
  fontSize: themeVars.text.content,
  lineHeight: `var(--tw-leading, ${themeVars.text['content--line-height']})`,
})
export const textT3 = style({
  fontSize: themeVars.text.t3,
  lineHeight: `var(--tw-leading, ${themeVars.text['t3--line-height']})`,
})
export const textT2 = style({
  fontSize: themeVars.text.t2,
  lineHeight: `var(--tw-leading, ${themeVars.text['t2--line-height']})`,
})
export const textT1 = style({
  fontSize: themeVars.text.t1,
  lineHeight: `var(--tw-leading, ${themeVars.text['t1--line-height']})`,
})
export const textSmall = style({
  fontSize: themeVars.text.small,
  lineHeight: `var(--tw-leading, ${themeVars.text['small--line-height']})`,
})

export const tSmallMute = style({
  fontSize: themeVars.text.small,
  lineHeight: themeVars.text['small--line-height'],
  color: themeVars.color.mute,
})
export const tSmallStrong = style({
  fontSize: themeVars.text.small,
  lineHeight: '1.5',
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: themeVars.color.ink,
})
export const tDisplay = style({
  fontSize: '4rem',
  lineHeight: 1,
  fontWeight: 800,
  color: `color-mix(in srgb, ${themeVars.color.ink} 10%, transparent)`,
})

export const hoverBgPaper = style({
  ':hover': { backgroundColor: themeVars.color.paper },
})
export const hoverBgClash1a = style({
  ':hover': { backgroundColor: themeVars.color.clash1a },
})
export const hoverBgClash1b = style({
  ':hover': { backgroundColor: themeVars.color.clash1b },
})
export const hoverBorderInk = style({
  ':hover': { borderColor: themeVars.color.ink },
})
export const hoverTextClash1a = style({
  ':hover': { color: themeVars.color.clash1a },
})
export const hoverShadowInk = style({
  ':hover': { boxShadow: themeVars.shadow.ink },
})
export const hoverShadowInkLift = style({
  ':hover': { boxShadow: themeVars.shadow['ink-lift'] },
})
export const focusBgPaper = style({
  ':focus': { backgroundColor: themeVars.color.paper },
})
export const focusBgPaperDeep = style({
  ':focus': { backgroundColor: themeVars.color['paper-deep'] },
})
export const focusVisibleShadowInkLift = style({
  ':focus-visible': { boxShadow: themeVars.shadow['ink-lift'] },
})
export const lgShadowInk = style({
  '@media': { 'screen and (min-width: 64rem)': { boxShadow: themeVars.shadow.ink } },
})
export const lgShadowInkLift = style({
  '@media': { 'screen and (min-width: 64rem)': { boxShadow: themeVars.shadow['ink-lift'] } },
})
export const lgBorderInk = style({
  '@media': { 'screen and (min-width: 64rem)': { borderColor: themeVars.color.ink } },
})
export const lgBgPaper = style({
  '@media': { 'screen and (min-width: 64rem)': { backgroundColor: themeVars.color.paper } },
})
export const lgBgInk = style({
  '@media': { 'screen and (min-width: 64rem)': { backgroundColor: themeVars.color.ink } },
})
export const maxLgBorderInk = style({
  '@media': { 'screen and (max-width: 63.999rem)': { borderColor: themeVars.color.ink } },
})
export const maxLgBgInk = style({
  '@media': { 'screen and (max-width: 63.999rem)': { backgroundColor: themeVars.color.ink } },
})
