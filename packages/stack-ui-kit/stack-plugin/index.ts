import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'
import type { StackHook, StackLoader, WatchHook } from '@idealjs/stack'
import { build } from 'esbuild'
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'

export interface VanillaExtractOptions {
  roots: string[]
  output?: string
}

export interface VanillaExtractSetup {
  load: StackLoader
  hooks: StackHook[]
  themeClasses: () => Record<string, string>
}

interface Compiled {
  jsByFile: Map<string, string>
  css: string
}

const CSS_OUTPUT_DEFAULT = '__shared/ui-kit.css'

const IGNORED = new Set(['node_modules', 'dist', '.git'])

const THEME_CLASS_EXPORTS = ['paletteClass', 'themeClass', 'siteClass', 'pageBase'] as const

const scanCssTs = (root: string): string[] => {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.css.ts')) found.push(full)
    }
  }
  walk(root)
  return found
}

const flatName = (cwd: string, file: string): string =>
  relative(cwd, file)
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/\.css\.ts$/, '')

const sha256 = (data: string): string => createHash('sha256').update(data).digest('hex')

const hrefFor = (htmlPath: string, cssPath: string): string => {
  const href = relative(dirname(htmlPath), cssPath)
  return posix.normalize(href.split('\\').join('/'))
}

const importJs = async (code: string): Promise<Record<string, unknown>> => {
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  return await import(url)
}

const flattenVars = (value: unknown, path: string[], into: Map<string, string>): void => {
  if (typeof value === 'string') {
    into.set(`--${path.join('-')}`, value)
    return
  }
  if (value === null || value === undefined) return
  for (const [key, child] of Object.entries(value)) {
    flattenVars(child, [...path, key], into)
  }
}

export function vanillaExtract(options: VanillaExtractOptions): VanillaExtractSetup {
  const cssOutput = options.output ?? CSS_OUTPUT_DEFAULT

  let compiled: Promise<Compiled> | null = null
  let fingerprint = ''
  let themeClasses: Record<string, string> = {}

  const compileRoot = async (
    root: string,
    jsByFile: Map<string, string>,
    cssParts: string[],
  ): Promise<void> => {
    const files = scanCssTs(root).sort()
    if (files.length === 0) return
    const entries = new Map(files.map((file) => [flatName(root, file), file]))
    const result = await build({
      entryPoints: files.map((file) => ({ in: file, out: flatName(root, file) })),
      bundle: true,
      format: 'esm',
      platform: 'browser',
      write: false,
      outdir: 'out',
      absWorkingDir: root,
      plugins: [vanillaExtractPlugin()],
      logLevel: 'silent',
    })
    const jsByOut = new Map<string, string>()
    for (const file of result.outputFiles ?? []) {
      if (file.path.endsWith('.js')) jsByOut.set(file.path, file.text)
      else if (file.path.endsWith('.css')) cssParts.push(file.text)
    }
    for (const [name, file] of entries) {
      const code = jsByOut.get(join(root, 'out', `${name}.js`))
      if (code === undefined) throw new Error(`[vanilla-extract] 缺少编译产物：${file}`)
      jsByFile.set(file, code)
    }
  }

  const compileAll = async (): Promise<Compiled> => {
    const jsByFile = new Map<string, string>()
    const cssParts: string[] = []
    for (const root of options.roots) {
      await compileRoot(root, jsByFile, cssParts)
    }
    return { jsByFile, css: cssParts.join('\n') }
  }

  const ensureCompiled = (): Promise<Compiled> => {
    const files = options.roots.flatMap((root) => scanCssTs(root)).sort()
    const next = files.map((file) => `${file}:${sha256(readFileSync(file, 'utf8'))}`).join('|')
    if (compiled === null || next !== fingerprint) {
      fingerprint = next
      compiled = compileAll().catch((error: unknown) => {
        compiled = null
        throw error
      })
    }
    return compiled
  }

  const load: StackLoader = async (_ctx, id) => {
    if (!id.endsWith('.css.ts')) return undefined
    const code = (await ensureCompiled()).jsByFile.get(id)
    if (code === undefined) throw new Error(`[vanilla-extract] ${id} 不在编译范围内`)
    return code
  }

  const resolveBridgeAndClasses = async (
    jsByFile: Map<string, string>,
  ): Promise<{ bridge: string; classes: Record<string, string> }> => {
    const vars = new Map<string, string>()
    const classes: Record<string, string> = {}
    for (const code of jsByFile.values()) {
      const exported = await importJs(code)
      for (const [name, value] of Object.entries(exported)) {
        if (name.endsWith('Vars') && typeof value === 'object' && value !== null) {
          flattenVars(value, [], vars)
        }
        if (
          (THEME_CLASS_EXPORTS as readonly string[]).includes(name) &&
          typeof value === 'string'
        ) {
          classes[name] = value
        }
      }
    }
    const rules = [...vars.entries()].map(([name, ref]) => `  ${name}: ${ref};`).join('\n')
    const bridge = rules.length > 0 ? `\n:root {\n${rules}\n}\n` : ''
    return { bridge, classes }
  }

  const cssImportsHook: WatchHook = {
    name: 'css-imports',
    watch: ['default'],
    lower: async (ctx, watched) => {
      const files = watched.files.map((file) => ({ ...file }))

      for (const file of files) {
        if (!file.path.endsWith('.js')) continue
        const stripped = file.code.replace(/^\s*import\s*"[^"]*\.css";\s*$/gm, '')
        if (stripped !== file.code) file.code = stripped
      }

      const cssFiles = files.filter((file) => file.path.endsWith('.css'))
      if (cssFiles.length > 0) {
        for (const file of files) {
          if (!file.path.endsWith('.html')) continue
          const links = cssFiles
            .map((css) => `<link rel="stylesheet" href="${hrefFor(file.path, css.path)}">`)
            .join('\n')
          file.code = file.code.replace('</head>', `${links}\n</head>`)
        }
      }

      ctx.output({ name: 'css-imports', dir: watched.dir, files })
    },
  }

  const hook: WatchHook = {
    name: 'vanilla-extract',
    watch: ['css-imports'],
    lower: async (ctx, watched) => {
      const compiled = await ensureCompiled()
      const { bridge, classes } = await resolveBridgeAndClasses(compiled.jsByFile)
      themeClasses = classes
      const files = watched.files.map((file) => ({ ...file }))
      for (const file of files) {
        if (!file.path.endsWith('.html')) continue
        const href = hrefFor(file.path, cssOutput)
        if (file.code.includes(href)) continue
        file.code = file.code.replace('</head>', `<link rel="stylesheet" href="${href}">\n</head>`)
      }
      files.push({ path: cssOutput, code: compiled.css + bridge })
      ctx.output({ name: 'vanilla-extract', dir: watched.dir, files })
    },
  }

  return { load, hooks: [cssImportsHook, hook], themeClasses: () => themeClasses }
}
