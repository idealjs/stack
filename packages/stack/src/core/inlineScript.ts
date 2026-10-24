import { moduleRuntime, wrapModule } from './bundle.ts'
import type {
  EmittedFile,
  EmittedOutput,
  FinalModule,
  OutputContext,
  StackHook,
  WatchHook,
} from './hooks.ts'
import { parseModuleImports } from './parse.ts'
import { parseHtmlAssets } from './parseHtml.ts'
import { dirnamePath, isRelativeSpecifier, joinPath, normalizePath } from './pathUtil.ts'

export interface InlineScriptOptions {
  from?: string
  name?: string
}

export function inlineScript(options: InlineScriptOptions = {}): StackHook {
  const from = options.from ?? 'default'
  const name = options.name ?? `${from}-inline`
  const hook: WatchHook = {
    name: `inline-script:${name}`,
    watch: [from],
    lower: (ctx: OutputContext, watched: EmittedOutput): void => {
      const htmlFiles = watched.files.filter((file) => file.path.endsWith('.html'))
      if (htmlFiles.length === 0) return
      const byPath = new Map(watched.files.map((file) => [normalizePath(file.path), file]))
      const files: EmittedFile[] = []
      for (const file of htmlFiles) files.push(inlineFile(file, byPath))
      for (const file of watched.files) {
        if (file.path.endsWith('.html')) continue
        files.push(file)
      }
      ctx.output({ name, dir: watched.dir, files })
    },
  }
  return hook
}

function inlineFile(file: EmittedFile, byPath: Map<string, EmittedFile>): EmittedFile {
  const scripts = parseHtmlAssets(file.code).filter((asset) => asset.kind === 'script')
  if (scripts.length === 0) return file
  const baseDir = dirnamePath(normalizePath(file.path))
  const closureIds = new Set<string>()
  const modules: FinalModule[] = []
  const entries: string[] = []
  const removals: { start: number; end: number }[] = []
  const visitFile = (path: string): void => {
    const normalized = normalizePath(path)
    if (closureIds.has(normalized)) return
    const target = byPath.get(normalized)
    if (target === undefined || !normalized.endsWith('.js')) return
    closureIds.add(normalized)
    const imports: { specifier: string; id: string | null }[] = []
    const deps: string[] = []
    const pending: string[] = []
    for (const parsed of parseModuleImports(target.code)) {
      if (isRelativeSpecifier(parsed.source)) {
        const dependency = normalizePath(joinPath(dirnamePath(normalized), parsed.source))
        imports.push({ specifier: parsed.source, id: dependency })
        if (!deps.includes(dependency)) deps.push(dependency)
        pending.push(dependency)
      } else {
        imports.push({ specifier: parsed.source, id: null })
      }
    }
    modules.push({ id: normalized, kind: 'module', code: target.code, deps, imports })
    for (const dependency of pending) visitFile(dependency)
  }
  for (const script of scripts) {
    const entry = normalizePath(joinPath(baseDir, script.specifier))
    if (byPath.get(entry) === undefined) continue
    entries.push(entry)
    removals.push({ start: script.tagStart, end: script.tagEnd })
    visitFile(entry)
  }
  if (removals.length === 0) return file
  const externals = new Map<string, string>()
  const parts = modules.map((mod) => wrapModule(mod, closureIds, externals))
  const hoists = [...externals].map(
    ([specifier, varName]) => `import * as ${varName} from ${JSON.stringify(specifier)};`,
  )
  const boots = entries.map((entry) => `__require(${JSON.stringify(entry)})`).join('\n')
  const inlineTag = `<script type="module">\n${moduleRuntime}\n${hoists.join('\n')}\n${parts.join('\n')}\n${boots}\n</script>`
  for (const range of removals.sort((left, right) => right.start - left.start)) {
    file = { path: file.path, code: file.code.slice(0, range.start) + file.code.slice(range.end) }
  }
  const first = Math.min(...removals.map((range) => range.start))
  return { path: file.path, code: file.code.slice(0, first) + inlineTag + file.code.slice(first) }
}
