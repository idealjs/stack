import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const binPath = join(packageRoot, 'bin', 'stack.mjs')
const fixtureDir = join(packageRoot, 'test', 'fixtures', 'mini')
const fixtureDist = join(fixtureDir, 'dist')

const runStack = (cwd: string, args: string[] = []) =>
  spawnSync(process.execPath, [binPath, ...args], { cwd, encoding: 'utf8' })

test('CLI 以默认配置构建夹具工程：default 与 minify 插件产出各就各位', () => {
  try {
    const run = runStack(fixtureDir)
    assert.equal(run.status, 0, run.stderr)
    assert.match(run.stdout, /default → dist\/esm/)
    assert.match(run.stdout, /min → dist\/min/)

    const esmJs = readFileSync(join(fixtureDist, 'esm/main.js'), 'utf8')
    assert.match(esmJs, /['"]\.\/lib\/greet\.js['"]/)
    assert.match(esmJs, /['"]\.\/tag\.js['"]/)
    assert.ok(!esmJs.includes('@/tag'))

    const minJs = readFileSync(join(fixtureDist, 'min/main.js'), 'utf8')
    assert.match(minJs, /['"]\.\/tag\.js['"]/)
    assert.ok(minJs.length < esmJs.length)

    const execution = spawnSync(process.execPath, [join(fixtureDist, 'esm/main.js')], {
      encoding: 'utf8',
    })
    assert.equal(execution.status, 0, execution.stderr)
    assert.equal(execution.stdout.trim(), 'CLI-CLI-OK')
    const minExecution = spawnSync(process.execPath, [join(fixtureDist, 'min/main.js')], {
      encoding: 'utf8',
    })
    assert.equal(minExecution.stdout.trim(), 'CLI-CLI-OK')
  } finally {
    rmSync(fixtureDist, { recursive: true, force: true })
  }
})

test('CLI 的 --config 参数覆盖配置路径', () => {
  try {
    const run = runStack(fixtureDir, ['--config', 'alt.config.ts'])
    assert.equal(run.status, 0, run.stderr)
    assert.ok(existsSync(join(fixtureDist, 'alt/main.js')))
    assert.ok(!existsSync(join(fixtureDist, 'esm')))
    const altJs = readFileSync(join(fixtureDist, 'alt/main.js'), 'utf8')
    assert.match(altJs, /['"]\.\/tag\.js['"]/)
  } finally {
    rmSync(fixtureDist, { recursive: true, force: true })
  }
})
