export const PROTOCOL_VERSION = 2

export type RuntimeOutbound =
  | { type: 'ready'; origin: string; parentBlocked: boolean }
  | { type: 'console'; level: string; text: string }
  | { type: 'error'; text: string }
  | { type: 'done' }

export interface DemoFile {
  name: string
  code: string
}

export type RuntimeInbound = null | {
  v?: number
  type?: string
  files?: unknown
  entry?: unknown
  html?: unknown
  define?: unknown
}
