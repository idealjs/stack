import { format } from './format'
import { post } from './outbound'

export async function execute(code: string, html: string | undefined) {
  if (typeof html === 'string') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    document.documentElement.replaceWith(document.importNode(doc.documentElement, true))
  }
  const blobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  try {
    void (await import(blobUrl))
    post({ type: 'done' })
  } catch (err) {
    post({ type: 'error', text: format(err) })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
