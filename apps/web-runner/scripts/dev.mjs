import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(here, '..')
const require = createRequire(resolve(pkgRoot, 'package.json'))
const stackBin = resolve(dirname(require.resolve('@idealjs/stack')), '../bin/stack.mjs')

const readPort = (argv) => {
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--port' && argv[i + 1] !== undefined) return argv[i + 1]
    if (argv[i].startsWith('--port=')) return argv[i].slice('--port='.length)
  }
  return '5174'
}

const port = readPort(process.argv.slice(2))
const wasmPath = require.resolve('esbuild-wasm/esbuild.wasm')

const child = spawn(
  process.execPath,
  [stackBin, 'dev', '--port', port, '--asset', `/esbuild.wasm=${wasmPath}`],
  { stdio: 'inherit' },
)
child.on('exit', (code) => process.exit(code ?? 0))
