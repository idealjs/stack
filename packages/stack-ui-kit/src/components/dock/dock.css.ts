import { style } from '@vanilla-extract/css'
import { themeVars } from '../../tokens/theme.css'

export const dropdownTriggerHost = style({
  display: 'inline-flex',
})

export const dropdownTrigger = style({
  pointerEvents: 'auto',
  position: 'relative',
  cursor: 'pointer',
  outline: 'none',
})

export const dropdownPanelBottom = style({
  pointerEvents: 'auto',
  position: 'absolute',
  right: 0,
  top: '100%',
  marginTop: '0.5rem',
  display: 'grid',
  transitionProperty: 'grid-template-rows, opacity, visibility',
  transitionTimingFunction: 'ease-out',
})

export const dropdownPanelTop = style({
  pointerEvents: 'auto',
  position: 'absolute',
  right: 0,
  bottom: '100%',
  marginBottom: '0.5rem',
  transformOrigin: 'bottom right',
  transitionProperty: 'opacity, transform, visibility',
})

export const dropdownPanelOpenBottom = style({
  visibility: 'visible',
  gridTemplateRows: '1fr',
  opacity: 1,
  transitionDuration: '200ms',
})

export const dropdownPanelClosedBottom = style({
  visibility: 'hidden',
  pointerEvents: 'none',
  gridTemplateRows: '0fr',
  opacity: 0,
  transitionDuration: '100ms',
})

export const dropdownPanelOpenTop = style({
  visibility: 'visible',
  translate: '0 0',
  scale: '1',
  opacity: 1,
  transitionDuration: '200ms',
})

export const dropdownPanelClosedTop = style({
  visibility: 'hidden',
  pointerEvents: 'none',
  translate: '0 0.5rem',
  scale: '0.97',
  opacity: 0,
  transitionDuration: '100ms',
})

export const dropdownPanelClip = style({
  minHeight: 0,
  overflow: 'hidden',
})

export const dropdownPanelBody = style({
  maxHeight: 'min(560px, 100dvh - 160px)',
  overflow: 'auto',
})

export const modalOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'grid',
  placeItems: 'center',
  backgroundColor: `color-mix(in oklab, ${themeVars.color.ink} 40%, transparent)`,
  padding: '1rem',
})

export const modalPanel = style({
  borderRadius: '1rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
  padding: '1.25rem',
  boxShadow: themeVars.shadow.ink,
})

export const sheetTab = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.375rem',
  borderTopLeftRadius: '0.5rem',
  borderBottomLeftRadius: '0.5rem',
  borderWidth: 2,
  borderRightWidth: 0,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  paddingRight: '0.5rem',
  paddingLeft: '0.375rem',
  fontSize: '12.5px',
  fontWeight: 800,
  color: themeVars.color.ink,
  boxShadow: `-3px 3px 0 ${themeVars.color.ink}`,
  transitionProperty: 'translate',
  transitionDuration: '150ms',
  cursor: 'pointer',
  ':hover': {
    translate: '-0.125rem 0',
  },
})

export const sheetTabArrow = style({
  fontSize: '10px',
  lineHeight: 1,
})

export const sheetTabLabel = style({
  writingMode: 'vertical-rl',
})

export const sheetMask = style({
  position: 'fixed',
  inset: 0,
  zIndex: 45,
  backgroundColor: `color-mix(in oklab, ${themeVars.color.ink} 45%, transparent)`,
  transitionProperty: 'opacity',
})

export const sheetMaskOpen = style({
  opacity: 1,
  transitionDuration: '200ms',
})

export const sheetMaskClosed = style({
  pointerEvents: 'none',
  opacity: 0,
  transitionDuration: '100ms',
})

export const sheetTabsRail = style({
  position: 'fixed',
  right: 0,
  top: '50%',
  zIndex: 30,
  display: 'flex',
  translate: '0 -50%',
  flexDirection: 'column',
  gap: '9rem',
})

export const sheetPanel = style({
  position: 'fixed',
  top: 0,
  right: 0,
  zIndex: 50,
  display: 'flex',
  height: '100dvh',
  width: 'min(600px, 100vw - 24px)',
  flexDirection: 'column',
  borderTopLeftRadius: '0.75rem',
  borderBottomLeftRadius: '0.75rem',
  borderWidth: 2,
  borderRightWidth: 0,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: themeVars.color.paper,
  boxShadow: themeVars.shadow.ink,
  transitionProperty: 'transform, opacity, visibility',
  transitionTimingFunction: 'ease-out',
})

export const sheetPanelOpen = style({
  visibility: 'visible',
  translate: '0 0',
  opacity: 1,
  transitionDuration: '200ms',
})

export const sheetPanelClosed = style({
  visibility: 'hidden',
  pointerEvents: 'none',
  translate: '100% 0',
  opacity: 0,
  transitionDuration: '100ms',
})

export const sheetToolbar = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  columnGap: '0.5rem',
  borderBottomWidth: 2,
  borderBottomStyle: 'solid',
  borderBottomColor: themeVars.color.ink,
  padding: '0.625rem 1rem',
})

export const sheetClose = style({
  marginLeft: 'auto',
  flexShrink: 0,
  cursor: 'pointer',
  borderRadius: '0.375rem',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: themeVars.color.ink,
  backgroundColor: '#ffffff',
  padding: '0.125rem 0.375rem',
  fontSize: '12px',
  fontWeight: 700,
  color: themeVars.color.ink,
  ':hover': {
    backgroundColor: themeVars.color['paper-deep'],
  },
})

export const sheetBody = style({
  display: 'flex',
  minHeight: 0,
  flexGrow: 1,
  flexDirection: 'column',
  gap: '0.75rem',
  overflowY: 'auto',
  padding: '1rem',
})
