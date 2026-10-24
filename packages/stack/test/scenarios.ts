import { bundle, minify } from '../src/builtins.ts'
import { memoryFs } from '../src/core/memoryFs.ts'
import { parseModuleImports } from '../src/core/parse.ts'
import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from '../src/core/pathUtil.ts'
import {
  type BuildResult,
  build,
  CycleError,
  type EmittedFile,
  type EmittedOutput,
  type ModuleHook,
  type StackConfig,
  type WatchHook,
} from '../src/index.ts'

export interface FileExpectation {
  path: string
  includes?: string[]
  notIncludes?: string[]
  shorterThanSamePathInOutput?: string
}

export interface OutputExpectation {
  name: string
  dir: string
  filePaths?: string[]
  files?: FileExpectation[]
}

export interface ScenarioExpected {
  moduleCount?: number
  outputs?: OutputExpectation[]
  error?: string | string[]
}

export interface Scenario {
  name: string
  files: Record<string, string>
  config: Omit<StackConfig, 'fs' | 'root'>
  expected: ScenarioExpected
  verify?: (result: BuildResult) => string[]
}

export interface ScenarioReport {
  name: string
  failures: string[]
}

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

const pullImports = (name: string, target?: string): ModuleHook => ({
  name,
  lower: async (id, artifacts, ctx) => {
    if (target !== undefined && id !== target) return artifacts
    await ctx.demand(ctx.lowerImport(artifacts[0].code))
    return artifacts
  },
})

const stripInternalImports = (
  code: string,
  importer: string,
  files: Record<string, string>,
): string => {
  const parsed = parseModuleImports(code)
  const doomed: { start: number; end: number }[] = []
  for (const entry of parsed) {
    if (entry.declarationStart === entry.start && entry.declarationEnd === entry.end) continue
    const base = isRelativeSpecifier(entry.source)
      ? joinPath(dirnamePath(importer), entry.source)
      : entry.source
    const exists = moduleCandidates(normalizePath(base)).some(
      (candidate) => files[candidate] !== undefined,
    )
    if (exists) doomed.push({ start: entry.declarationStart, end: entry.declarationEnd })
  }
  doomed.sort((left, right) => right.start - left.start)
  let result = code
  for (const range of doomed) result = result.slice(0, range.start) + result.slice(range.end)
  return result
}

const cartesianFiles: Record<string, string> = {
  'src/app.ts':
    "import { greet } from './common/utils'\nimport { APP_INFO } from '@/info'\nconsole.log(greet(APP_INFO.name))\n",
  'src/tool.ts':
    "import { pickBy } from './common/utils'\nconsole.log(pickBy([1, 2, 3], (n) => n > 1))\n",
  'src/common/utils.ts':
    'export interface Box<T> { value: T }\nexport const greet = (name: string): string => `hi $' +
    '{name}`\nexport function pickBy<T>(items: T[], keep: (item: T) => boolean): T[] {\n  return items.filter(keep)\n}\n',
  'src/info.ts': "export const APP_INFO = { name: 'demo' }\n",
}

const closureFiles: Record<string, string> = {
  'src/main.ts': "import { b } from './b'\nimport { c } from './c'\nconsole.log(b, c)\n",
  'src/b.ts': "import { d } from './d'\nexport const b = d + 1\n",
  'src/c.ts': 'export const c = 3\n',
  'src/d.ts': "import ext from 'ext-pkg'\nexport const d = ext + 1\n",
}

let capturedOutputFn: ((spec: EmittedOutput) => void) | undefined

