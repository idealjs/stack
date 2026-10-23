import type { BuildResult } from './build.ts'

export type ResolveIdHook = (
  source: string,
  importer: string,
) => string | null | undefined | Promise<string | null | undefined>

export type LoadHook = (
  id: string,
) => string | null | undefined | Promise<string | null | undefined>

export type TransformHook = (
  id: string,
  code: string,
) => string | null | undefined | Promise<string | null | undefined>

export interface BuildEndContext {
  result: BuildResult
}

export type BuildEndHook = (ctx: BuildEndContext) => void | Promise<void>

export interface StackPlugin {
  name: string
  resolveId?: ResolveIdHook
  load?: LoadHook
  transform?: TransformHook
  buildEnd?: BuildEndHook
}

export interface PluginScheduler {
  resolveId(source: string, importer: string): Promise<string | null>
  load(id: string): Promise<string | null>
  transform(id: string, code: string): Promise<string | null>
  buildEnd(ctx: BuildEndContext): Promise<void>
}

const callFirst = async <T>(
  hooks: T[],
  call: (hook: T) => string | null | undefined | Promise<string | null | undefined>,
): Promise<string | null> => {
  for (const hook of hooks) {
    const value = await call(hook)
    if (value != null) return value
  }
  return null
}

export function createPluginScheduler(plugins: readonly StackPlugin[] = []): PluginScheduler {
  const list = [...plugins]
  return {
    resolveId(source, importer) {
      return callFirst(list, (plugin) => plugin.resolveId?.(source, importer))
    },
    load(id) {
      return callFirst(list, (plugin) => plugin.load?.(id))
    },
    transform(id, code) {
      return callFirst(list, (plugin) => plugin.transform?.(id, code))
    },
    async buildEnd(ctx) {
      for (const plugin of list) await plugin.buildEnd?.(ctx)
    },
  }
}
