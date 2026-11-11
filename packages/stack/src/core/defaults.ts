import { aliasResolve } from './aliasResolve.ts'
import type { StackConfig } from './config.ts'
import type { StackHook } from './hooks.ts'
import { imports } from './imports.ts'
import { pkgResolve } from './pkgResolve.ts'
import { relativeResolve } from './relativeResolve.ts'

export const withDefaultHooks = (config: StackConfig): StackConfig => ({
  ...config,
  hooks: [
    ...(hasHookPrefix(config.hooks, 'imports:') ? [] : [imports()]),
    ...(config.hooks ?? []),
    ...(hasHookPrefix(config.hooks, 'alias:') ? [] : [aliasResolve({ alias: config.alias })]),
    ...(hasHookPrefix(config.hooks, 'pkg:') ? [] : [pkgResolve()]),
    ...(hasHookPrefix(config.hooks, 'relative:') ? [] : [relativeResolve()]),
  ],
})

const hasHookPrefix = (hooks: StackHook[] | undefined, prefix: string): boolean =>
  (hooks ?? []).some((hook) => hook.name.startsWith(prefix))
