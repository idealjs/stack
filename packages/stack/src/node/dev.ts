import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { extname, join, relative, resolve } from 'node:path'
import { type ServerType, serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { StackConfig } from '../index.ts'

const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
}

const LIVE_PATH = '/__stack/live'

const LIVE_SCRIPT = `<script>new EventSource(${JSON.stringify(LIVE_PATH)}).onmessage = () => location.reload()</script>`

export interface DevServerOptions {
  port?: number
  base?: string
  assets?: Record<string, string>
  liveReload?: boolean
}

export type StackDevServer = ServerType & { stackReload: () => void }

export async function startDevServer(
  config: StackConfig,
  options: DevServerOptions = {},
): Promise<StackDevServer> {
  const root = resolve(process.cwd(), config.root ?? '.')
  const dist = resolve(root, config.dist ?? 'dist')
  const distRelative = relative(process.cwd(), dist).replaceAll('\\', '/')
  const base = options.base?.replace(/\/$/, '') ?? ''
  const clients = new Set<(chunk: string) => void>()
  const app = new Hono()
  if (options.liveReload === true) {
    app.get(LIVE_PATH, (c) => {
      let send: ((chunk: string) => void) | undefined
      const stream = new ReadableStream({
        start(controller) {
          const push = (chunk: string): void => {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          push('retry: 500\n\n')
          send = push
          clients.add(send)
        },
        cancel() {
          if (send !== undefined) clients.delete(send)
        },
      })
      return c.body(stream, 200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      })
    })
  }
  for (const [route, filePath] of Object.entries(options.assets ?? {})) {
    app.get(route, async (c) => {
      const body = await readFile(filePath)
      return c.body(new Uint8Array(body), 200, {
        'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
    })
    if (base !== '') app.get(`${base}${route}`, async (c) => app.fetch(c.req.raw))
  }

  try {
    const stackRequire = createRequire(import.meta.url)
    const wasmPath = stackRequire.resolve('esbuild-wasm/esbuild.wasm')
    app.get('/esbuild.wasm', async (c) => {
      const body = await readFile(wasmPath)
      return c.body(new Uint8Array(body), 200, {
        'Content-Type': 'application/wasm',
        'Cache-Control': 'no-store',
      })
    })
  } catch {
    // stack 自身未携带 esbuild-wasm 时不提供该约定路由
  }
  app.get('*', async (c) => {
    const requestPath = decodeURIComponent(new URL(c.req.url).pathname)
    const withoutBase =
      base !== '' && (requestPath === base || requestPath.startsWith(`${base}/`))
        ? requestPath.slice(base.length) || '/'
        : requestPath
    const stripped = withoutBase.endsWith('/') ? withoutBase : `${withoutBase}`
    for (const candidate of [stripped, join(stripped, 'index.html')]) {
      const safe = join(distRelative, candidate)
      if (!safe.startsWith(distRelative)) continue
      try {
        const body = await readFile(safe)
        const isHtml = extname(safe) === '.html' && options.liveReload === true
        const code = isHtml
          ? body.toString('utf8').replace(/<\/body>/i, `${LIVE_SCRIPT}</body>`)
          : body
        return c.body(code, 200, {
          'Content-Type': MIME[extname(safe)] ?? 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
      } catch {}
    }
    return c.text('Not Found', 404)
  })
  const port = options.port ?? 8910
  const server = serve({ fetch: app.fetch, port }) as StackDevServer
  server.stackReload = () => {
    for (const send of clients) send('data: reload\n\n')
  }
  ;(server as ServerType).on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `[stack] 端口 ${port} 已被占用——可能有另一个 stack dev 在运行；停掉占用进程或换 --port 后重试`,
      )
    } else {
      console.error(`[stack] dev server 错误：${error.message}`)
    }
    process.exit(1)
  })
  console.log(`hono dev server → http://localhost:${port}/${base}（伺服 ${distRelative}）`)
  return server
}
