const NON_LOCAL_PREFIXES = ['//', 'http://', 'https://', 'data:', 'mailto:', 'tel:']

export function rewriteWithBase(html: string, base: string, pagePath: string): string {
  const pageDir = pagePath.endsWith('/')
    ? pagePath
    : pagePath.slice(0, pagePath.lastIndexOf('/') + 1)
  return html.replace(/(\s(?:href|src))="([^"]*)"/g, (match, attribute: string, value: string) => {
    if (value === '' || value.startsWith('#')) return match
    if (NON_LOCAL_PREFIXES.some((prefix) => value.startsWith(prefix))) return match
    const resolved = value.startsWith('/')
      ? new URL(`${base}${value}`, 'http://localhost')
      : new URL(value, `http://localhost${base}${pageDir}`)
    return `${attribute}="${resolved.pathname}${resolved.search}${resolved.hash}"`
  })
}
