import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from '../src/core/pathUtil.ts'
import type { BuildResult, StackConfig, StackPlugin } from '../src/index.ts'
import { build } from '../src/index.ts'

export const memoryFsPlugin = (files: Record<string, string>): StackPlugin => ({
  name: 'memory-fs',
  resolveId(source, importer) {
    const base = isRelativeSpecifier(source)
      ? joinPath(dirnamePath(importer), source)
      : joinPath('.', source)
    return (
      moduleCandidates(normalizePath(base)).find((candidate) => files[candidate] !== undefined) ??
      null
    )
  },
  load(id) {
    return files[id] ?? null
  },
})

export interface FileExpectation {
  path: string
  includes?: string[]
  notIncludes?: string[]
  shorterThanSamePathInOutput?: number
}

export interface OutputExpectation {
  dir: string
  minify?: boolean
  entryPaths?: Record<string, string>
  filePaths?: string[]
  files?: FileExpectation[]
}

export interface ScenarioExpected {
  moduleCount?: number
  outputs?: OutputExpectation[]
  error?: string
}

export interface Scenario {
  name: string
  files: Record<string, string>
  config: StackConfig
  expected: ScenarioExpected
  verify?: (result: BuildResult) => string[]
}

export interface ScenarioReport {
  name: string
  failures: string[]
}

const buildEndSeen = { count: 0, outputs: 0 }

