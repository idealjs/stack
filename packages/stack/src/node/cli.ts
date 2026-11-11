import { existsSync, type FSWatcher, rmSync, watch } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { extname, relative, resolve as resolvePath } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cac } from 'cac'
import { type BuildResult, build, type StackConfig } from '../index.ts'
import { MIME, type ServedFile, startDevServer } from './dev.ts'
import { createDevBuildQueue } from './devBuild.ts'
import { nodeFs } from './fs.ts'

const VERSION = '0.2.0'
const WATCH_DEBOUNCE_MS = 150
const IGNORED_WATCH_SEGMENTS = new Set(['node_modules', 'dist', '.git'])

interface CliOptions {
  mode: 'build' | 'watch' | 'dev' | 'preview'
  configPath: string
  port: number
  base: string
  host?: boolean | string
  assets: Record<string, string>
  noWatch: boolean
}

const lastOf = <T>(value: T | T[] | undefined): T | undefined =>
  Array.isArray(value) ? value[value.length - 1] : value

function parseArgs(argv: string[]): CliOptions {
  const cli = cac('stack')
  cli.help()
  cli.version(VERSION)
  let parsed: CliOptions | undefined
  cli
    .command('[mode]', '构建一次；--watch 持续构建；dev 启动 dev server；preview 伺服已构建产物')
    .option('-w, --watch', 'watch 模式：监听文件变化持续构建')
    .option('--no-watch', 'dev server 是否监听文件变化')
    .option('--config <path>', '配置文件路径')
    .option('--port <port>', 'dev server 端口')
    .option('--base <path>', '部署路径前缀')
    .option('--host [address]', '暴露到局域网，可指定地址')
    .option('--asset <route>=<path>', '静态资源映射 <路由>=<文件路径>，可重复')
    .ignoreOptionDefaultValue()
    .action((mode, options) => {
      if (mode !== undefined && mode !== 'dev' && mode !== 'preview')
        throw new Error(`未知参数：${mode}`)
      const assets: Record<string, string> = {}
      const pairs =
        options.asset === undefined
          ? []
          : Array.isArray(options.asset)
            ? options.asset
            : [options.asset]
      for (const pair of pairs) {
        const [route, filePath] = pair.split('=')
        if (route === undefined || filePath === undefined)
          throw new Error('--asset 需要 <路由>=<文件路径>')
        assets[route] = filePath
      }
      const resolvedMode: CliOptions['mode'] =
        mode === 'dev'
          ? 'dev'
          : mode === 'preview'
            ? 'preview'
            : options.watch === true
              ? 'watch'
              : 'build'
      parsed = {
        mode: resolvedMode,
        configPath: lastOf(options.config) ?? 'stack.config.ts',
        port: Number(lastOf(options.port) ?? (resolvedMode === 'preview' ? 9910 : 8910)),
        base: lastOf(options.base) ?? '',
        host: lastOf(options.host),
        assets,
        noWatch: options.watch === false,
      }
    })
  cli.parse(['stack', 'stack', ...argv])
  if (parsed === undefined) process.exit(0)
  return parsed
}

export async function loadConfig(configPath: string): Promise<StackConfig> {
  const absolute = resolvePath(process.cwd(), configPath)
  if (!existsSync(absolute)) throw new Error(`找不到配置文件：${absolute}`)
  const module = await import(pathToFileURL(absolute).href)
  const config = (module.default ?? module.config) as StackConfig | undefined
  if (config === undefined) {
    throw new Error(`配置文件需要默认导出 defineConfig(...) 的返回值：${absolute}`)
  }
  return config
}

const withDefaults = (config: StackConfig): StackConfig => ({
  ...config,
  fs: config.fs ?? nodeFs(),
})

