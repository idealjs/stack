import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = fileURLToPath(new URL('..', import.meta.url))
const distRoot = resolve(pkgRoot, 'dist-runtime')
const require = createRequire(resolve(pkgRoot, 'package.json'))
const wasmFallback = require.resolve('esbuild-wasm/esbuild.wasm')

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
}

const readPort = (argv) => {
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--port' && argv[i + 1] !== undefined) return argv[i + 1]
    if (argv[i].startsWith('--port=')) return argv[i].slice('--port='.length)
  }
  return '5174'
}

const port = readPort(process.argv.slice(2))

const send = (res, status, contentType, body) => {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  })
  res.end(body)
}

const serveFile = async (res, filePath) => {
  try {
    const body = await readFile(filePath)
    send(res, 200, MIME[extname(filePath)] ?? 'application/octet-stream', body)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent((req.url ?? '/').split('?')[0])
  if (pathname === '/') return serveFile(res, join(distRoot, 'index.html'))
  if (pathname === '/esbuild.wasm') {
    if (await serveFile(res, join(distRoot, 'esbuild.wasm'))) return
    if (await serveFile(res, wasmFallback)) return
    return send(res, 404, 'text/plain; charset=utf-8', 'esbuild.wasm 不存在：先跑 build:runtime')
  }
  const target = normalize(join(distRoot, pathname))
  if (target !== distRoot && !target.startsWith(distRoot + sep)) {
    return send(res, 403, 'text/plain; charset=utf-8', 'forbidden')
  }
  if (await serveFile(res, target)) return
  send(res, 404, 'text/plain; charset=utf-8', `not found：${pathname}`)
})

server.on('error', (error) => {
  console.error(`[web-runner] 静态服务器启动失败（端口 ${port}）：${error.message}`)
  process.exit(1)
})

server.listen(port, () => {
  console.log(
    `web-runner 静态服务器：http://localhost:${port}/（serve dist-runtime，/esbuild.wasm 已映射）`,
  )
})
