import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const binPath = join(packageRoot, 'bin', 'stack.mjs')
const fixtureDir = join(packageRoot, 'test', 'fixtures', 'mini')

const makeWorkspace = (): string => {
  const workdir = mkdtempSync(join(tmpdir(), 'stack-cli-'))
  cpSync(fixtureDir, workdir, { recursive: true })
  return workdir
}

const runStack = (cwd: string, args: string[] = []) =>
  spawnSync(process.execPath, [binPath, ...args], { cwd, encoding: 'utf8' })

test('CLI 以默认配置构建夹具工程并重写说明符', () => {
  const workdir = makeWorkspace()
  try {
    const run = runStack(workdir)
    assert.equal(run.status, 0, run.stderr)
    const mainJs = readFileSync(join(workdir, 'dist/esm/main.js'), 'utf8')
    assert.match(mainJs, /['"]\.\/lib\/greet\.js['"]/)
    assert.match(mainJs, /['"]\.\/tag\.js['"]/)
    assert.ok(!mainJs.includes('@/tag'))
    const execution = spawnSync(process.execPath, [join(workdir, 'dist/esm/main.js')], {
      encoding: 'utf8',
    })
    assert.equal(execution.status, 0, execution.stderr)
    assert.equal(execution.stdout.trim(), 'CLI-CLI-OK')
  } finally {
    rmSync(workdir, { recursive: true, force: true })
  }
})

test('CLI 的 --config 参数覆盖配置路径', () => {
  const workdir = makeWorkspace()
  try {
    const run = runStack(workdir, ['--config', 'alt.config.ts'])
    assert.equal(run.status, 0, run.stderr)
    assert.ok(existsSync(join(workdir, 'dist/alt/main.js')))
    assert.ok(!existsSync(join(workdir, 'dist/esm')))
    const altJs = readFileSync(join(workdir, 'dist/alt/main.js'), 'utf8')
    assert.match(altJs, /['"]\.\/tag\.js['"]/)
  } finally {
    rmSync(workdir, { recursive: true, force: true })
  }
})
