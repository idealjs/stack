import { statSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'

import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { StackHook, WatchHook } from '@idealjs/stack'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { build as esbuild, type Plugin as esbuildWasmPlugin } from 'esbuild-wasm'
import { renderToString } from 'react-dom/server'

export interface TutorialBuildOptions {
  root: string
  ssg?: boolean
}

const TOKENS_PATH = 'src/design-system/styles/tokens.css'
const PAGE_ENTRY = /main\.[jt]sx$/

export function tutorialBuild(options: TutorialBuildOptions): StackHook {
  const hook: WatchHook = {
    name: 'tutorial-build',
    watch: ['default'],
    lower: async (ctx, watched) => {
      const files = watched.files.map((file) => ({ ...file }))
      const byPath = new Map(files.map((file) => [file.path, file]))
      await compileTailwind(byPath, options.root)
      if (options.ssg === true) await renderPages(ctx, byPath, options.root)
      ctx.output({ name: 'tutorial-build', dir: watched.dir, files })
    },
  }
  return hook
}

const compileTailwind = async (
  byPath: Map<string, { path: string; code: string }>,
  root: string,
): Promise<void> => {
  const target = byPath.get(TOKENS_PATH)
  if (target === undefined) {
    throw new Error(`[tutorial-build] 产出里找不到 ${TOKENS_PATH}——html 需以 link 引入 tokens.css`)
  }
  const tokensPath = join(root, TOKENS_PATH)
  const raw = await readFile(tokensPath, 'utf8')
  const compiler = await compile(raw, {
    base: dirname(tokensPath),
    onDependency: () => {},
  })
  const sources =
    compiler.root === 'none'
      ? []
      : compiler.root === null
        ? [{ base: root, pattern: '**/*', negated: false }]
        : [{ base: compiler.root.base, pattern: compiler.root.pattern, negated: false }]
  const scanner = new Scanner({
    sources: [...sources, ...compiler.sources].filter((source) => {
      try {
        return statSync(source.base).isDirectory()
      } catch {
        return false
      }
    }),
  })
  const candidates = new Set(scanner.scan())
  target.code = compiler.build([...candidates])
}

interface OutputContextLike {
  inputs: { name: string; id: string }[]
  modules: { id: string; deps: string[] }[]
}

const RAW_SUFFIX = '?raw'

const RUNTIME_DOC_FALLBACK =
  '<!doctype html><html lang="zh-CN"><body><!-- web-runner 产物缺失：先跑 yarn workspace @stack/web-runner build:runtime --></body></html>'

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
          doc = await readFile(join(root, '../web-runner/dist-runtime/index.html'), 'utf8')
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

const renderPages = async (
  ctx: OutputContextLike,
  byPath: Map<string, { path: string; code: string }>,
  root: string,
): Promise<void> => {
  const workspace = await mkdtemp(join(root, 'node_modules', '.stack-ssg-'))
  try {
    for (const input of ctx.inputs) {
      if (!input.id.endsWith('.html')) continue
      const htmlFile = byPath.get(`${input.name}.html`)
      if (htmlFile === undefined) continue
      const htmlModule = ctx.modules.find((module) => module.id === input.id)
      const entryId = htmlModule?.deps.find((dep) => PAGE_ENTRY.test(dep))
      if (entryId === undefined) {
        throw new Error(`[tutorial-build] ${input.name}.html 找不到 main 入口模块`)
      }
      const outfile = join(workspace, `${input.name}.mjs`)
      await esbuild({
        entryPoints: [entryId],
        bundle: true,
        format: 'esm',
        platform: 'node',
        jsx: 'automatic',
        external: ['react', 'react-dom', '@idealjs/stack', 'esbuild-wasm'],
        plugins: [tutorialSsrPlugin(root)],
        outfile,
        logLevel: 'silent',
      })
      const module = await import(pathToFileURL(outfile).href)
      const html = renderToString(module.default)
      const marker = '<div id="root"></div>'
      if (!htmlFile.code.includes(marker)) {
        throw new Error(`[tutorial-build] ${input.name}.html 缺少 #root 挂载点`)
      }
      htmlFile.code = htmlFile.code.replace(marker, `<div id="root">${html}</div>`)
    }
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
}
