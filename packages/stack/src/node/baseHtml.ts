const NON_LOCAL_PREFIXES = ['//', 'http://', 'https://', 'data:', 'mailto:', 'tel:']

export function rewriteWithBase(html: string, base: string): string {
  return html.replace(/(\s(?:href|src))="([^"]*)"/g, (match, attribute: string, value: string) => {
    if (!value.startsWith('/')) return match
    if (NON_LOCAL_PREFIXES.some((prefix) => value.startsWith(prefix))) return match
    const resolved = new URL(`${base}${value}`, 'http://localhost')
    return `${attribute}="${resolved.pathname}${resolved.search}${resolved.hash}"`
  })
}
