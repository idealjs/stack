import type { StackPlugin } from './plugin.ts'

export interface StackOutput {
  dir: string
  minify?: boolean
}

export interface StackConfig {
  root?: string
  inputs: Record<string, string>
  outputs: StackOutput[]
  alias?: Record<string, string>
  plugins?: StackPlugin[]
}

export function defineConfig<T extends StackConfig>(config: T): T {
  return config
}
