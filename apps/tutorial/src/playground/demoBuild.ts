import { build, memoryFs } from '@idealjs/stack'
import { bundle, imports } from '@idealjs/stack/builtins'
import { initialize } from 'esbuild-wasm'

export interface DemoFile {
  name: string
  code: string
}

let initializing: Promise<void> | null = null

const ensureEsbuild = async (): Promise<void> => {
  initializing ??= initialize({ wasmURL: '/esbuild.wasm', worker: false }).catch(
    (error: unknown) => {
      initializing = null
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`[demo] esbuild-wasm 初始化失败——宿主页需同源伺服 /esbuild.wasm：${detail}`)
    },
  )
  await initializing
}

export const buildDemo = async (files: readonly DemoFile[], entry: string): Promise<string> => {
  await ensureEsbuild()
  const map: Record<string, string> = {}
  for (const file of files) map[file.name] = file.code
  const result = await build({
    inputs: [{ name: 'demo', path: entry }],
    fs: memoryFs(map),
    hooks: [imports(), bundle({ entry: 'demo', dir: 'dist' })],
  })
  const output = result.outputs.find((candidate) => candidate.name === 'bundle')
  const code = output?.files[0]?.code
  if (code === undefined) throw new Error('[demo] 构建没有产出可执行的 JS')
  return code
}
