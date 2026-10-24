import type { StackPlugin } from './plugin.ts'

export interface StackConfig {
  root?: string
  inputs: Record<string, string>
  dist?: string
  alias?: Record<string, string>
  plugins?: StackPlugin[]
}

export function defineConfig<T extends StackConfig>(config: T): T {
  return config
}
