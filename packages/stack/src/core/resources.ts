import type { CycleDetector } from './cycle.ts'
import { CycleError } from './cycle.ts'
import type { FinalModule, Resolution } from './hooks.ts'

export interface ResourceRuntime {
  ensureLifecycle(id: string): Promise<FinalModule>
  resolveDemand(rawSource: string, importer: string): Promise<Resolution>
  followRedirects(id: string): string
  knownModule(id: string): boolean
  bindModule(id: string, into: string): void
  detector: CycleDetector
}

export async function loweringImportFrom(
  rt: ResourceRuntime,
  requester: string,
  id: string,
): Promise<FinalModule | null> {
  const resolution = await rt.resolveDemand(id, requester)
  if (resolution.kind === 'external') return null
  const target = rt.followRedirects(resolution.id)
  const self = rt.followRedirects(requester)
  if (target === self) {
    if (target !== resolution.id) return rt.ensureLifecycle(target)
    throw new CycleError([self, self], { from: self, to: self })
  }
  rt.detector.addEdge(self, target)
  return rt.ensureLifecycle(target)
}

export async function loweringBindImportFrom(
  rt: ResourceRuntime,
  requester: string,
  ids: string[],
): Promise<void> {
  const into = rt.followRedirects(requester)
  const members: string[] = []
  for (const raw of ids) {
    const known = rt.followRedirects(raw)
    if (rt.knownModule(known)) {
      if (!members.includes(known)) members.push(known)
      continue
    }
    const resolution = await rt.resolveDemand(raw, requester)
    if (resolution.kind === 'external') {
      throw new Error(`[stack] loweringBindImport 不能绑定 external 说明符："${raw}"`)
    }
    const target = rt.followRedirects(resolution.id)
    if (!members.includes(target)) members.push(target)
  }
  for (const id of members) {
    if (id === into) continue
    rt.bindModule(id, into)
  }
  rt.detector.contract(
    members.filter((id) => id !== into),
    into,
  )
}
