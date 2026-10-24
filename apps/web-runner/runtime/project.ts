import { execute } from './execute'
import { format } from './format'
import { post } from './outbound'
import { type StackSdk, stackSdk } from './sdk'
import type { DemoFile } from './types'

const WASM_URL = '/esbuild.wasm'

let initializing: Promise<void> | null = null

const ensureSdk = async (): Promise<StackSdk> => {
  const sdk = stackSdk()
  initializing ??= sdk.initStack(WASM_URL).catch((error: unknown) => {
    initializing = null
    throw error
  })
  await initializing
  return sdk
}

const applyDefine = (code: string, define: Record<string, string>): string => {
  let result = code
  for (const [key, value] of Object.entries(define)) {
    result = result.replace(new RegExp(`\\b${key}\\b`, 'g'), () => value)
  }
  return result
}

export async function buildDemo(
  files: readonly DemoFile[],
  entry: string,
  define: Record<string, string>,
): Promise<string> {
  const sdk = await ensureSdk()
  const map: Record<string, string> = {}
  for (const file of files) map[file.name] = applyDefine(file.code, define)
  const result = await sdk.build({
    inputs: [{ name: 'demo', path: entry }],
    fs: sdk.memoryFs(map),
    hooks: [sdk.imports(), sdk.bundle({ entry: 'demo', dir: 'dist' })],
  })
  const output = result.outputs.find((candidate) => candidate.name === 'bundle')
  const code = output?.files[0]?.code
  if (code === undefined) throw new Error('[runner] 构建没有产出可执行的 JS')
  return code
}

export async function runProject(
  files: readonly DemoFile[],
  entry: string,
  html: string | undefined,
  define: Record<string, string>,
): Promise<void> {
  try {
    const code = await buildDemo(files, entry, define)
    await execute(code, html)
  } catch (error) {
    post({ type: 'error', text: format(error) })
  }
}
