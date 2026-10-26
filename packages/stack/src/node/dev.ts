import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { extname, join, relative } from 'node:path'
import { Hono } from 'hono'
import { serve, type ServerType } from '@hono/node-server'
import type { StackConfig } from '../index.ts'

const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
}

export interface DevServerOptions {
  port?: number
  assets?: Record<string, string>
}

export async function startDevServer(
  config: StackConfig,
  options: DevServerOptions = {},
): Promise<ServerType> {
  const root = resolve(process.cwd(), config.root ?? '.')
  const dist = resolve(root, config.dist ?? 'dist')
  const distRelative = relative(process.cwd(), dist).replaceAll('\\', '/')
  const app = new Hono()
  for (const [route, filePath] of Object.entries(options.assets ?? {})) {
    app.get(route, async (c) => {
      const body = await readFile(filePath)
      return c.body(new Uint8Array(body), 200, {
        'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
    })
  }
  app.get('*', async (c) => {
    const requestPath = decodeURIComponent(new URL(c.req.url).pathname)
    for (const candidate of [requestPath, join(requestPath, 'index.html')]) {
      const safe = join(distRelative, candidate)
      if (!safe.startsWith(distRelative)) continue
      try {
        const body = await readFile(safe)
        return c.body(new Uint8Array(body), 200, {
          'Content-Type': MIME[extname(safe)] ?? 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
      } catch {
        continue
      }
    }
    return c.text('Not Found', 404)
  })
  const port = options.port ?? 3000
  const server = serve({ fetch: app.fetch, port })
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `[stack] 端口 ${port} 已被占用——可能有另一个 stack dev 在运行；停掉占用进程或换 --port 后重试`,
      )
    } else {
      console.error(`[stack] dev server 错误：${error.message}`)
    }
    process.exit(1)
  })
  console.log(`hono dev server → http://localhost:${port}/（伺服 ${distRelative}）`)
  return server
}