export const SCENARIOS: Scenario[] = [
  {
    name: 'n×m 笛卡尔积：2 入口 × 2 输出，alias 与类型剥离同时生效',
    files: {
      'src/app.ts':
        "import { greet } from './common/utils'\nimport { APP_INFO } from '@/info'\nconsole.log(greet(APP_INFO.name))\n",
      'src/tool.ts':
        "import { pickBy } from './common/utils'\nconsole.log(pickBy([1, 2, 3], (n) => n > 1))\n",
      'src/common/utils.ts':
        'export interface Box<T> { value: T }\nexport const greet = (name: string): string => `hi $' +
        '{name}`\nexport function pickBy<T>(items: T[], keep: (item: T) => boolean): T[] {\n  return items.filter(keep)\n}\n',
      'src/info.ts': "export const APP_INFO = { name: 'demo' }\n",
    },
    config: {
      inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
      outputs: [{ dir: 'dist/esm' }, { dir: 'dist/min', minify: true }],
      alias: { '@/': 'src/' },
    },
    expected: {
      moduleCount: 4,
      outputs: [
        {
          dir: 'dist/esm',
          entryPaths: { app: 'app.js', tool: 'tool.js' },
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
          dir: 'dist/min',
          minify: true,
          entryPaths: { app: 'app.js', tool: 'tool.js' },
          files: [
            {
              path: 'app.js',
              includes: ['./common/utils.js'],
              shorterThanSamePathInOutput: 0,
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
      inputs: { main: 'src/main.ts' },
      outputs: [{ dir: 'dist' }],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
          dir: 'dist',
          filePaths: ['lazy.js', 'main.js'],
          files: [{ path: 'main.js', includes: ['some-pkg', './lazy.js'] }],
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
      inputs: { main: 'src/main.ts' },
      outputs: [{ dir: 'dist' }],
    },
    expected: { error: '无法解析导入 "./missing"' },
  },
  {
    name: '循环依赖入图即止，双向说明符重写',
    files: {
      'src/a.ts': "import { b } from './b'\nexport const a = 'a'\nconsole.log(b)\n",
      'src/b.ts': "import { a } from './a'\nexport const b = a + '-b'\n",
    },
    config: {
      inputs: { a: 'src/a.ts' },
      outputs: [{ dir: 'dist' }],
    },
    expected: {
      moduleCount: 2,
      outputs: [
        {
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
    name: 'transform 链 first-non-null 在类型剥离前生效',
    files: {
      'src/main.ts': 'export const value: number = 1\n',
    },
    config: {
      inputs: { main: 'src/main.ts' },
      outputs: [{ dir: 'dist' }],
      plugins: [
        {
          name: 'renaming',
          transform(id, code) {
            if (id === 'src/main.ts') return code.replace('value', 'renamed')
            return null
          },
        },
      ],
    },
    expected: {
      outputs: [
        {
          dir: 'dist',
          files: [{ path: 'main.js', includes: ['renamed'], notIncludes: [': number'] }],
        },
      ],
    },
  },
  {
    name: 'buildEnd 钩子在构建完成时收到完整结果',
    files: {
      'src/main.ts': "console.log('ok')\n",
    },
    config: {
      inputs: { main: 'src/main.ts' },
      outputs: [{ dir: 'dist/a' }, { dir: 'dist/b' }],
      plugins: [
        {
          name: 'observer',
          buildEnd(ctx) {
            buildEndSeen.count += 1
            buildEndSeen.outputs = ctx.result.outputs.length
          },
        },
      ],
    },
    expected: { moduleCount: 1 },
    verify: () =>
      buildEndSeen.count === 1 && buildEndSeen.outputs === 2
        ? []
        : [
            `buildEnd 应恰好触发一次且携带 2 个输出，实际 ${buildEndSeen.count} 次 / ${buildEndSeen.outputs} 个`,
          ],
  },
]

const encodeRecord = (record: Record<string, string>): string =>
  Object.keys(record)
    .sort()
    .map((key) => `${key}=${record[key]}`)
    .join(',')

const recordMismatches = (
  actual: Record<string, string>,
  expected: Record<string, string>,
  label: string,
): string[] =>
  encodeRecord(actual) === encodeRecord(expected)
    ? []
    : [`${label}：期望 ${encodeRecord(expected)}，实际 ${encodeRecord(actual)}`]

const checkOutput = (
  result: BuildResult,
  expectation: OutputExpectation,
  index: number,
): string[] => {
  const output = result.outputs[index]
  if (output === undefined) return [`缺少输出 #${index}（${expectation.dir}）`]
  const failures: string[] = []
  if (output.dir !== expectation.dir) {
    failures.push(`输出 #${index} 目录：期望 ${expectation.dir}，实际 ${output.dir}`)
  }
  if (output.minify !== (expectation.minify ?? false)) {
    failures.push(
      `${expectation.dir} minify：期望 ${expectation.minify ?? false}，实际 ${output.minify}`,
    )
  }
  if (expectation.entryPaths !== undefined) {
    failures.push(
      ...recordMismatches(output.entryPaths, expectation.entryPaths, `${expectation.dir} 入口表`),
    )
  }
  if (expectation.filePaths !== undefined) {
    const actual = JSON.stringify(output.files.map((file) => file.path))
    const expected = JSON.stringify(expectation.filePaths)
    if (actual !== expected) {
      failures.push(`${expectation.dir} 产物清单：期望 ${expected}，实际 ${actual}`)
    }
  }
  for (const fileExpectation of expectation.files ?? []) {
    const file = output.files.find((candidate) => candidate.path === fileExpectation.path)
    if (file === undefined) {
      failures.push(`${expectation.dir} 缺少产物 ${fileExpectation.path}`)
      continue
    }
    const label = `${expectation.dir}/${fileExpectation.path}`
    for (const needle of fileExpectation.includes ?? []) {
      if (!file.code.includes(needle)) failures.push(`${label} 应包含 "${needle}"`)
    }
    for (const banned of fileExpectation.notIncludes ?? []) {
      if (file.code.includes(banned)) failures.push(`${label} 不应包含 "${banned}"`)
    }
    if (fileExpectation.shorterThanSamePathInOutput !== undefined) {
      const other = result.outputs[fileExpectation.shorterThanSamePathInOutput]?.files.find(
        (candidate) => candidate.path === fileExpectation.path,
      )
      if (other === undefined || other.code.length <= file.code.length) {
        failures.push(`${label} 应比对应产物更短`)
      }
    }
  }
  return failures
}

export async function runScenario(scenario: Scenario): Promise<ScenarioReport> {
  const failures: string[] = []
  try {
    const result = await build({
      ...scenario.config,
      plugins: [memoryFsPlugin(scenario.files), ...(scenario.config.plugins ?? [])],
    })
    if (scenario.expected.error !== undefined) {
      failures.push(`期望抛出错误（${scenario.expected.error}），实际构建成功`)
      return { name: scenario.name, failures }
    }
    if (
      scenario.expected.moduleCount !== undefined &&
      result.moduleCount !== scenario.expected.moduleCount
    ) {
      failures.push(`模块数：期望 ${scenario.expected.moduleCount}，实际 ${result.moduleCount}`)
    }
    scenario.expected.outputs?.forEach((expectation, index) => {
      failures.push(...checkOutput(result, expectation, index))
    })
    failures.push(...(scenario.verify?.(result) ?? []))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (scenario.expected.error === undefined) {
      failures.push(`意外抛错：${message}`)
    } else if (!message.includes(scenario.expected.error)) {
      failures.push(`错误信息应包含 "${scenario.expected.error}"，实际：${message}`)
    }
  }
  return { name: scenario.name, failures }
}
