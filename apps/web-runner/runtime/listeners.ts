import { format } from './format'
import { post, reportReady } from './outbound'
import { runProject } from './project'
import { type DemoFile, PROTOCOL_VERSION, type RuntimeInbound } from './types'

const CONSOLE_LEVELS = ['log', 'info', 'warn', 'error'] as const

const isDemoFile = (value: unknown): value is DemoFile =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as DemoFile).name === 'string' &&
  typeof (value as DemoFile).code === 'string'

const isDefine = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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
    if (msg.type === 'run' && Array.isArray(msg.files) && msg.files.every(isDemoFile)) {
      const entry = typeof msg.entry === 'string' ? msg.entry : ''
      const html = typeof msg.html === 'string' ? msg.html : undefined
      const define = isDefine(msg.define)
        ? Object.fromEntries(
            Object.entries(msg.define).filter(([, value]) => typeof value === 'string'),
          )
        : {}
      void runProject(msg.files, entry, html, define)
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
