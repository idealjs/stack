import { format } from './format'
import { post } from './outbound'

export async function execute(code: string, html: string | undefined) {
  document.body.innerHTML = typeof html === 'string' ? html : ''
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
