import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'esbuild-wasm'
import { defineConfig } from '@idealjs/stack'
import { imports, vendor } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'
import { tutorialBuild } from './stack-plugins/build.ts'

const appDir = dirname(fileURLToPath(import.meta.url))
const siteKitIndex = resolve(appDir, '../../packages/site-kit/src/index.ts')
const runtimeDocPath = resolve(appDir, '../web-runner/dist-runtime/index.html')

const pages = readdirSync(appDir)
  .filter((file) => file.endsWith('.html'))
  .map((file) => file.replace(/\.html$/, ''))

const readRuntimeDoc = async (): Promise<string> => {
  try {
    return await readFile(runtimeDocPath, 'utf8')
  } catch {
    return '<!doctype html><html lang="zh-CN"><body><!-- web-runner 产物缺失：先跑 yarn workspace @stack/web-runner build:runtime --></body></html>'
  }
}

export default defineConfig({
  root: appDir,
  inputs: pages.map((name) => ({ name, path: `${name}.html` })),
  fs: nodeFs(),
  dist: 'dist',
  load: async (ctx, id) => {
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
        '@idealjs/stack',
        '@idealjs/stack/builtins',
      ],
    }),
    {
      name: 'site-kit',
      resolve: (specifier) => {
        if (specifier !== '@stack/site-kit') return null
        return { id: siteKitIndex }
      },
    },
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
    imports(),
    tutorialBuild({ root: appDir, ssg: process.env.STACK_SSG === '1' }),
  ],
})
