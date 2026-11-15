import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { StackHook, WatchHook } from '@idealjs/stack'
import { build as esbuild, type Plugin as esbuildWasmPlugin } from 'esbuild-wasm'
import { renderToString } from 'react-dom/server'

export interface SsgOptions {
  root: string
}

interface OutputContextLike {
  inputs: { name: string; id: string }[]
  modules: { id: string; deps: string[] }[]
}

const PAGE_ENTRY = /main\.[jt]sx$/
const RAW_SUFFIX = '?raw'
const WORKSPACE_DIR = 'node_modules/.stack-ssg'
const RUNTIME_DOC = '../web-runner/dist-runtime/index.html'

const RUNTIME_DOC_FALLBACK =
  '<!doctype html><html lang="zh-CN"><body><!-- web-runner 产物缺失：先跑 yarn workspace @stack/web-runner build:runtime --></body></html>'

const cache = new Map<string, { fingerprint: string; html: string }>()

const tutorialSsrPlugin = (root: string): esbuildWasmPlugin => ({
  name: 'tutorial-ssr',
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, (args) => ({
      path: join(dirname(args.importer), args.path.slice(0, -RAW_SUFFIX.length)) + RAW_SUFFIX,
    }))
    build.onLoad({ filter: /\?raw$/ }, async (args) => ({
      contents: await readFile(args.path.slice(0, -RAW_SUFFIX.length), 'utf8'),
      loader: 'text',
    }))
    build.onResolve({ filter: /^virtual:/ }, (args) => ({ path: args.path, namespace: 'virtual' }))
    build.onLoad({ filter: /.*/, namespace: 'virtual' }, async (args) => {
      if (args.path === 'virtual:web-runner-doc') {
        let doc: string
        try {
          doc = await readFile(join(root, RUNTIME_DOC), 'utf8')
        } catch {
          doc = RUNTIME_DOC_FALLBACK
        }
        return { contents: `export default ${JSON.stringify(doc)}`, loader: 'js' }
      }
      return {
        contents: `export default ${JSON.stringify(process.env.VITE_STACK_RUNTIME_ORIGIN ?? '')}`,
        loader: 'js',
      }
    })
  },
})

const mtimeOf = (path: string): string => {
  try {
    return statSync(path).mtimeMs.toString()
  } catch {
    return 'missing'
  }
}

const realPathOf = (id: string): string | null => {
  if (id.endsWith('.raw.js')) return id.slice(0, -'.raw.js'.length)
  if (id.startsWith('virtual:')) return null
  return id
}

const fingerprintOf = (entryId: string, ctx: OutputContextLike, root: string): string => {
  const byId = new Map(ctx.modules.map((module) => [module.id, module]))
  const seen = new Set<string>()
  const queue = [entryId]
  const parts: string[] = []
  while (queue.length > 0) {
    const id = queue.shift()
    if (id === undefined || seen.has(id)) continue
    seen.add(id)
    const real = realPathOf(id)
    parts.push(real === null ? id : `${id}@${mtimeOf(real)}`)
    for (const dep of byId.get(id)?.deps ?? []) queue.push(dep)
  }
  parts.push(`runtime-doc@${mtimeOf(join(root, RUNTIME_DOC))}`)
  return createHash('sha1').update(parts.sort().join('\n')).digest('hex')
}

const renderPage = async (
  name: string,
  entryId: string,
  fingerprint: string,
  workspace: string,
  root: string,
): Promise<string> => {
  const flat = name.replaceAll('/', '__')
  for (const stale of readdirSync(workspace)) {
    if (stale.startsWith(`${flat}-`) && stale.endsWith('.mjs')) {
      rmSync(join(workspace, stale))
    }
  }
  const outfile = join(workspace, `${flat}-${fingerprint}.mjs`)
  await esbuild({
    entryPoints: [entryId],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-joyride', '@idealjs/stack', 'esbuild-wasm'],
    plugins: [tutorialSsrPlugin(root)],
    outfile,
    logLevel: 'silent',
  })
  const module = await import(pathToFileURL(outfile).href)
  return renderToString(module.default)
}

const renderPages = async (
  ctx: OutputContextLike,
  byPath: Map<string, { path: string; code: string }>,
  root: string,
): Promise<void> => {
  const workspace = join(root, WORKSPACE_DIR)
  mkdirSync(workspace, { recursive: true })
  let rendered = 0
  let pages = 0
  for (const input of ctx.inputs) {
    if (!input.id.endsWith('.html')) continue
    const htmlFile = byPath.get(`${input.name}.html`)
    if (htmlFile === undefined) continue
    const htmlModule = ctx.modules.find((module) => module.id === input.id)
    const entryId = htmlModule?.deps.find((dep) => PAGE_ENTRY.test(dep))
    if (entryId === undefined) {
      throw new Error(`[ssg] ${input.name}.html 找不到 main 入口模块`)
    }
    pages += 1
    const fingerprint = fingerprintOf(entryId, ctx, root)
    let entry = cache.get(input.name)
    if (entry === undefined || entry.fingerprint !== fingerprint) {
      entry = {
        fingerprint,
        html: await renderPage(input.name, entryId, fingerprint, workspace, root),
      }
      cache.set(input.name, entry)
      rendered += 1
    }
    const marker = '<div id="root"></div>'
    if (!htmlFile.code.includes(marker)) {
      throw new Error(`[ssg] ${input.name}.html 缺少 #root 挂载点`)
    }
    htmlFile.code = htmlFile.code.replace(marker, `<div id="root">${entry.html}</div>`)
  }
  console.log(`[ssg] ${rendered}/${pages} 页预渲染`)
}

export function ssg(options: SsgOptions): StackHook {
  const hook: WatchHook = {
    name: 'ssg',
    watch: ['tutorial-build'],
    lower: async (ctx, watched) => {
      const files = watched.files.map((file) => ({ ...file }))
      const byPath = new Map(files.map((file) => [file.path, file]))
      await renderPages(ctx, byPath, options.root)
      ctx.output({ name: 'ssg', dir: watched.dir, files })
    },
  }
  return hook
}
