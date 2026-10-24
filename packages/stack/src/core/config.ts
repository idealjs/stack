import type { StackHook } from './hooks.ts'

export interface StackInput {
  name: string
  path: string
}

export interface StackConfig {
  root?: string
  inputs: StackInput[]
  dist?: string
  alias?: Record<string, string>
  hooks?: StackHook[]
}

export function defineConfig<T extends StackConfig>(config: T): T {
  return config
}
