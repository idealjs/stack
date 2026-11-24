import { style } from '@vanilla-extract/css'
import { themeVars } from '../tokens/theme.css'

export const ticketHost = style({
  display: 'block',
  width: 'fit-content',
})

export const ticketShell = style({
  vars: {
    '--ticket-border': '2px',
    '--ticket-stub-width': '38px',
    '--ticket-perforation-width': '1.5px',
    '--hole-radius': '6px',
    '--hole-x':
      'calc(100% - var(--ticket-border) - var(--ticket-stub-width) + var(--ticket-perforation-width) / 2)',
  },
  position: 'relative',
  width: 'fit-content',
  borderRadius: '0.75rem',
})

export const ticketFace = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0.75rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
})

export const ticketTitle = style({
  minWidth: 0,
  overflowWrap: 'anywhere',
})

export const ticketStub = style({
  width: 'var(--ticket-stub-width)',
  borderLeftWidth: 'var(--ticket-perforation-width)',
  borderLeftColor: themeVars.color.ink,
})

export const ticketPerforation = style({
  position: 'absolute',
  inset: 'calc(0px - var(--ticket-border))',
  pointerEvents: 'none',
  '::before': {
    content: '""',
    position: 'absolute',
    insetBlock: 0,
    left: 'calc(var(--hole-x) - var(--ticket-perforation-width) / 2)',
    borderLeft: `var(--ticket-perforation-width) dashed ${themeVars.color.ink}`,
  },
})

export const ticketPk = style({
  WebkitMaskImage:
    'radial-gradient(circle calc(var(--hole-radius) + 1px) at var(--hole-x) 0, transparent var(--hole-radius), #000 calc(var(--hole-radius) + 0.5px)), radial-gradient(circle calc(var(--hole-radius) + 1px) at var(--hole-x) 100%, transparent var(--hole-radius), #000 calc(var(--hole-radius) + 0.5px))',
  WebkitMaskComposite: 'source-in',
  maskImage:
    'radial-gradient(circle calc(var(--hole-radius) + 1px) at var(--hole-x) 0, transparent var(--hole-radius), #000 calc(var(--hole-radius) + 0.5px)), radial-gradient(circle calc(var(--hole-radius) + 1px) at var(--hole-x) 100%, transparent var(--hole-radius), #000 calc(var(--hole-radius) + 0.5px))',
  maskComposite: 'intersect',
})

export const pkArc = style({
  position: 'absolute',
  left: 'calc(var(--hole-x) - var(--hole-radius) - var(--ticket-border))',
  width: 'calc((var(--hole-radius) + var(--ticket-border)) * 2)',
  height: 'calc((var(--hole-radius) + var(--ticket-border)) * 2)',
  border: `var(--ticket-border) solid ${themeVars.color.ink}`,
  borderRadius: '9999px',
  pointerEvents: 'none',
})

export const pkArcT = style({
  top: 'calc(0px - var(--hole-radius) - var(--ticket-border))',
  clipPath: 'inset(50% 0 0 0)',
})

export const pkArcB = style({
  bottom: 'calc(0px - var(--hole-radius) - var(--ticket-border))',
  clipPath: 'inset(0 0 50% 0)',
})
