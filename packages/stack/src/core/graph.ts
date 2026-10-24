import { transform } from 'esbuild-wasm'
import type { StackInput } from './config.ts'
import { parseModuleImports } from './parse.ts'
import { isRelativeSpecifier, normalizePath } from './pathUtil.ts'
import type { PluginScheduler } from './plugin.ts'

export interface ResolvedImport {
  source: string
  start: number
  end: number
  resolvedId: string | null
}

export interface ModuleInfo {
  id: string
  code: string
  imports: ResolvedImport[]
}

export interface ModuleGraph {
  entries: { name: string; id: string }[]
  modules: Map<string, ModuleInfo>
}

export interface GraphInput {
  root: string
  inputs: StackInput[]
  alias?: Record<string, string>
}

const loaderForId = (id: string): 'ts' | 'tsx' | 'js' | 'jsx' => {
  if (id.endsWith('.tsx')) return 'tsx'
  if (id.endsWith('.jsx')) return 'jsx'
  if (id.endsWith('.ts') || id.endsWith('.mts')) return 'ts'
  return 'js'
}

const applyAlias = (
  source: string,
  alias: Record<string, string> | undefined,
): { source: string; aliased: boolean } => {
  if (alias === undefined) return { source, aliased: false }
  for (const [prefix, target] of Object.entries(alias)) {
    if (source === prefix || source.startsWith(prefix)) {
      return { source: `${target}${source.slice(prefix.length)}`, aliased: true }
    }
  }
  return { source, aliased: false }
}

export async function buildModuleGraph(
  input: GraphInput,
  scheduler: PluginScheduler,
): Promise<ModuleGraph> {
  const root = normalizePath(input.root)
  const rootImporter = `${root}/`
  const modules = new Map<string, ModuleInfo>()

  const resolveDependency = async (rawSource: string, importer: string): Promise<string | null> => {
    const { source, aliased } = applyAlias(rawSource, input.alias)
    const resolved = await scheduler.resolveId(source, importer)
    if (resolved !== null) return resolved
    const mustResolve = aliased || rawSource.startsWith('/') || isRelativeSpecifier(rawSource)
    if (mustResolve) {
      throw new Error(`[stack] 无法解析导入 "${rawSource}"（来自 ${importer}）`)
    }
    return null
  }

  const visitModule = async (id: string): Promise<void> => {
    if (modules.has(id)) return
    const loaded = await scheduler.load(id)
    if (loaded === null) throw new Error(`[stack] 无法加载模块：${id}`)
    const userTransformed = await scheduler.transform(id, loaded)
    const stripped = await transform(userTransformed ?? loaded, {
      loader: loaderForId(id),
      format: 'esm',
      target: 'esnext',
    })
    const moduleInfo: ModuleInfo = {
      id,
      code: stripped.code,
      imports: parseModuleImports(stripped.code).map((parsed) => ({ ...parsed, resolvedId: null })),
    }
    modules.set(id, moduleInfo)
    for (const declaration of moduleInfo.imports) {
      declaration.resolvedId = await resolveDependency(declaration.source, id)
      if (declaration.resolvedId !== null) await visitModule(declaration.resolvedId)
    }
  }

  const entries: { name: string; id: string }[] = []
  for (const entry of input.inputs) {
    const resolved = await resolveDependency(entry.path, rootImporter)
    if (resolved === null) throw new Error(`[stack] 无法解析入口 "${entry.path}"（root=${root}）`)
    entries.push({ name: entry.name, id: resolved })
    await visitModule(resolved)
  }
  return { entries, modules }
}