export const SCENARIOS: Scenario[] = [
  {
    name: '一次构建产出两份：default 规范产物＋minify watch 衍生产物',
    files: cartesianFiles,
    config: {
      inputs: [
        { name: 'app', path: 'src/app.ts' },
        { name: 'tool', path: 'src/tool.ts' },
      ],
      dist: 'dist/esm',
      alias: { '@/': 'src/' },
      hooks: [minify({ dir: 'dist/min' })],
    },
    expected: {
      moduleCount: 4,
      outputs: [
        {
          name: 'default',
          dir: 'dist/esm',
          filePaths: ['app.js', 'common/utils.js', 'info.js', 'tool.js'],
          files: [
            {
              path: 'app.js',
              includes: ['./common/utils.js', './info.js', 'console.log(greet(APP_INFO.name))'],
            },
            { path: 'common/utils.js', notIncludes: ['interface ', '<T>'] },
          ],
        },
        {
          name: 'min',
          dir: 'dist/min',
          filePaths: ['app.js', 'common/utils.js', 'info.js', 'tool.js'],
          files: [
            {
              path: 'app.js',
              includes: ['./common/utils.js'],
              shorterThanSamePathInOutput: 'default',
            },
          ],
        },
      ],
    },
  },
  {
    name: '裸说明符 external 原样保留，动态 import 字符串重写',
    files: {
      'src/main.ts':
        "import external from 'some-pkg'\nconst lazy = () => import('./lazy')\nexport const value = external + String(lazy)\n",
      'src/lazy.ts': 'export const lazyValue = 42\n',
    },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          filePaths: ['lazy.js', 'main.js'],
          files: [{ path: 'main.js', includes: ['some-pkg', './lazy.js'] }],
        },
      ],
    },
  },
  {
    name: '产出冻结：watch 订阅者拿到稳定身份，篡改被拒并可捕获',
    files: { 'src/main.ts': 'console.log(1)\n' },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'mutator',
          watch: ['default'],
          lower: (ctx, output) => {
            const notes: string[] = []
            try {
              ;(output.files as EmittedFile[]).push({ path: 'x.js', code: '' })
            } catch {
              notes.push('push-blocked')
            }
            try {
              ;(output as { name: string }).name = 'hijacked'
            } catch {
              notes.push('assign-blocked')
            }
            ctx.output({
              name: 'audit',
              dir: 'dist/audit',
              files: [{ path: 'audit.txt', code: notes.join(',') }],
            })
          },
        } satisfies WatchHook,
      ],
    },
    expected: {
      outputs: [
        { name: 'default', dir: 'dist' },
        {
          name: 'audit',
          dir: 'dist/audit',
          files: [{ path: 'audit.txt', includes: ['push-blocked', 'assign-blocked'] }],
        },
      ],
    },
  },
  {
    name: '未解析的相对导入使构建失败',
    files: {
      'src/main.ts': "import { missing } from './missing'\nconsole.log(missing)\n",
    },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
    },
    expected: { error: '无法解析导入 "./missing"' },
  },
  {
    name: '循环依赖入图即止（图层环无害），双向说明符重写',
    files: {
      'src/a.ts': "import { b } from './b'\nexport const a = 'a'\nconsole.log(b)\n",
      'src/b.ts': "import { a } from './a'\nexport const b = a + '-b'\n",
    },
    config: {
      inputs: [{ name: 'a', path: 'src/a.ts' }],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          files: [
            { path: 'a.js', includes: ['./b.js'] },
            { path: 'b.js', includes: ['./a.js'] },
          ],
        },
      ],
    },
  },
  {
    name: 'lower 链：重命名生效、恒等合法、0 工件消费终结（模块计数保留）',
    files: {
      'src/main.ts': 'const value: number = 1\nexport const use = (): number => value\n',
      'src/sink.ts': 'export const consumed = true\n',
    },
    config: {
      inputs: [
        { name: 'main', path: 'src/main.ts' },
        { name: 'sink', path: 'src/sink.ts' },
      ],
      hooks: [
        {
          name: 'renamer',
          lower: (id, artifacts) =>
            id === 'src/main.ts'
              ? artifacts.map((artifact) => ({
                  ...artifact,
                  code: artifact.code.replaceAll('value', 'renamed'),
                }))
              : artifacts,
        },
        {
          name: 'identity',
          lower: (_id, artifacts) => artifacts,
        },
        {
          name: 'sink',
          lower: (id, artifacts) => (id === 'src/sink.ts' ? [] : artifacts),
        } satisfies ModuleHook,
      ],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          filePaths: ['main.js'],
          files: [
            {
              path: 'main.js',
              includes: ['const renamed = 1', 'const use = () => renamed'],
              notIncludes: [': number'],
            },
          ],
        },
      ],
    },
  },
  {
    name: 'resolve 内联供料：无 fs 文件的虚拟模块进入完整生命周期',
    files: { 'src/main.ts': "import { generated } from './generated'\nconsole.log(generated)\n" },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'feed-generated',
          resolve: (specifier) =>
            specifier === './generated'
              ? { id: 'src/generated.ts', content: 'export const generated = 7\n' }
              : null,
        },
      ],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          filePaths: ['generated.js', 'main.js'],
          files: [
            { path: 'generated.js', includes: ['const generated = 7', 'export {'] },
            { path: 'main.js', includes: ['./generated.js'] },
          ],
        },
      ],
    },
  },
  {
    name: 'demand 传递闭包＋依赖先行＋external 跳过：单文件打包范本',
    files: closureFiles,
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'single-file',
          lower: async (id, artifacts, ctx) => {
            if (id !== 'src/main.ts') return artifacts
            const deps = await ctx.demand(ctx.lowerImport(artifacts[0].code))
            const parts = deps.map((mod) => stripInternalImports(mod.code, mod.id, closureFiles))
            parts.push(stripInternalImports(artifacts[0].code, id, closureFiles))
            return [{ path: 'bundle.js', code: parts.join('\n') }]
          },
        } satisfies ModuleHook,
      ],
    },
    expected: {
      moduleCount: 4,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          filePaths: ['b.js', 'bundle.js', 'c.js', 'd.js'],
          files: [
            {
              path: 'bundle.js',
              includes: ['ext-pkg', 'const c = 3', 'import ext from'],
              notIncludes: ['from "./b"', 'from "./d"', 'from "./c"'],
            },
          ],
        },
      ],
    },
    verify: (result) => {
      const bundle = result.outputs[0].files.find((file) => file.path === 'bundle.js')
      if (bundle === undefined) return ['缺少 bundle.js']
      const positionOf = (needle: string): number => {
        const index = bundle.code.indexOf(needle)
        return index === -1 ? Number.POSITIVE_INFINITY : index
      }
      const order = [
        positionOf('const d ='),
        positionOf('const b ='),
        positionOf('const c ='),
        positionOf('console.log(b, c)'),
      ]
      return order.every(
        (value, index) =>
          value !== Number.POSITIVE_INFINITY && (index === 0 || value > order[index - 1]),
      )
        ? []
        : [`bundle.js 依赖先行顺序不成立：d→b→c→入口，实际位置 ${JSON.stringify(order)}`]
    },
  },
  {
    name: 'await 环未捕获：构建失败且错误含环路径（A↔B）',
    files: {
      'src/a.ts': "import { b } from './b'\nexport const a = 'a'\nconsole.log(b)\n",
      'src/b.ts': "import { a } from './a'\nexport const b = a + '-b'\n",
    },
    config: {
      inputs: [{ name: 'a', path: 'src/a.ts' }],
      hooks: [pullImports('pull')],
    },
    expected: { error: ['循环依赖', 'src/a.ts', 'src/b.ts'] },
  },
  {
    name: 'await 环捕获后 merge 解环：合并体替代双模块，第三方 demand 命中缓存',
    files: {
      'src/a.ts': "import { bHelper } from './b'\nexport const aVal = 'a+' + bHelper\n",
      'src/b.ts': "import { aVal } from './a'\nexport const bHelper = 'b(' + aVal + ')'\n",
      'src/c.ts': "import { aVal } from './a'\nexport const cReport = 'c(' + aVal + ')'\n",
    },
    config: {
      inputs: [{ name: 'c', path: 'src/c.ts' }],
      hooks: [
        {
          name: 'merge-on-cycle',
          lower: async (id, artifacts, ctx) => {
            if (id !== 'src/a.ts') return artifacts
            try {
              await ctx.demand(ctx.lowerImport(artifacts[0].code))
              return artifacts
            } catch (error) {
              if (!(error instanceof CycleError)) throw error
              await ctx.merge(['./a', './b'])
              return []
            }
          },
        } satisfies ModuleHook,
        {
          name: 'collector',
          lower: async (id, artifacts, ctx) => {
            if (id !== 'src/c.ts') return artifacts
            const deps = await ctx.demand(['./a'])
            const merged = deps[0]
            const marker = `demand-a-got-merged:${
              merged.code.includes('aVal') && merged.code.includes('bHelper')
            }`
            return [{ code: `${artifacts[0].code}\nconsole.log(${JSON.stringify(marker)})\n` }]
          },
        } satisfies ModuleHook,
      ],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          filePaths: ['a.js', 'c.js'],
          files: [
            {
              path: 'a.js',
              includes: ['const aVal =', 'const bHelper ='],
              notIncludes: ['from "./b"', 'from "./a"'],
            },
            { path: 'c.js', includes: ['demand-a-got-merged:true', './a.js'] },
          ],
        },
      ],
    },
  },
  {
    name: '三模块 await 环：环路径保持加边顺序',
    files: {
      'src/a.ts': "import { b } from './b'\nexport const a = 1\nconsole.log(b)\n",
      'src/b.ts': "import { c } from './c'\nexport const b = 2\nconsole.log(c)\n",
      'src/c.ts': "import { a } from './a'\nexport const c = 3\nconsole.log(a)\n",
    },
    config: {
      inputs: [{ name: 'a', path: 'src/a.ts' }],
      hooks: [pullImports('pull')],
    },
    expected: { error: '循环依赖：src/a.ts → src/b.ts → src/c.ts → src/a.ts' },
  },
  {
    name: 'bundle 内置 hook 对 A↔B 环：单文件 __define/__require 结构',
    files: {
      'src/main.ts': "import { fromA } from './a'\nconsole.log(fromA('x'))\n",
      'src/a.ts':
        "import { fromB } from './b'\nexport const fromA = (x: string): string => `[a:$" +
        '{fromB(x)}]`\n',
      'src/b.ts':
        "import { fromA } from './a'\nexport const unusedRef = typeof fromA\nexport const fromB = (x: string): string => `[b:$" +
        '{x}]`\n',
    },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [bundle({ entry: 'main', dir: 'dist' })],
    },
    expected: {
      moduleCount: 3,
      outputs: [
        {
          name: 'default',
          dir: 'dist',
          filePaths: ['a.js', 'b.js', 'main.js'],
        },
        {
          name: 'bundle',
          dir: 'dist',
          filePaths: ['bundle.js'],
          files: [
            {
              path: 'bundle.js',
              includes: [
                '__define(',
                '__require(',
                '__require("src/main.ts")',
                'exports["fromA"]',
                'exports["fromB"]',
              ],
              notIncludes: ['from "./a"', 'from "./b"'],
            },
          ],
        },
      ],
    },
  },
  {
    name: 'watch 订阅成环：重名登记即报错（append-only 环断路器）',
    files: { 'src/main.ts': 'console.log(1)\n' },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'seed-a',
          lower: (_id, artifacts, ctx) => {
            ctx.output({
              name: 'a',
              dir: 'dist/a',
              files: [{ path: 'a.txt', code: 'a' }],
            })
            return artifacts
          },
        } satisfies ModuleHook,
        {
          name: 'watch-a',
          watch: ['a'],
          lower: (ctx) => {
            ctx.output({
              name: 'b',
              dir: 'dist/b',
              files: [{ path: 'b.txt', code: 'b' }],
            })
          },
        } satisfies WatchHook,
        {
          name: 'watch-b',
          watch: ['b'],
          lower: (ctx) => {
            ctx.output({
              name: 'a',
              dir: 'dist/a2',
              files: [{ path: 'a2.txt', code: 'a2' }],
            })
          },
        } satisfies WatchHook,
      ],
    },
    expected: {
      error: ['产出重名 "a"', '插件 "seed-a"', '插件 "watch-b"'],
    },
  },
  {
    name: 'async 全链路：resolve/load/lower/derive/watch 全异步',
    files: {
      'src/main.ts': "import { extra } from './extra'\nconsole.log(extra)\n",
      'src/extra.ts': 'export const extra = 41 + 1\n',
    },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      dist: 'dist/async',
      load: async (ctx, id) => {
        await tick()
        return ctx.fs.readFile(id)
      },
      hooks: [
        {
          name: 'async-supplier',
          async resolve(source) {
            await tick()
            return source === './extra' ? { id: 'src/extra.ts' } : null
          },
        },
        {
          name: 'async-lower',
          lower: async (id, artifacts) => {
            await tick()
            if (id !== 'src/extra.ts') return artifacts
            return artifacts.map((artifact) => ({
              ...artifact,
              code: artifact.code.replace('41 + 1', '41 + 2'),
            }))
          },
        } satisfies ModuleHook,
        minify({ dir: 'dist/min' }),
        {
          name: 'async-derive',
          derive: async (ctx) => {
            await tick()
            ctx.output({
              name: 'report',
              dir: 'dist/report',
              files: [{ path: 'report.txt', code: `modules:${ctx.modules.length}` }],
            })
          },
        },
      ],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          name: 'default',
          dir: 'dist/async',
          filePaths: ['extra.js', 'main.js'],
          files: [
            { path: 'extra.js', includes: ['41 + 2'], notIncludes: ['41 + 1'] },
            { path: 'main.js', includes: ['./extra.js'] },
          ],
        },
        { name: 'min', dir: 'dist/min' },
        {
          name: 'report',
          dir: 'dist/report',
          files: [{ path: 'report.txt', includes: ['modules:2'] }],
        },
      ],
    },
  },
  {
    name: 'derive 图根派生：终态模块集登记 manifest，顺序在 default 之后',
    files: {
      'src/main.ts': "import { util } from './util'\nconsole.log(util)\n",
      'src/util.ts': 'export const util = 1\n',
    },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'aggregator',
          derive: (ctx) => {
            ctx.output({
              name: 'manifest',
              dir: 'dist/meta',
              files: [
                {
                  path: 'manifest.json',
                  code: JSON.stringify({
                    inputs: ctx.inputs.length,
                    modules: ctx.modules.map((mod) => mod.id),
                  }),
                },
              ],
            })
          },
        },
      ],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        { name: 'default', dir: 'dist', filePaths: ['main.js', 'util.js'] },
        {
          name: 'manifest',
          dir: 'dist/meta',
          files: [
            {
              path: 'manifest.json',
              includes: ['"inputs":1', 'src/main.ts', 'src/util.ts'],
            },
          ],
        },
      ],
    },
  },
  {
    name: '产出重名被拒：错误信息带两个来源插件名',
    files: { 'src/main.ts': 'console.log(1)\n' },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'alpha-maker',
          watch: ['default'],
          lower: (ctx) => {
            ctx.output({ name: 'bundle', dir: 'dist/a', files: [] })
          },
        } satisfies WatchHook,
        {
          name: 'beta-maker',
          watch: ['default'],
          lower: (ctx) => {
            ctx.output({ name: 'bundle', dir: 'dist/b', files: [] })
          },
        } satisfies WatchHook,
      ],
    },
    expected: {
      error: ['产出重名 "bundle"', '插件 "alpha-maker"', '插件 "beta-maker"'],
    },
  },
  {
    name: 'seal 之后 ctx.output 被拒：终态只属于构建会话',
    files: { 'src/main.ts': 'console.log(1)\n' },
    config: {
      inputs: [{ name: 'main', path: 'src/main.ts' }],
      hooks: [
        {
          name: 'late',
          lower: (_id, artifacts, ctx) => {
            capturedOutputFn = ctx.output
            return artifacts
          },
        } satisfies ModuleHook,
      ],
    },
    expected: {
      outputs: [{ name: 'default', dir: 'dist', filePaths: ['main.js'] }],
    },
    verify: () => {
      if (capturedOutputFn === undefined) return ['lower 应已捕获 ctx.output']
      try {
        capturedOutputFn({ name: 'late', dir: 'dist/late', files: [] })
        return ['seal 之后 ctx.output 应被拒绝']
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return message.includes('构建会话已结束')
          ? []
          : [`错误信息应包含 "构建会话已结束"，实际：${message}`]
      }
    },
  },
]