async function writeOutputs(config: StackConfig, result: BuildResult): Promise<void> {
  const fs = config.fs ?? nodeFs()
  const rootAbsolute = resolvePath(config.root ?? '.')
  for (const output of result.outputs) {
    const outputRoot = resolvePath(rootAbsolute, output.dir)
    if (outputRoot === rootAbsolute) {
      throw new Error(`输出目录不能等于项目根目录：${output.dir}`)
    }
    rmSync(outputRoot, { recursive: true, force: true })
    for (const file of output.files) {
      await fs.writeFile(resolvePath(outputRoot, file.path), file.code)
    }
  }
}

const byteLength = (code: string): number => new TextEncoder().encode(code).length

function printSummary(config: StackConfig, result: BuildResult): void {
  const lines = result.outputs.map(
    (output) =>
      `${output.name} → ${output.dir}（${output.files.length} 个文件，${(
        output.files.reduce((total, file) => total + byteLength(file.code), 0) / 1000
      ).toFixed(2)} kB）`,
  )
  lines.push(
    `构建完成：${config.inputs.length} 个输入，${result.moduleCount} 个模块，用时 ${result.durationMs}ms`,
  )
  console.log(lines.join('\n'))
}

async function buildAndWrite(config: StackConfig): Promise<BuildResult> {
  const result = await build(withDefaults(config))
  await writeOutputs(config, result)
  return result
}

async function buildOnce(config: StackConfig, summary = true): Promise<void> {
  const result = await buildAndWrite(config)
  if (summary) printSummary(config, result)
}

const outputUrlIndex = (config: StackConfig, result: BuildResult): Map<string, ServedFile> => {
  const rootAbsolute = resolvePath(config.root ?? '.')
  const index = new Map<string, ServedFile>()
  for (const output of result.outputs) {
    const dir = relative(rootAbsolute, resolvePath(rootAbsolute, output.dir)).replaceAll('\\', '/')
    const prefix = dir === '.' ? '' : `${dir}/`
    for (const file of output.files) {
      index.set(`/${prefix}${file.path}`, {
        code: file.code,
        contentType: MIME[extname(file.path)] ?? 'application/octet-stream',
      })
    }
  }
  return index
}

function startWatcher(config: StackConfig, onChange: () => void): FSWatcher {
  let timer: ReturnType<typeof setTimeout> | undefined
  const watcher: FSWatcher = watch(config.root ?? '.', { recursive: true }, (_event, filename) => {
    const changed = filename === null ? '' : String(filename).replaceAll('\\', '/')
    if (changed.split('/').some((segment) => IGNORED_WATCH_SEGMENTS.has(segment))) return
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      onChange()
    }, WATCH_DEBOUNCE_MS)
  })
  process.once('SIGINT', () => {
    watcher.close()
    if (timer !== undefined) clearTimeout(timer)
    console.log('\nwatch 已停止')
    process.exit(0)
  })
  return watcher
}

async function runWatch(config: StackConfig, onRebuilt?: () => void): Promise<void> {
  const root = config.root ?? '.'
  console.log(`stack v${VERSION} watch 模式：监听 ${root}（忽略 node_modules/dist/.git）`)
  const queue = createDevBuildQueue({
    run: () => buildAndWrite(config),
    onBuilt: (result) => {
      printSummary(config, result)
      onRebuilt?.()
    },
    onFailed: (error) => {
      console.error(`重建失败：${error instanceof Error ? error.message : error}`)
    },
  })
  await queue.ensure()
  startWatcher(config, () => queue.invalidate())
}

function firstLanAddress(): string | undefined {
  for (const list of Object.values(networkInterfaces())) {
    for (const info of list ?? []) {
      if (info.family === 'IPv4' && !info.internal) return info.address
    }
  }
  return undefined
}

function printDevBanner(options: {
  port: number
  base: string
  host?: boolean | string
  readyMs: number
  building?: boolean
}): void {
  const suffix =
    options.base === '' ? '/' : `/${options.base.replace(/^\/+/, '').replace(/\/+$/, '')}/`
  const lines = [
    '',
    `  Stack v${VERSION}  ready in ${Math.round(options.readyMs)} ms`,
    '',
    `  ➜  Local:    http://localhost:${options.port}${suffix}`,
  ]
  if (options.host) {
    const address =
      typeof options.host === 'string' ? options.host : (firstLanAddress() ?? 'localhost')
    lines.push(`  ➜  Network:  http://${address}:${options.port}${suffix}`)
  } else {
    lines.push('  ➜  Network:  use --host to expose')
  }
  if (options.building === true) lines.push('  ➜  Build:    后台构建中（完成后自动刷新）')
  lines.push('  ➜  press h + enter to show help', '')
  console.log(lines.join('\n'))
}

