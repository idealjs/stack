export const PROTOCOL_VERSION = 1

export type RuntimeOutbound =
  | { type: 'ready'; origin: string; parentBlocked: boolean }
  | { type: 'console'; level: string; text: string }
  | { type: 'error'; text: string }
  | { type: 'done' }

export type RuntimeInbound = null | { v?: number; type?: string; code?: unknown; html?: unknown }
