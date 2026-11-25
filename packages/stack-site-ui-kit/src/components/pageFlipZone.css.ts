import { style } from '@vanilla-extract/css'
import { theme } from '@idealjs/stack-ui-kit/tokens'

export const edge = style({
  pointerEvents: 'none',
  position: 'fixed',
  left: 0,
  right: 0,
  zIndex: 60,
})

export const edgeNext = style({ bottom: 0 })
export const edgePrev = style({ top: 0 })

export const badgeAnchorNext = style({ position: 'absolute', left: 0, right: 0, bottom: '1rem' })
export const badgeAnchorPrev = style({ position: 'absolute', left: 0, right: 0, top: '1rem' })

export const badgeAnchor = style({ display: 'flex', justifyContent: 'center' })

export const flipButton = style({
  cursor: 'pointer',
  borderRadius: '9999px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: theme.color.ink,
  padding: '0.25rem 0.75rem',
  fontSize: '12px',
  fontWeight: 700,
  color: theme.color.ink,
  boxShadow: theme.shadow.ink,
  transitionProperty: 'translate, box-shadow',
  transitionDuration: '150ms',
  pointerEvents: 'var(--flip-pointer)',
  ':hover': {
    translate: '0 -0.125rem',
    boxShadow: theme.shadow['ink-lift'],
  },
  ':active': {
    translate: '2px 2px',
    boxShadow: `1px 1px 0 ${theme.color.ink}`,
  },
})

export const barAnchorNext = style({ position: 'absolute', left: 0, right: 0, bottom: 0 })
export const barAnchorPrev = style({ position: 'absolute', left: 0, right: 0, top: 0 })

export const barTrack = style({
  height: '0.25rem',
  backgroundColor: `color-mix(in oklab, ${theme.color.ink} 15%, transparent)`,
})

export const barFill = style({
  height: '100%',
  width: '100%',
  transformOrigin: 'left',
  backgroundColor: theme.color.ink,
})
