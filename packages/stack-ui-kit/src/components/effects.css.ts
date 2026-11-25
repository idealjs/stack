import { globalStyle } from '@vanilla-extract/css'

const HOST = '.hover-host:hover'
const ITEM = `${HOST} .hoverable-shadow`

const noMotion = (selector: string) =>
  globalStyle(selector, {
    '@media': { '(prefers-reduced-motion: reduce)': { translate: 'none' } },
  })

globalStyle('.hoverable-shadow', { position: 'relative' })

globalStyle(ITEM, { translate: '0 -3px' })
globalStyle(`${ITEM}.shadow-ink`, { boxShadow: 'var(--shadow-ink-lift)' })
globalStyle(`${ITEM}.drop-shadow-ink`, {
  filter: 'drop-shadow(var(--drop-shadow-ink-lift))',
})
globalStyle(`${ITEM}.lift-sm`, { translate: '0 -2px' })
globalStyle(`${ITEM}.shadow-btn`, {
  translate: '0 -2px',
  boxShadow: '5px 5px 0 var(--color-ink)',
})
globalStyle(`${ITEM}.shadow-btn:active`, {
  translate: '2px 2px',
  boxShadow: '1px 1px 0 var(--color-ink)',
})
globalStyle(`${ITEM}.shadow-btn-ring`, {
  translate: '0 -2px',
  boxShadow: 'inset 0 0 0 2px var(--color-ink), 5px 5px 0 var(--color-ink)',
})
globalStyle(`${ITEM}.shadow-btn-ring:active`, {
  translate: '2px 2px',
  boxShadow: 'inset 0 0 0 2px var(--color-ink), 1px 1px 0 var(--color-ink)',
})

for (const selector of [
  ITEM,
  `${ITEM}.lift-sm`,
  `${ITEM}.shadow-btn`,
  `${ITEM}.shadow-btn:active`,
  `${ITEM}.shadow-btn-ring`,
  `${ITEM}.shadow-btn-ring:active`,
]) {
  noMotion(selector)
}
