import type { StackInputKind } from './config.ts'
import type { CycleDetector } from './cycle.ts'
import type { RenderArtifact } from './engine-types.ts'
import type { FinalModule, ImportRef, Resolution } from './hooks.ts'
import type { Loading } from './loading.ts'
import { parseModuleImports } from './parse.ts'

export interface ResourceRuntime {
  ensureLifecycle(id: string): Promise<FinalModule>
  resolveDemand(rawSource: string, importer: string): Promise<Resolution>
  followRedirects(id: string): string
  kindOf(id: string): StackInputKind
  loading: Loading
  detector: CycleDetector
  commitMerge(
    merged: FinalModule,
    pathAnchor: string,
    ids: string[],
    artifacts: RenderArtifact[],
  ): void
}

export async function demandFrom(
  rt: ResourceRuntime,
  requester: string,
  specifiers: string[],
): Promise<FinalModule[]> {
  const emitted = new Set<string>()
  const order: FinalModule[] = []
  const walk = async (id: string): Promise<void> => {
    const mod = await rt.ensureLifecycle(id)
    for (const ref of mod.imports) {
      if (ref.id === null) continue
      rt.detector.addEdge(mod.id, ref.id)
      if (!emitted.has(ref.id)) await walk(ref.id)
    }
    if (!emitted.has(mod.id)) {
      emitted.add(mod.id)
      order.push(mod)
    }
  }
  for (const specifier of specifiers) {
    const resolution = await rt.resolveDemand(specifier, requester)
    if (resolution.kind === 'external') continue
    rt.detector.addEdge(requester, resolution.id)
    if (!emitted.has(resolution.id)) await walk(resolution.id)
  }
  return order
}

interface CleanedPart {
  code: string
  baseId: string
}

export async function mergeFrom(
  rt: ResourceRuntime,
  requester: string,
  specifiers: string[],
  name?: string,
): Promise<FinalModule> {
  const ids: string[] = []
  for (const specifier of specifiers) {
    const resolution = await rt.resolveDemand(specifier, requester)
    if (resolution.kind === 'external') {
      throw new Error(`[stack] merge 不能合并 external 说明符："${specifier}"`)
    }
    const target = rt.followRedirects(resolution.id)
    if (rt.kindOf(target) !== 'module') {
      throw new Error(`[stack] merge 仅支持 module 类型模块："${specifier}"（${target}）`)
    }
    if (!ids.includes(target)) ids.push(target)
  }
  if (ids.length === 0) throw new Error('[stack] merge 需要至少一个可解析的模块说明符')
  const mergedId = name ?? `merged:${ids.join('+')}`
  const parts: CleanedPart[] = []
  for (const id of ids) {
    const raw = await rt.loading.loadForLifecycle(id)
    const stripped = await rt.loading.strip(id, raw, 'module')
    const cleaned = await rt.loading.removeImportsInto(stripped, id, new Set(ids), rt.resolveDemand)
    parts.push({ code: cleaned, baseId: id })
  }
  const collision = rt.loading.topLevelCollision(parts.map((part) => part.code))
  if (collision !== null) {
    throw new Error(
      `[stack] merge 顶层标识符冲突："${collision}"（${mergedId}）——请先重构去重或显式改名`,
    )
  }
  let mergedCode = ''
  const imports: ImportRef[] = []
  const deps: string[] = []
  const resolvedImports: {
    specifier: string
    start: number
    end: number
    declarationStart: number
    declarationEnd: number
    resolvedId: string | null
  }[] = []
  for (const part of parts) {
    const offset = mergedCode.length
    for (const parsed of parseModuleImports(part.code)) {
      const resolution = await rt.resolveDemand(parsed.source, part.baseId)
      const resolvedId = resolution.kind === 'module' ? resolution.id : null
      resolvedImports.push({
        specifier: parsed.source,
        start: parsed.start + offset,
        end: parsed.end + offset,
        declarationStart: parsed.declarationStart + offset,
        declarationEnd: parsed.declarationEnd + offset,
        resolvedId,
      })
      if (resolvedId !== null && !deps.includes(resolvedId)) deps.push(resolvedId)
      imports.push({ specifier: parsed.source, id: resolvedId })
    }
    mergedCode = `${mergedCode}${part.code}\n`
  }
  const merged: FinalModule = { id: mergedId, kind: 'module', code: mergedCode, deps, imports }
  rt.commitMerge(merged, ids[0], ids, [{ code: mergedCode, imports: resolvedImports }])
  return merged
}
