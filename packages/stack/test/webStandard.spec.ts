import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const NODE_IMPORT_PATTERN = /(?:\bfrom|\bimport|\brequire)\s*\(?\s*['"]node:/

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(packageRoot, 'src')
const coreDir = join(srcDir, 'core')

const listCoreSources = (): string[] =>
  readdirSync(coreDir)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => join(coreDir, name))

test('SDK entry and core sources import zero node: modules', () => {
  const files = [join(srcDir, 'index.ts'), ...listCoreSources()]
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    assert.ok(!NODE_IMPORT_PATTERN.test(content), `${file} 不得引用 node: 模块`)
  }
})

test('SDK entry does not re-export the node host', () => {
  const content = readFileSync(join(srcDir, 'index.ts'), 'utf8')
  assert.ok(!content.includes('./node/'), 'SDK 入口不得转出口 node 宿主')
})
