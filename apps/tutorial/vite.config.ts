import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

const htmlProxy = (): Plugin => ({
  name: 'html-proxy',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const base = server.config.base.replace(/\/$/, '')
      const [rawPath, query] = (req.url ?? '').split('?')
      const path = decodeURIComponent(rawPath)
      const isHtml = path === base || path === `${base}/` || path.endsWith('.html')
      if (!base || !path.startsWith(`${base}/`) || !isHtml) return next()
      const stripped =
        path === base || path === `${base}/` ? '/index.html' : path.slice(base.length)
      const file = resolve(__dirname, stripped.slice(1))
      if (!existsSync(file)) return next()
      const html = readFileSync(file, 'utf8')
      server
        .transformIndexHtml(`${stripped}${query ? `?${query}` : ''}`, html)
        .then((out) => {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          })
          res.end(out)
        })
        .catch(next)
    })
  },
})

const baseSlashRedirect = (): Plugin => ({
  name: 'base-slash-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const base = server.config.base.replace(/\/$/, '')
      const [path, query] = (req.url ?? '').split('?')
      if (base && path === base) {
        res.writeHead(302, { Location: `${base}/${query ? `?${query}` : ''}` })
        res.end()
        return
      }
      next()
    })
  },
})

const RUNTIME_DOC_ID = '\0virtual:web-runner-doc'
const RUNTIME_DOC_PATH = resolve(__dirname, '../web-runner/dist-runtime/index.html')
const RUNTIME_WASM_PATH = createRequire(resolve(__dirname, 'package.json')).resolve(
  'esbuild-wasm/esbuild.wasm',
)
const DOC_FALLBACK =
  '<!doctype html><html lang="zh-CN"><body><!-- web-runner 产物缺失：先跑 yarn workspace @stack/web-runner build:runtime --></body></html>'

const readRuntimeDoc = async (): Promise<string> => {
  try {
    return await readFile(RUNTIME_DOC_PATH, 'utf8')
  } catch {
    console.warn(
      '[web-runner-doc] apps/web-runner/dist-runtime/index.html 不存在——先跑 yarn workspace @stack/web-runner build:runtime；本次使用占位 doc',
    )
    return DOC_FALLBACK
  }
}

const webRunnerDoc = (): Plugin => ({
  name: 'web-runner-doc',
  configureServer(server) {
    server.watcher.add(RUNTIME_DOC_PATH)
  },
  handleHotUpdate(ctx) {
    if (ctx.file !== RUNTIME_DOC_PATH) return
    const mod = ctx.server.moduleGraph.getModuleById(RUNTIME_DOC_ID)
    if (mod !== undefined) ctx.server.moduleGraph.invalidateModule(mod)
    ctx.server.ws.send({ type: 'full-reload' })
    return []
  },
  resolveId(id) {
    if (id === 'virtual:web-runner-doc') return RUNTIME_DOC_ID
  },
  async load(id) {
    if (id !== RUNTIME_DOC_ID) return
    return `export default ${JSON.stringify(await readRuntimeDoc())}`
  },
})

const wasmAsset = (): Plugin => ({
  name: 'web-runner-wasm',
  configureServer(server) {
    server.middlewares.use('/esbuild.wasm', (_req, res, next) => {
      readFile(RUNTIME_WASM_PATH)
        .then((wasm) => {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
            'Content-Type': 'application/wasm',
          })
          res.end(wasm)
        })
        .catch(() => next())
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use('/esbuild.wasm', (_req, res, next) => {
      readFile(RUNTIME_WASM_PATH)
        .then((wasm) => {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
            'Content-Type': 'application/wasm',
          })
          res.end(wasm)
        })
        .catch(() => next())
    })
  },
})

export default defineConfig({
  base: process.env.TUTORIAL_BASE ?? '/',
  server: {
    allowedHosts: ['5173.code.idealjs.com', 'code.idealjs.com'],
    cors: { origin: '*' },
  },
  preview: { cors: { origin: '*' } },
  plugins: [htmlProxy(), baseSlashRedirect(), webRunnerDoc(), wasmAsset(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)]),
      ),
    },
  },
})
