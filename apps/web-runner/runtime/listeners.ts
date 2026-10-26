import { execute } from './execute'
import { format } from './format'
import { post, reportReady } from './outbound'
import { PROTOCOL_VERSION, type RuntimeInbound } from './types'

const CONSOLE_LEVELS = ['log', 'info', 'warn', 'error'] as const

export function installListeners() {
  wrapConsole()
  window.addEventListener('error', (event) => {
    post({ type: 'error', text: event.message || '未知错误' })
  })
  window.addEventListener('unhandledrejection', (event) => {
    post({ type: 'error', text: `Unhandled rejection: ${format(event.reason)}` })
  })
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return
    const msg = event.data as RuntimeInbound
    if (!msg || msg.v !== PROTOCOL_VERSION) return
    if (msg.type === 'ping') return reportReady()
    if (msg.type === 'run' && typeof msg.code === 'string') {
      const html = typeof msg.html === 'string' ? msg.html : undefined
      void execute(msg.code, html)
    }
  })
}

function wrapConsole() {
  for (const level of CONSOLE_LEVELS) {
    const native = console[level].bind(console)
    console[level] = (...args: unknown[]) => {
      native(...args)
      post({ type: 'console', level, text: args.map(format).join(' ') })
    }
  }
}
