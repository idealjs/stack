const NEXT_TYPE = 'page-flip-next'
const PREV_TYPE = 'page-flip-prev'

interface FlipActivation {
  from: { url: string }
  entry: { url: string }
}

interface FlipViewTransition {
  types: Set<string>
}

type FlipEvent = Event & {
  activation?: FlipActivation
  viewTransition?: FlipViewTransition
}

const chapterOf = (url: string) => {
  const match = /\/ch(\d+)\.html(?:$|[?#])/.exec(url)
  return match ? Number(match[1]) : null
}

const flipType = (fromUrl: string, toUrl: string) => {
  const from = chapterOf(fromUrl)
  const to = chapterOf(toUrl)
  if (from === null || to === null || from === to) return null
  return to > from ? NEXT_TYPE : PREV_TYPE
}

export function setupPageFlip() {
  if (typeof window === 'undefined') return
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.addEventListener('pageswap', (event) => {
    const flip = event as FlipEvent
    if (!flip.viewTransition || !flip.activation) return
    const type = flipType(flip.activation.from.url, flip.activation.entry.url)
    if (type) flip.viewTransition.types.add(type)
  })
  window.addEventListener('pagereveal', (event) => {
    const flip = event as FlipEvent
    if (!flip.viewTransition || !flip.activation) return
    const type = flipType(flip.activation.from.url, window.location.href)
    if (type) flip.viewTransition.types.add(type)
  })
}
