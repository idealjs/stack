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

export function format(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (typeof value === 'function') return `[Function ${value.name || '(anonymous)'}]`
  try {
    const json = JSON.stringify(value)
    return json === undefined ? String(value) : json
  } catch {
    return String(value)
  }
}
