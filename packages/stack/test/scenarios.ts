import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from '../src/core/pathUtil.ts'
import type { BuildResult, EmittedOutput, StackConfig, StackPlugin } from '../src/index.ts'
import { build, minify } from '../src/index.ts'

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
  config: StackConfig
  expected: ScenarioExpected
  verify?: (result: BuildResult) => string[]
  rebuild?: {
    config: StackConfig
    expectedError: string
  }
}

export interface ScenarioReport {
  name: string
  failures: string[]
}

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

const capturedOutputs: string[] = []
let capturedOutputFn: ((spec: EmittedOutput) => void) | undefined

const lateProducer: StackPlugin = {
  name: 'late-producer',
  transform(_id, code) {
    capturedOutputFn?.({ name: 'late', dir: 'dist/late', files: [] })
    return code
  },
  buildEnd(ctx) {
    capturedOutputFn = ctx.output
  },
}

export const SCENARIOS: Scenario[] = [
  {
    name: '一次构建产出两份：default 规范产物＋minify 插件衍生产物',
    files: cartesianFiles,
    config: {
      inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
      dist: 'dist/esm',
      alias: { '@/': 'src/' },
      plugins: [minify({ dir: 'dist/min' })],
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
      inputs: { main: 'src/main.ts' },
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
    name: '未解析的相对导入使构建失败',
    files: {
      'src/main.ts': "import { missing } from './missing'\nconsole.log(missing)\n",
    },
    config: {
      inputs: { main: 'src/main.ts' },
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
    name: 'transform 链 first-non-null 在类型剥离前生效',
    files: {
      'src/main.ts': 'export const value: number = 1\n',
    },
    config: {
      inputs: { main: 'src/main.ts' },
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
          name: 'default',
          dir: 'dist',
          files: [{ path: 'main.js', includes: ['renamed'], notIncludes: [': number'] }],
        },
      ],
    },
  },
  {
    name: '插件经 ctx.output 追加产出，且只读可见 default 与先序产出',
    files: {
      'src/main.ts': "console.log('ok')\n",
    },
    config: {
      inputs: { main: 'src/main.ts' },
      dist: 'dist/site',
      plugins: [
        {
          name: 'manifest-maker',
          buildEnd(ctx) {
            capturedOutputs.push(...ctx.outputs.map((output) => output.name))
            ctx.output({
              name: 'manifest',
              dir: 'dist/meta',
              files: [
                {
                  path: 'manifest.json',
                  code: JSON.stringify(ctx.outputs.map((output) => `${output.name}:${output.dir}`)),
                },
              ],
            })
          },
        },
      ],
    },
    expected: {
      moduleCount: 1,
      outputs: [
        { name: 'default', dir: 'dist/site', filePaths: ['main.js'] },
        {
          name: 'manifest',
          dir: 'dist/meta',
          files: [{ path: 'manifest.json', includes: ['default:dist/site'] }],
        },
      ],
    },
    verify: () =>
      capturedOutputs.length === 1 && capturedOutputs[0] === 'default'
        ? []
        : [`buildEnd 应只见 default 一个产出，实际 ${JSON.stringify(capturedOutputs)}`],
  },
  {
    name: '产出重名被拒，错误信息带两个来源插件名',
    files: {
      'src/main.ts': "console.log('ok')\n",
    },
    config: {
      inputs: { main: 'src/main.ts' },
      plugins: [
        {
          name: 'alpha-maker',
          buildEnd(ctx) {
            ctx.output({ name: 'bundle', dir: 'dist/a', files: [] })
          },
        },
        {
          name: 'beta-maker',
          buildEnd(ctx) {
            ctx.output({ name: 'bundle', dir: 'dist/b', files: [] })
          },
        },
      ],
    },
    expected: {
      error: ['产出重名 "bundle"', '插件 "alpha-maker"', '插件 "beta-maker"'],
    },
  },
  {
    name: 'ctx.output 在模块阶段被拒：捕获后于下次构建的 transform 调用必须抛错',
    files: {
      'src/main.ts': "console.log('ok')\n",
    },
    config: {
      inputs: { main: 'src/main.ts' },
      plugins: [lateProducer],
    },
    expected: {
      outputs: [{ name: 'default', dir: 'dist', filePaths: ['main.js'] }],
    },
    rebuild: {
      config: {
        inputs: { main: 'src/main.ts' },
        plugins: [lateProducer],
      },
      expectedError: '只能在 buildEnd 阶段产出',
    },
  },
]

const withMemoryFs = (
  scenario: { files: Record<string, string> },
  config: StackConfig,
): StackConfig => ({
  ...config,
  plugins: [memoryFsPlugin(scenario.files), ...(config.plugins ?? [])],
})

export async function runScenario(scenario: Scenario): Promise<ScenarioReport> {
  const failures: string[] = []
  try {
    const result = await build(withMemoryFs(scenario, scenario.config))
    if (scenario.expected.error !== undefined) {
      failures.push(`期望抛出错误，实际构建成功`)
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
  if (failures.length === 0 && scenario.rebuild !== undefined) {
    try {
      await build(withMemoryFs(scenario, scenario.rebuild.config))
      failures.push(`rebuild 期望抛错（${scenario.rebuild.expectedError}），实际成功`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes(scenario.rebuild.expectedError)) {
        failures.push(
          `rebuild 错误信息应包含 "${scenario.rebuild.expectedError}"，实际：${message}`,
        )
      }
    }
  }
  return { name: scenario.name, failures }
}
