import type { StackPlugin } from './plugin.ts'

export interface StackInput {
  name: string
  path: string
}

export interface StackConfig {
  root?: string
  inputs: StackInput[]
  dist?: string
  alias?: Record<string, string>
  plugins?: StackPlugin[]
}

export function defineConfig<T extends StackConfig>(config: T): T {
  return config
}