const failuresForError = (message: string, expected: string | string[]): string[] => {
  const needles = Array.isArray(expected) ? expected : [expected]
  return needles
    .filter((needle) => !message.includes(needle))
    .map((needle) => `错误信息应包含 "${needle}"，实际：${message}`)
}

const checkOutput = (
  result: BuildResult,
  expectation: OutputExpectation,
  index: number,
): string[] => {
  const output = result.outputs[index]
  if (output === undefined) return [`缺少产出 #${index}（${expectation.name}）`]
  const failures: string[] = []
  const label = `${expectation.name}（${expectation.dir}）`
  if (output.name !== expectation.name) {
    failures.push(`产出 #${index} 名称：期望 ${expectation.name}，实际 ${output.name}`)
  }
  if (output.dir !== expectation.dir) {
    failures.push(`产出 ${output.name} 目录：期望 ${expectation.dir}，实际 ${output.dir}`)
  }
  if (expectation.filePaths !== undefined) {
    const actual = JSON.stringify(output.files.map((file) => file.path))
    const expected = JSON.stringify(expectation.filePaths)
    if (actual !== expected) {
      failures.push(`${label} 产物清单：期望 ${expected}，实际 ${actual}`)
    }
  }
  for (const fileExpectation of expectation.files ?? []) {
    const file = output.files.find((candidate) => candidate.path === fileExpectation.path)
    if (file === undefined) {
      failures.push(`${label} 缺少产物 ${fileExpectation.path}`)
      continue
    }
    const fileLabel = `${label}/${fileExpectation.path}`
    for (const needle of fileExpectation.includes ?? []) {
      if (!file.code.includes(needle)) failures.push(`${fileLabel} 应包含 "${needle}"`)
    }
    for (const banned of fileExpectation.notIncludes ?? []) {
      if (file.code.includes(banned)) failures.push(`${fileLabel} 不应包含 "${banned}"`)
    }
    if (fileExpectation.shorterThanSamePathInOutput !== undefined) {
      const other = result.outputs
        .find(
          (candidate: EmittedOutput) =>
            candidate.name === fileExpectation.shorterThanSamePathInOutput,
        )
        ?.files.find((candidate) => candidate.path === fileExpectation.path)
      if (other === undefined || other.code.length <= file.code.length) {
        failures.push(
          `${fileLabel} 应比产出 ${fileExpectation.shorterThanSamePathInOutput} 的同路径产物更短`,
        )
      }
    }
  }
  return failures
}

