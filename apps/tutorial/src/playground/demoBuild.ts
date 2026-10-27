import {
  type BuildResult,
  build,
  initEsbuild,
  inputKindOf,
  loadConfigFromSource,
  memoryFs,
  type StackSourceConfig,
} from '@idealjs/stack'
import { bundle, imports } from '@idealjs/stack/builtins'

const WASM_URL = 'esbuild.wasm'
const CONFIG_NAME = 'stack.config.ts'
const DOC_NAME = 'index.html'

export interface DemoFile {
  name: string
  code: string
}

export interface DemoBuildResult {
  code: string
  htmlDoc: string
}

interface DemoPlan {
  inputs: { name: string; path: string }[]
  bundleEntry: string
}

export const buildDemo = async (files: readonly DemoFile[]): Promise<DemoBuildResult> => {
  await initEsbuild(WASM_URL)
  const map: Record<string, string> = {}
  for (const file of files) map[file.name] = file.code
  const config = await loadDemoConfig(files)
  const plan = planDemoInputs(files, config)
  const result = await build({
    inputs: plan.inputs,
    fs: memoryFs(map),
    hooks: [imports(), bundle({ entry: plan.bundleEntry, dir: 'dist' })],
  })
  const output = result.outputs.find((candidate) => candidate.name === 'bundle')
  const code = output?.files[0]?.code
  if (code === undefined) throw new Error('[demo] 构建没有产出可执行的 JS')
  return { code, htmlDoc: htmlDocOf(result, files) }
}

const loadDemoConfig = async (
  files: readonly DemoFile[],
): Promise<StackSourceConfig | undefined> => {
  const config = files.find((file) => file.name === CONFIG_NAME)
  if (config === undefined) return undefined
  return loadConfigFromSource(config.code, { wasmURL: WASM_URL })
}

const planDemoInputs = (files: readonly DemoFile[], config: StackSourceConfig | undefined) => {
  if (config?.inputs !== undefined) {
    for (const input of config.inputs) {
      if (!hasFile(files, input.path)) {
        throw new Error(`${CONFIG_NAME} 的 inputs 指向不存在的文件：${input.path}`)
      }
    }
    return {
      inputs: config.inputs.map((input) => ({ ...input })),
      bundleEntry: bundleEntryOf(config.inputs),
    }
  }
  if (config?.entry !== undefined) {
    if (!hasFile(files, config.entry)) {
      throw new Error(`${CONFIG_NAME} 的 entry 指向不存在的文件：${config.entry}`)
    }
    return { inputs: [{ name: 'demo', path: config.entry }], bundleEntry: 'demo' }
  }
  return deriveFromDoc(files)
}

const deriveFromDoc = (files: readonly DemoFile[]): DemoPlan => {
  const doc = files.find((file) => file.name === DOC_NAME)
  if (doc === undefined) throw new Error('入口文档不存在：index.html')
  const entry = /<script\b[^>]*\ssrc="([^"]+)"/i.exec(doc.code)?.[1]?.replace(/^\.\//, '')
  if (entry === undefined) throw new Error('index.html 缺少 <script src>——无法确定入口')
  if (!hasFile(files, entry)) {
    throw new Error(`入口文件不存在：${entry}（index.html 的 script src 必须指向工程内文件）`)
  }
  return {
    inputs: [
      { name: 'demo', path: entry },
      { name: 'page', path: DOC_NAME },
    ],
    bundleEntry: 'demo',
  }
}

const bundleEntryOf = (inputs: readonly { name: string; path: string }[]): string => {
  const moduleInput = inputs.find((input) => inputKindOf(input.path) === 'module')
  return (moduleInput ?? inputs[0]).name
}

const hasFile = (files: readonly DemoFile[], path: string): boolean =>
  files.some((file) => file.name === path.replace(/^\.\//, ''))

const htmlDocOf = (result: BuildResult, files: readonly DemoFile[]): string => {
  const dist = result.outputs.find((candidate) => candidate.name === 'default')
  const rewritten = dist?.files.find((file) => file.path === DOC_NAME)?.code
  if (rewritten !== undefined) return rewritten
  const raw = files.find((file) => file.name === DOC_NAME)?.code
  if (raw === undefined) throw new Error('[demo] 构建没有产出入口文档 index.html')
  return raw
}
