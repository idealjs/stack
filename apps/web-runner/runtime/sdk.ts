import type { BuildResult, StackConfig, StackFs, StackHook } from '@idealjs/stack'

export interface StackSdk {
  build(config: StackConfig): Promise<BuildResult>
  bundle(options: { entry: string; dir: string; name?: string }): StackHook
  defineConfig<T extends StackConfig>(config: T): T
  imports(options?: { name?: string }): StackHook
  initStack(wasmURL: string): Promise<void>
  memoryFs(files?: Record<string, string>): StackFs
}

declare global {
  interface Window {
    __stack?: StackSdk
  }
}

export const stackSdk = (): StackSdk => {
  const sdk = window.__stack
  if (sdk === undefined) throw new Error('[runner] stack SDK 未随文档加载')
  return sdk
}
