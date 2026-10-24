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

test('CLI 以默认配置构建夹具工程：default 与 minify 订阅产出各就各位', () => {
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

test('CLI 以 bundle 内置 hook 打包 A↔B 环：单文件产物 node 可执行', () => {
  const cycleDir = join(packageRoot, 'test', 'fixtures', 'cycle')
  const cycleDist = join(cycleDir, 'dist')
  try {
    const run = runStack(cycleDir)
    assert.equal(run.status, 0, run.stderr)
    assert.match(run.stdout, /bundle → dist\/bundle/)

    const esmJs = readFileSync(join(cycleDist, 'main.js'), 'utf8')
    assert.match(esmJs, /['"]\.\/a\.js['"]/)

    const bundleJs = readFileSync(join(cycleDist, 'bundle/bundle.js'), 'utf8')
    assert.match(bundleJs, /__define\(/)
    assert.match(bundleJs, /__require\(/)
    assert.match(bundleJs, /__require\(['"][^'"]*src\/main\.ts['"]\)/)

    const execution = spawnSync(process.execPath, [join(cycleDist, 'bundle/bundle.js')], {
      encoding: 'utf8',
    })
    assert.equal(execution.status, 0, execution.stderr)
    assert.equal(execution.stdout.trim(), '[a:[b:CD]]')

    const minExecution = spawnSync(process.execPath, [join(cycleDist, 'min/main.js')], {
      encoding: 'utf8',
    })
    assert.equal(minExecution.status, 0, minExecution.stderr)
  } finally {
    rmSync(cycleDist, { recursive: true, force: true })
  }
})
