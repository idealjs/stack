import { PROTOCOL_VERSION, type RuntimeOutbound } from './types'

export function post(message: RuntimeOutbound) {
  window.parent.postMessage({ v: PROTOCOL_VERSION, ...message }, '*')
}

export function reportReady() {
  post({
    type: 'ready',
    origin: String(window.location.origin),
    parentBlocked: probeParentBlocked(),
  })
}

function probeParentBlocked(): boolean {
  try {
    void window.parent.location.href
  } catch {
    return true
  }
  return false
}
