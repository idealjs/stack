import type { StackHook } from './hooks.ts'

export type StackInputKind = 'html' | 'css' | 'module'

export interface StackInput {
  name: string
  path: string
  type?: StackInputKind
}

export const inputKindOf = (path: string, explicit?: StackInputKind): StackInputKind => {
  if (explicit !== undefined) return explicit
  if (path.endsWith('.html')) return 'html'
  if (path.endsWith('.css')) return 'css'
  return 'module'
}

export interface StackFs {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
}

export interface LoadContext {
  fs: { readFile(path: string): Promise<string> }
}

export type StackLoader = (
  ctx: LoadContext,
  id: string,
) => string | null | undefined | Promise<string | null | undefined>

export interface StackConfig {
  root?: string
  inputs: StackInput[]
  dist?: string
  alias?: Record<string, string>
  fs?: StackFs
  load?: StackLoader
  hooks?: StackHook[]
  watchRoots?: string[]
}

export function defineConfig<T extends StackConfig>(config: T): T {
  return config
}
