export const extractHtmlDocument = (raw: string): string => {
  const doc = new DOMParser().parseFromString(raw, 'text/html')
  for (const el of doc.querySelectorAll('script')) el.remove()
  return doc.documentElement.outerHTML
}
