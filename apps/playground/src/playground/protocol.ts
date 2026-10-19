export const PROTOCOL_VERSION = 1

export interface PingMessage {
  v: typeof PROTOCOL_VERSION
  type: 'ping'
}

export interface RunMessage {
  v: typeof PROTOCOL_VERSION
  type: 'run'
  code: string
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'

export interface ReadyMessage {
  v: typeof PROTOCOL_VERSION
  type: 'ready'

  origin: string

  parentBlocked: boolean
}

export interface ConsoleMessage {
  v: typeof PROTOCOL_VERSION
  type: 'console'
  level: ConsoleLevel
  text: string
}

export interface ErrorMessage {
  v: typeof PROTOCOL_VERSION
  type: 'error'
  text: string
}

export interface DoneMessage {
  v: typeof PROTOCOL_VERSION
  type: 'done'
}

export type RuntimeMessage = ReadyMessage | ConsoleMessage | ErrorMessage | DoneMessage

const CONSOLE_LEVELS: readonly ConsoleLevel[] = ['log', 'info', 'warn', 'error']

export function isRuntimeMessage(data: unknown): data is RuntimeMessage {
  if (typeof data !== 'object' || data === null) return false
  const m = data as Record<string, unknown>
  if (m.v !== PROTOCOL_VERSION) return false
  switch (m.type) {
    case 'ready':
      return typeof m.origin === 'string' && typeof m.parentBlocked === 'boolean'
    case 'console':
      return (
        typeof m.level === 'string' &&
        (CONSOLE_LEVELS as readonly string[]).includes(m.level) &&
        typeof m.text === 'string'
      )
    case 'error':
      return typeof m.text === 'string'
    case 'done':
      return true
    default:
      return false
  }
}
