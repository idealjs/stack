import assert from 'node:assert/strict'
import test from 'node:test'
import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from '../src/core/pathUtil.ts'
import type { BuildResult, EmittedFile, StackPlugin } from '../src/index.ts'
import { build } from '../src/index.ts'

const memoryFsPlugin = (files: Map<string, string>): StackPlugin => ({
  name: 'memory-fs',
  resolveId(source, importer) {
    const base = isRelativeSpecifier(source)
      ? joinPath(dirnamePath(importer), source)
      : joinPath('.', source)
    return moduleCandidates(normalizePath(base)).find((candidate) => files.has(candidate)) ?? null
  },
  load(id) {
    return files.get(id) ?? null
  },
})

const fileOf = (result: BuildResult, outputIndex: number, path: string): EmittedFile => {
  const file = result.outputs[outputIndex].files.find((candidate) => candidate.path === path)
  assert.ok(file !== undefined, `缺少产物文件：${path}`)
  return file
}

test('builds the n×m cartesian product of inputs and outputs via memory fs', async () => {
  const files = new Map<string, string>([
    [
      'src/app.ts',
      "import { greet } from './common/utils'\nimport { APP_INFO } from '@/info'\nconsole.log(greet(APP_INFO.name))\n",
    ],
    [
      'src/tool.ts',
      "import { pickBy } from './common/utils'\nconsole.log(pickBy([1, 2, 3], (n) => n > 1))\n",
    ],
    [
      'src/common/utils.ts',
      'export interface Box<T> { value: T }\nexport const greet = (name: string): string => `hi $' +
        '{name}`\nexport function pickBy<T>(items: T[], keep: (item: T) => boolean): T[] {\n  return items.filter(keep)\n}\n',
    ],
    ['src/info.ts', "export const APP_INFO = { name: 'demo' }\n"],
  ])
  const result = await build({
    inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
    outputs: [{ dir: 'dist/esm' }, { dir: 'dist/min', minify: true }],
    alias: { '@/': 'src/' },
    plugins: [memoryFsPlugin(files)],
  })

  assert.equal(result.outputs.length, 2)
  assert.equal(result.moduleCount, 4)
  for (const output of result.outputs) {
    assert.deepEqual(output.entryPaths, { app: 'app.js', tool: 'tool.js' })
    assert.deepEqual(
      output.files.map((file) => file.path),
      ['app.js', 'common/utils.js', 'info.js', 'tool.js'],
    )
  }

  const esmApp = fileOf(result, 0, 'app.js').code
  assert.match(esmApp, /['"]\.\/common\/utils\.js['"]/)
  assert.match(esmApp, /['"]\.\/info\.js['"]/)
  assert.ok(esmApp.includes('console.log(greet(APP_INFO.name))'))

  const minifiedApp = fileOf(result, 1, 'app.js').code
  assert.match(minifiedApp, /['"]\.\/common\/utils\.js['"]/)
  assert.ok(minifiedApp.length < esmApp.length)
})

test('keeps unresolved bare specifiers external and rewrites dynamic imports', async () => {
  const files = new Map<string, string>([
    [
      'src/main.ts',
      "import external from 'some-pkg'\nconst lazy = () => import('./lazy')\nexport const value = external + String(lazy)\n",
    ],
    ['src/lazy.ts', 'export const lazyValue = 42\n'],
  ])
  const result = await build({
    inputs: { main: 'src/main.ts' },
    outputs: [{ dir: 'dist' }],
    plugins: [memoryFsPlugin(files)],
  })

  assert.equal(result.moduleCount, 2)
  const main = fileOf(result, 0, 'main.js').code
  assert.match(main, /['"]some-pkg['"]/)
  assert.match(main, /['"]\.\/lazy\.js['"]/)
})

test('fails loudly on unresolved relative imports', async () => {
  const files = new Map<string, string>([
    ['src/main.ts', "import { missing } from './missing'\nconsole.log(missing)\n"],
  ])
  await assert.rejects(
    build({
      inputs: { main: 'src/main.ts' },
      outputs: [{ dir: 'dist' }],
      plugins: [memoryFsPlugin(files)],
    }),
    /无法解析导入 "\.\/missing"/,
  )
})

test('records circular dependencies instead of recursing forever', async () => {
  const files = new Map<string, string>([
    ['src/a.ts', "import { b } from './b'\nexport const a = 'a'\nconsole.log(b)\n"],
    ['src/b.ts', "import { a } from './a'\nexport const b = a + '-b'\n"],
  ])
  const result = await build({
    inputs: { a: 'src/a.ts' },
    outputs: [{ dir: 'dist' }],
    plugins: [memoryFsPlugin(files)],
  })

  assert.equal(result.moduleCount, 2)
  assert.match(fileOf(result, 0, 'a.js').code, /['"]\.\/b\.js['"]/)
  assert.match(fileOf(result, 0, 'b.js').code, /['"]\.\/a\.js['"]/)
})

test('invokes buildEnd hooks once with the finished result', async () => {
  const files = new Map<string, string>([['src/main.ts', "console.log('ok')\n"]])
  const seen: number[] = []
  const observer: StackPlugin = {
    name: 'observer',
    buildEnd(ctx) {
      seen.push(ctx.result.moduleCount)
    },
  }
  const result = await build({
    inputs: { main: 'src/main.ts' },
    outputs: [{ dir: 'dist/a' }, { dir: 'dist/b' }],
    plugins: [memoryFsPlugin(files), observer],
  })

  assert.deepEqual(seen, [result.moduleCount])
})

test('chains transform hooks first-non-null before type stripping', async () => {
  const files = new Map<string, string>([['src/main.ts', 'export const value: number = 1\n']])
  const renaming: StackPlugin = {
    name: 'renaming',
    transform(id, code) {
      if (id === 'src/main.ts') return code.replace('value', 'renamed')
      return null
    },
  }
  const result = await build({
    inputs: { main: 'src/main.ts' },
    outputs: [{ dir: 'dist' }],
    plugins: [memoryFsPlugin(files), renaming],
  })

  const main = fileOf(result, 0, 'main.js').code
  assert.match(main, /renamed/)
  assert.ok(!main.includes(': number'))
})
