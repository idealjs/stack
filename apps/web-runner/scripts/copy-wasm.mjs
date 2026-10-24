import { copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = fileURLToPath(new URL('..', import.meta.url))
const require = createRequire(resolve(pkgRoot, 'package.json'))
const source = require.resolve('esbuild-wasm/esbuild.wasm')
const target = resolve(pkgRoot, 'dist-runtime/esbuild.wasm')

await mkdir(dirname(target), { recursive: true })
await copyFile(source, target)
console.log(`esbuild.wasm 已复制进 dist-runtime（部署静态托管用）：${target}`)
