import type { BuildResult } from '../core/hooks.ts'

export interface DevBuildHooks {
  run: () => Promise<BuildResult>
  onBuilt?: (result: BuildResult) => void
  onFailed?: (error: unknown) => void
}

export type DevBuildStatus = 'idle' | 'building' | 'ready' | 'failed'

export interface DevBuildQueue {
  ensure(): Promise<BuildResult>
  invalidate(): void
  status(): DevBuildStatus
}

export function createDevBuildQueue(hooks: DevBuildHooks): DevBuildQueue {
  let current: BuildResult | null = null
  let failure: unknown = null
  let dirty = true
  let inFlight: Promise<void> | null = null

  const settle = async (): Promise<void> => {
    if (!dirty) return
    dirty = false
    try {
      current = await hooks.run()
      failure = null
      hooks.onBuilt?.(current)
    } catch (error) {
      failure = error
      hooks.onFailed?.(error)
    }
  }

  const pump = (): Promise<void> => {
    inFlight ??= settle().finally(() => {
      inFlight = null
    })
    return inFlight
  }

  return {
    async ensure() {
      for (;;) {
        await pump()
        if (dirty) continue
        if (failure !== null) throw failure
        return current as BuildResult
      }
    },
    invalidate() {
      dirty = true
      failure = null
      void pump()
    },
    status() {
      if (dirty || inFlight !== null) return 'building'
      if (failure !== null) return 'failed'
      if (current !== null) return 'ready'
      return 'idle'
    },
  }
}