function printDevHelp(): void {
  console.log(['', '  Shortcuts:', '    h  显示帮助', '    q  退出 dev server', ''].join('\n'))
}

function attachDevShortcuts(): void {
  if (!process.stdin.isTTY) return
  process.stdin.setEncoding('utf8')
  process.stdin.resume()
  process.stdin.on('data', (chunk: string) => {
    const key = chunk.trim()
    if (key === 'h') printDevHelp()
    if (key === 'q') {
      console.log('\ndev server 已停止')
      process.exit(0)
    }
  })
}

async function runDev(config: StackConfig, options: CliOptions): Promise<void> {
  if (options.noWatch) {
    await runPreview(config, options)
    return
  }
  const startedAt = performance.now()
  let reload: () => void = () => {}
  const queue = createDevBuildQueue({
    run: () => buildAndWrite(config),
    onBuilt: (result) => {
      printSummary(config, result)
      reload()
    },
    onFailed: (error) => {
      console.error(`后台构建失败：${error instanceof Error ? error.message : error}`)
    },
  })
  let servedFrom: BuildResult | null = null
  let servedIndex: Map<string, ServedFile> | null = null
  const serve = async (candidate: string): Promise<ServedFile | null> => {
    let result: BuildResult | null = null
    try {
      result = await queue.ensure()
    } catch (error) {
      if (servedFrom === null) throw error
    }
    if (result !== null && result !== servedFrom) {
      servedFrom = result
      servedIndex = outputUrlIndex(config, result)
    }
    if (servedFrom === null || servedIndex === null) return null
    const path = candidate.replace(/^\/+/, '')
    return servedIndex.get(`/${path}`) ?? null
  }
  const server = await startDevServer(config, {
    port: options.port,
    base: options.base,
    host: options.host,
    assets: options.assets,
    liveReload: true,
    serve,
  })
  reload = () => server.stackReload()
  printDevBanner({
    port: options.port,
    base: options.base,
    host: options.host,
    readyMs: performance.now() - startedAt,
    building: true,
  })
  attachDevShortcuts()
  queue.invalidate()
  startWatcher(config, () => queue.invalidate())
}

async function runPreview(config: StackConfig, options: CliOptions): Promise<void> {
  const dist = resolvePath(config.root ?? '.', config.dist ?? 'dist')
  if (!existsSync(dist)) {
    throw new Error(
      `产物目录不存在：${dist}——preview 伺服已构建产物，先跑一次构建（stack 或 stack build）`,
    )
  }
  const startedAt = performance.now()
  await startDevServer(config, {
    port: options.port,
    base: options.base,
    host: options.host,
    assets: options.assets,
    liveReload: false,
  })
  printDevBanner({
    port: options.port,
    base: options.base,
    host: options.host,
    readyMs: performance.now() - startedAt,
  })
  attachDevShortcuts()
}

export async function runCLI(argv: string[]): Promise<void> {
  const options = parseArgs(argv)
  const userConfig = await loadConfig(options.configPath)
  const config: StackConfig = {
    ...userConfig,
    root: resolvePath(process.cwd(), userConfig.root ?? '.'),
  }
  if (options.mode === 'dev') {
    await runDev(config, options)
    return
  }
  if (options.mode === 'preview') {
    await runPreview(config, options)
    return
  }
  console.log(
    `stack v${VERSION}：${config.inputs.length} 个输入，规范产物 → ${config.dist ?? 'dist'}`,
  )
  if (options.mode === 'watch') {
    await runWatch(config)
    return
  }
  await buildOnce(config)
}
