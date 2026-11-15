import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { extname, join, relative, resolve } from 'node:path'
import { type ServerType, serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { StackConfig } from '../index.ts'
import { rewriteWithBase } from './baseHtml.ts'

export const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
}

export interface ServedFile {
  code: string | Uint8Array
  contentType: string
}

const LIVE_PATH = '/__stack/live'

export interface DevServerOptions {
  port?: number
  base?: string
  host?: boolean | string
  assets?: Record<string, string>
  liveReload?: boolean
  serve?: (path: string) => Promise<ServedFile | null>
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
  const livePath = `${base}${LIVE_PATH}`
  const liveScript = `<script>new EventSource(${JSON.stringify(livePath)}).onmessage = () => location.reload()</script>`
  const hostname =
    options.host === true
      ? '0.0.0.0'
      : typeof options.host === 'string' && options.host !== ''
        ? options.host
        : undefined
  const clients = new Set<(chunk: string) => void>()
  const app = new Hono()
  if (options.liveReload === true) {
    app.get(livePath, (c) => {
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
    if (base !== '' && requestPath === base) return c.redirect(`${base}/`, 308)
    const withoutBase =
      base !== '' && (requestPath === base || requestPath.startsWith(`${base}/`))
        ? requestPath.slice(base.length) || '/'
        : requestPath
    const stripped = withoutBase.endsWith('/') ? withoutBase : `${withoutBase}`
    const isSafe = (candidate: string): boolean =>
      join(distRelative, candidate).startsWith(distRelative)
    const read = async (candidate: string): Promise<ServedFile | null> => {
      if (options.serve !== undefined) return options.serve(candidate)
      try {
        const body = await readFile(join(distRelative, candidate))
        return {
          code: body,
          contentType: MIME[extname(candidate)] ?? 'application/octet-stream',
        }
      } catch {
        return null
      }
    }
    const respond = async (served: ServedFile): Promise<Response> => {
      const isHtml = served.contentType.startsWith('text/html')
      let code: string | Uint8Array = served.code
      if (isHtml && typeof code === 'string') {
        let text = base === '' ? code : rewriteWithBase(code, base, withoutBase)
        if (options.liveReload === true) text = text.replace(/<\/body>/i, `${liveScript}</body>`)
        code = text
      }
      return c.body(code, 200, {
        'Content-Type': served.contentType,
        'Cache-Control': 'no-store',
      })
    }
    try {
      if (isSafe(stripped)) {
        const exact = await read(stripped)
        if (exact !== null) return await respond(exact)
      }
      const indexCandidate = join(stripped, 'index.html')
      if (isSafe(indexCandidate)) {
        const indexPage = await read(indexCandidate)
        if (indexPage !== null) {
          if (!withoutBase.endsWith('/')) return c.redirect(`${base}${withoutBase}/`, 308)
          return await respond(indexPage)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return c.text(`[stack] dev 构建未就绪：${message}`, 500)
    }
    return c.text('Not Found', 404)
  })
  const port = options.port ?? 8910
  const server = serve({ fetch: app.fetch, port, hostname }) as StackDevServer
  server.stackReload = () => {
    for (const send of clients) send('data: reload\n\n')
  }
  ;(server as ServerType).on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `[stack] 端口 ${port} 已被占用——可能有另一个 stack dev/preview 在运行；停掉占用进程或换 --port 后重试`,
      )
    } else {
      console.error(`[stack] dev server 错误：${error.message}`)
    }
    process.exit(1)
  })
  return server
}
