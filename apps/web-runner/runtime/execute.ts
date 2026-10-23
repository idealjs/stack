import { format, post } from './outbound'

let runSeq = 0

export async function execute(code: string, html: string | undefined) {
  const seq = ++runSeq
  document.body.innerHTML = typeof html === 'string' ? html : ''
  const blobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  try {
    const mod = (await import(blobUrl)) as { default?: { init?: () => unknown } }
    if (typeof mod.default?.init === 'function') await mod.default.init()
    if (seq === runSeq) post({ type: 'done' })
  } catch (err) {
    if (seq === runSeq) post({ type: 'error', text: format(err) })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
