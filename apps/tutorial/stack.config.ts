import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@idealjs/stack'
import { imports, vendor } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'
import { vanillaExtract } from '@idealjs/stack-ui-kit/stack-plugin'
import { transform } from 'esbuild-wasm'
import { tutorialBuild } from './stack-plugins/build.ts'
import { ssg } from './stack-plugins/ssg.ts'

const appDir = dirname(fileURLToPath(import.meta.url))
try {
  process.loadEnvFile(resolve(appDir, '.env.development'))
} catch {}

const runtimeDocPath = resolve(appDir, '../web-runner/dist-runtime/index.html')

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git'])

const collectPages = (dir: string, prefix: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return IGNORED_DIRS.has(entry.name)
        ? []
        : collectPages(join(dir, entry.name), `${prefix}${entry.name}/`)
    }
    return entry.name.endsWith('.html') ? [`${prefix}${entry.name.replace(/\.html$/, '')}`] : []
  })

const pages = collectPages(appDir, '')

const readRuntimeDoc = async (): Promise<string> => {
  try {
    return await readFile(runtimeDocPath, 'utf8')
  } catch {
    return '<!doctype html><html lang="zh-CN"><body><!-- web-runner 产物缺失：先跑 yarn workspace @stack/web-runner build:runtime --></body></html>'
  }
}

const vanilla = vanillaExtract({
  roots: [
    resolve(appDir, '../../packages/stack-ui-kit'),
    resolve(appDir, '../../packages/stack-site-ui-kit'),
  ],
})

export default defineConfig({
  root: appDir,
  watchRoots: ['../../packages/stack-ui-kit', '../../packages/stack-site-ui-kit'],
  inputs: pages.map((name) => ({ name, path: `${name}.html` })),
  fs: nodeFs(),
  dist: 'dist',
  load: async (ctx, id) => {
    const vanillaCode = await vanilla.load(ctx, id)
    if (vanillaCode !== undefined) return vanillaCode
    if (!id.endsWith('.tsx')) return ctx.fs.readFile(id)
    const source = await ctx.fs.readFile(id)
    const result = await transform(source, { loader: 'tsx', jsx: 'automatic' })
    return result.code
  },
  hooks: [
    vendor({
      entries: [
        'react',
        'react-dom/client',
        'react/jsx-runtime',
        'react-joyride',
        '@idealjs/stack',
        '@idealjs/stack/builtins',
      ],
    }),
    {
      name: 'virtual',
      resolve: async (specifier, importer) => {
        if (specifier.endsWith('?raw')) {
          const target = resolve(dirname(importer), specifier.slice(0, -'?raw'.length))
          return {
            id: `${target}.raw.js`,
            content: `export default ${JSON.stringify(await readFile(target, 'utf8'))}`,
          }
        }
        if (specifier === 'virtual:web-runner-doc') {
          return {
            id: `${specifier}.js`,
            content: `export default ${JSON.stringify(await readRuntimeDoc())}`,
          }
        }
        if (specifier === 'virtual:stack-env') {
          return {
            id: `${specifier}.js`,
            content: `export default ${JSON.stringify(process.env.VITE_STACK_RUNTIME_ORIGIN ?? '')}`,
          }
        }
        return null
      },
    },
    {
      name: 'package-styles',
      resolve: async (specifier) => {
        if (!specifier.endsWith('/styles/index.css')) return null
        const stylesDir = resolve(appDir, '../../packages/stack-site-ui-kit/styles')
        const manifest = await readFile(resolve(stylesDir, 'index.css'), 'utf8')
        const parts = await Promise.all(
          [...manifest.matchAll(/@import\s+"\.\/([^"]+)";/g)].map(async (m) =>
            readFile(resolve(stylesDir, m[1]), 'utf8'),
          ),
        )
        return {
          id: resolve(stylesDir, 'index.css'),
          content: parts.join('\n'),
        }
      },
    },
    imports(),
    ...vanilla.hooks,
    tutorialBuild({ root: appDir }),
    ssg({
      root: appDir,
      vanillaLoad: async (id) => await vanilla.load({ fs: { readFile: async () => '' } }, id),
      themeClasses: vanilla.themeClasses,
    }),
  ],
})
