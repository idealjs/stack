export interface ParsedHtmlAsset {
  kind: 'script' | 'stylesheet'
  specifier: string
  start: number
  end: number
  tagStart: number
  tagEnd: number
}

const TAG_PATTERN = /<(script|link)\b([^>]*)>/gi
const ATTRIBUTE_PATTERN = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/dg

export function parseHtmlAssets(code: string): ParsedHtmlAsset[] {
  const assets: ParsedHtmlAsset[] = []
  for (const tag of code.matchAll(TAG_PATTERN)) {
    const name = (tag[1] ?? '').toLowerCase()
    const attributes = tag[2] ?? ''
    const attributesStart = (tag.index ?? 0) + tag[0].length - attributes.length - 1
    const found = new Map<string, { value: string; start: number; end: number }>()
    for (const attribute of attributes.matchAll(ATTRIBUTE_PATTERN)) {
      const key = (attribute[1] ?? '').toLowerCase()
      for (const group of [2, 3, 4]) {
        const range = attribute.indices?.[group]
        const value = attribute[group]
        if (range === undefined || typeof value !== 'string' || value === '') continue
        found.set(key, {
          value,
          start: attributesStart + range[0],
          end: attributesStart + range[1],
        })
        break
      }
    }
    if (name === 'script') {
      const src = found.get('src')
      if (src !== undefined) {
        const tagStart = tag.index ?? 0
        let tagEnd = tagStart + tag[0].length
        const closing = code.indexOf('</' + 'script>', tagEnd)
        if (closing !== -1) tagEnd = closing + 9
        assets.push({
          kind: 'script',
          specifier: src.value,
          start: src.start,
          end: src.end,
          tagStart,
          tagEnd,
        })
      }
    }
    if (name === 'link') {
      const rel = found.get('rel')
      const href = found.get('href')
      if (rel !== undefined && rel.value.toLowerCase() === 'stylesheet' && href !== undefined) {
        assets.push({
          kind: 'stylesheet',
          specifier: href.value,
          start: href.start,
          end: href.end,
          tagStart: tag.index ?? 0,
          tagEnd: (tag.index ?? 0) + tag[0].length,
        })
      }
    }
  }
  return assets
}
