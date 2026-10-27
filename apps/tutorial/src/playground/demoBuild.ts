import { build, initEsbuild, loadConfigFromSource, memoryFs } from '@idealjs/stack'
import { bundle, imports } from '@idealjs/stack/builtins'

const WASM_URL = 'esbuild.wasm'
const CONFIG_NAME = 'stack.config.ts'

export interface DemoFile {
  name: string
  code: string
}

export const buildDemo = async (files: readonly DemoFile[], entry: string): Promise<string> => {
  await initEsbuild(WASM_URL)
  const effectiveEntry = await resolveEntry(files, entry)
  const map: Record<string, string> = {}
  for (const file of files) map[file.name] = file.code
  const result = await build({
    inputs: [{ name: 'demo', path: effectiveEntry }],
    fs: memoryFs(map),
    hooks: [imports(), bundle({ entry: 'demo', dir: 'dist' })],
  })
  const output = result.outputs.find((candidate) => candidate.name === 'bundle')
  const code = output?.files[0]?.code
  if (code === undefined) throw new Error('[demo] 构建没有产出可执行的 JS')
  return code
}

const resolveEntry = async (files: readonly DemoFile[], entry: string): Promise<string> => {
  const config = files.find((file) => file.name === CONFIG_NAME)
  if (config === undefined) return entry
  const source = await loadConfigFromSource(config.code, { wasmURL: WASM_URL })
  const configured = source.entry ?? entry
  if (!files.some((file) => file.name === configured)) {
    throw new Error(`${CONFIG_NAME} 的 entry 指向不存在的文件：${configured}`)
  }
  return configured
}
