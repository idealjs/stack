import { build } from 'esbuild-wasm'
import type { StackHook } from './hooks.ts'
import { parseExports, parseModuleImports } from './parse.ts'
import { dirnamePath, isRelativeSpecifier, joinPath } from './pathUtil.ts'

export interface VendorOptions {
  entries: string[]
  dir?: string
  name?: string
  minify?: boolean
}

interface Edit {
  start: number
  end: number
  text: string
}

const baseName = (path: string): string => path.slice(path.lastIndexOf('/') + 1)

const entryFileName = (specifier: string): string => `${specifier.replaceAll('/', '-')}.js`

const localFor = (specifier: string): string =>
  `__stack_vendor_${specifier.replaceAll(/[^a-zA-Z0-9]/g, '_')}`

const defaultOnlyExport = (code: string): boolean => {
  const exports = parseExports(code)
  return exports.length === 1 && exports[0].kind === 'default'
}

const interopStatement = (
  source: string,
  defaultName: string | null,
  named: { imported: string; local: string }[],
): string => {
  const local = localFor(source)
  const lines = [`import ${local} from ${JSON.stringify(source)};`]
  if (defaultName !== null) lines.push(`const ${defaultName} = ${local};`)
  if (named.length > 0) {
    const slots = named.map((entry) =>
      entry.imported === entry.local ? entry.local : `${entry.imported}: ${entry.local}`,
    )
    lines.push(`const { ${slots.join(', ')} } = ${local};`)
  }
  return lines.join(' ')
}

export function vendor(options: VendorOptions): StackHook {
  const name = options.name ?? 'vendor'
  const dir = options.dir ?? 'vendor'
  const entries = new Set(options.entries)
  const interopEntries = new Set<string>()
  let filesPromise: Promise<Map<string, string>> | null = null
  let rootSeen: string | null = null

  const bundleFiles = (root: string): Promise<Map<string, string>> => {
    filesPromise ??= build({
      entryPoints: options.entries,
      bundle: true,
      splitting: true,
      format: 'esm',
      platform: 'browser',
      minify: options.minify ?? false,
      write: false,
      outdir: joinPath(root, dir),
      logLevel: 'silent',
    }).then((result) => {
      const files = new Map<string, string>()
      for (const file of result.outputFiles) files.set(baseName(file.path), file.text)
      for (const specifier of options.entries) {
        const code = files.get(entryFileName(specifier))
        if (code === undefined) {
          throw new Error(
            `[stack] vendor 产物缺少入口 ${entryFileName(specifier)}（esbuild 输出：${[...files.keys()].join('、')}）`,
          )
        }
        if (defaultOnlyExport(code)) interopEntries.add(specifier)
      }
      return files
    })
    return filesPromise
  }

  return {
    name: `vendor:${name}`,
    resolve: async (specifier, importer, ctx) => {
      rootSeen = ctx.root
      if (entries.has(specifier)) {
        const files = await bundleFiles(ctx.root)
        return { id: idFor(ctx.root, entryFileName(specifier)), content: files.get(entryFileName(specifier)) }
      }
      if (isRelativeSpecifier(specifier) && importer.startsWith(`${joinPath(ctx.root, dir)}/`)) {
        const files = await bundleFiles(ctx.root)
        const target = joinPath(dirnamePath(importer), specifier)
        const code = files.get(baseName(target))
        if (code !== undefined) return { id: target, content: code }
      }
      return null
    },
    lower: async (id, artifacts) => {
      if (rootSeen === null) return artifacts
      if (!/\.(?:mjs|cjs|js|jsx|mts|cts|ts|tsx)$/.test(id)) return artifacts
      const vendorDir = `${joinPath(rootSeen, dir)}/`
      if (id.startsWith(vendorDir)) return artifacts
      await bundleFiles(rootSeen)
      const next: typeof artifacts = []
      for (const artifact of artifacts) {
        const edits: Edit[] = []
        for (const parsed of parseModuleImports(artifact.code)) {
          if (!entries.has(parsed.source) || !interopEntries.has(parsed.source)) continue
          if (parsed.namespaceName !== null) continue
          if (parsed.declarationStart === parsed.start && parsed.declarationEnd === parsed.end)
            continue
          edits.push({
            start: parsed.declarationStart,
            end: parsed.declarationEnd,
            text: interopStatement(parsed.source, parsed.defaultName, parsed.named),
          })
        }
        if (edits.length === 0) {
          next.push(artifact)
          continue
        }
        let code = artifact.code
        for (const edit of [...edits].sort((left, right) => right.start - left.start)) {
          code = code.slice(0, edit.start) + edit.text + code.slice(edit.end)
        }
        next.push({ ...artifact, code })
      }
      return next
    },
  }
}

function idFor(root: string, fileName: string): string {
  return joinPath(root, 'vendor', fileName)
}