const withMemoryFs = (
  scenario: { files: Record<string, string> },
  config: Omit<StackConfig, 'fs' | 'root'>,
): StackConfig => ({
  ...config,
  root: '.',
  fs: memoryFs(scenario.files),
})

export async function runScenario(scenario: Scenario): Promise<ScenarioReport> {
  const failures: string[] = []
  try {
    const result = await build(withMemoryFs(scenario, scenario.config))
    if (scenario.expected.error !== undefined) {
      failures.push('期望抛出错误，实际构建成功')
      return { name: scenario.name, failures }
    }
    if (
      scenario.expected.moduleCount !== undefined &&
      result.moduleCount !== scenario.expected.moduleCount
    ) {
      failures.push(`模块数：期望 ${scenario.expected.moduleCount}，实际 ${result.moduleCount}`)
    }
    if (scenario.expected.outputs !== undefined) {
      if (result.outputs.length !== scenario.expected.outputs.length) {
        failures.push(
          `产出数：期望 ${scenario.expected.outputs.length}，实际 ${result.outputs.length}`,
        )
      }
      scenario.expected.outputs.forEach((expectation, index) => {
        failures.push(...checkOutput(result, expectation, index))
      })
    }
    failures.push(...(scenario.verify?.(result) ?? []))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (scenario.expected.error === undefined) {
      failures.push(`意外抛错：${message}`)
    } else {
      failures.push(...failuresForError(message, scenario.expected.error))
    }
  }
  return { name: scenario.name, failures }
}
