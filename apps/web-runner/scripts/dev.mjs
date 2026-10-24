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

const children = [
  spawn(process.execPath, [resolve(here, 'serve.mjs'), `--port=${port}`], { stdio: 'inherit' }),
  spawn(process.execPath, [stackBin, '--watch'], { stdio: 'inherit' }),
]

const stop = () => {
  for (const child of children) child.kill('SIGINT')
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

for (const child of children) {
  child.on('exit', (code) => {
    if (code !== null && code !== 0) process.exitCode = code
  })
}
