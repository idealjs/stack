import { existsSync, type FSWatcher, mkdirSync, rmSync, watch, writeFileSync } from 'node:fs'
import { dirname as nodeDirname, resolve as resolvePath } from 'node:path'
import { pathToFileURL } from 'node:url'
import { type BuildResult, build, type StackConfig } from '../index.ts'
import { nodeFsPlugin } from './fsPlugin.ts'

const VERSION = '0.1.0'
const WATCH_DEBOUNCE_MS = 150
const IGNORED_WATCH_SEGMENTS = new Set(['node_modules', 'dist', '.git'])

interface CliOptions {
  configPath: string
  watchMode: boolean
}

function parseArgs(argv: string[]): CliOptions {
  let configPath = 'stack.config.ts'
  let watchMode = false
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--config') {
      const value = argv[i + 1]
      if (value === undefined) throw new Error('--config 需要一个配置文件路径')
      configPath = value
      i += 1
    } else if (arg.startsWith('--config=')) {
      configPath = arg.slice('--config='.length)
    } else if (arg === '--watch' || arg === '-w') {
      watchMode = true
    } else {
      throw new Error(`未知参数：${arg}`)
    }
  }
  return { configPath, watchMode }
}

async function loadConfig(configPath: string): Promise<StackConfig> {
  const absolute = resolvePath(process.cwd(), configPath)
  if (!existsSync(absolute)) throw new Error(`找不到配置文件：${absolute}`)
  const module = await import(pathToFileURL(absolute).href)
  const config = (module.default ?? module.config) as StackConfig | undefined
  if (config === undefined) {
    throw new Error(`配置文件需要默认导出 defineConfig(...) 的返回值：${absolute}`)
  }
  return config
}

const withNodePlugins = (config: StackConfig): StackConfig => ({
  ...config,
  plugins: [nodeFsPlugin(config.root ?? '.'), ...(config.plugins ?? [])],
})

function writeOutputs(root: string, result: BuildResult): void {
  const rootAbsolute = resolvePath(root)
  for (const output of result.outputs) {
    const outputRoot = resolvePath(rootAbsolute, output.dir)
    if (outputRoot === rootAbsolute) {
      throw new Error(`输出目录不能等于项目根目录：${output.dir}`)
    }
    rmSync(outputRoot, { recursive: true, force: true })
    for (const file of output.files) {
      const target = resolvePath(outputRoot, file.path)
      mkdirSync(nodeDirname(target), { recursive: true })
      writeFileSync(target, file.code)
    }
  }
}

const byteLength = (code: string): number => new TextEncoder().encode(code).length

function printSummary(result: BuildResult): void {
  const lines = result.outputs.map(
    (output) =>
      `${output.name} → ${output.dir}（${output.files.length} 个文件，${(
        output.files.reduce((total, file) => total + byteLength(file.code), 0) / 1000
      ).toFixed(2)} kB）`,
  )
  lines.push(`构建完成：${result.moduleCount} 个模块，用时 ${result.durationMs}ms`)
  console.log(lines.join('\n'))
}

async function buildOnce(config: StackConfig): Promise<void> {
  const result = await build(withNodePlugins(config))
  writeOutputs(config.root ?? '.', result)
  printSummary(result)
}

async function runWatch(config: StackConfig): Promise<void> {
  const root = config.root ?? '.'
  console.log(`stack v${VERSION} watch 模式：监听 ${root}（忽略 node_modules/dist/.git）`)
  await buildOnce(config)
  let rebuilding = false
  let queued = false
  const rebuild = async (): Promise<void> => {
    if (rebuilding) {
      queued = true
      return
    }
    rebuilding = true
    try {
      await buildOnce(config)
    } catch (error) {
      console.error(`重建失败：${error instanceof Error ? error.message : error}`)
    } finally {
      rebuilding = false
      if (queued) {
        queued = false
        await rebuild()
      }
    }
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const watcher: FSWatcher = watch(root, { recursive: true }, (_event, filename) => {
    const changed = filename === null ? '' : String(filename).replaceAll('\\', '/')
    if (changed.split('/').some((segment) => IGNORED_WATCH_SEGMENTS.has(segment))) return
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      void rebuild()
    }, WATCH_DEBOUNCE_MS)
  })
  process.once('SIGINT', () => {
    watcher.close()
    if (timer !== undefined) clearTimeout(timer)
    console.log('\nwatch 已停止')
    process.exit(0)
  })
}

export async function runCLI(argv: string[]): Promise<void> {
  const options = parseArgs(argv)
  const userConfig = await loadConfig(options.configPath)
  const config: StackConfig = {
    ...userConfig,
    root: resolvePath(process.cwd(), userConfig.root ?? '.'),
  }
  console.log(
    `stack v${VERSION}：${config.inputs.length} 个输入，规范产物 → ${config.dist ?? 'dist'}（插件可在 buildEnd 追加产出）`,
  )
  if (options.watchMode) {
    await runWatch(config)
    return
  }
  await buildOnce(config)
}
