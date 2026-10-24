import { transform } from 'esbuild-wasm'
import type { StackInputKind, StackLoader } from './config.ts'
import type { ReadOnlyFs } from './hooks.ts'
import { parseModuleImports, parseTopLevelNames } from './parse.ts'

const loaderForId = (id: string): 'ts' | 'tsx' | 'js' | 'jsx' => {
  if (id.endsWith('.tsx')) return 'tsx'
  if (id.endsWith('.jsx')) return 'jsx'
  if (id.endsWith('.ts') || id.endsWith('.mts')) return 'ts'
  return 'js'
}

export function createLoading(runtime: { fs: ReadOnlyFs; load?: StackLoader }) {
  const loaded = new Map<string, string>()
  const stripped = new Map<string, string>()

  const loadViaLoader = (id: string) => {
    const loader = runtime.load
    if (loader !== undefined) return loader({ fs: runtime.fs }, id)
    return runtime.fs.readFile(id)
  }

  return {
    seed(id: string, content: string): void {
      if (!loaded.has(id)) loaded.set(id, content)
    },
    async probe(candidates: string[]): Promise<string | null> {
      for (const candidate of candidates) {
        let content: string | null | undefined = null
        try {
          content = await loadViaLoader(candidate)
        } catch {
          content = null
        }
        if (typeof content === 'string') {
          if (!loaded.has(candidate)) loaded.set(candidate, content)
          return candidate
        }
      }
      return null
    },
    async loadForLifecycle(id: string): Promise<string> {
      const cached = loaded.get(id)
      if (cached !== undefined) return cached
      let content: string | null | undefined
      try {
        content = await loadViaLoader(id)
      } catch {
        throw new Error(`[stack] 无法加载模块：${id}`)
      }
      if (typeof content !== 'string') throw new Error(`[stack] 无法加载模块：${id}`)
      loaded.set(id, content)
      return content
    },
    async strip(id: string, code: string, kind: StackInputKind): Promise<string> {
      if (kind !== 'module') return code
      const cached = stripped.get(id)
      if (cached !== undefined) return cached
      const result = await transform(code, {
        loader: loaderForId(id),
        format: 'esm',
        target: 'esnext',
      })
      stripped.set(id, result.code)
      return result.code
    },
    async removeImportsInto(
      code: string,
      baseId: string,
      ids: Set<string>,
      resolveDemand: (source: string, importer: string) => Promise<{ kind: string; id?: string }>,
    ): Promise<string> {
      const parsed = parseModuleImports(code)
      const doomed: { start: number; end: number }[] = []
      for (const entry of parsed) {
        if (entry.declarationStart === entry.start && entry.declarationEnd === entry.end) continue
        const resolution = await resolveDemand(entry.source, baseId)
        if (resolution.kind !== 'module') continue
        if (!ids.has(resolution.id as string)) continue
        doomed.push({ start: entry.declarationStart, end: entry.declarationEnd })
      }
      doomed.sort((left, right) => right.start - left.start)
      let cleaned = code
      for (const range of doomed) {
        cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end)
      }
      return cleaned
    },
    topLevelCollision(parts: string[]): string | null {
      const seen = new Map<string, number>()
      for (const part of parts) {
        for (const name of new Set(parseTopLevelNames(part))) {
          seen.set(name, (seen.get(name) ?? 0) + 1)
        }
      }
      for (const [name, count] of seen) {
        if (count > 1) return name
      }
      return null
    },
  }
}

export type Loading = ReturnType<typeof createLoading>
