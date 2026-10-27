import { transform } from 'esbuild-wasm'
import { initEsbuild } from './esbuildRuntime.ts'

export interface StackSourceConfig {
  entry?: string
}

export interface LoadConfigSourceOptions {
  wasmURL?: string
}

const DEFINE_CONFIG_STUB = 'const defineConfig = (config) => config;\n'

export const loadConfigFromSource = async (
  code: string,
  options: LoadConfigSourceOptions = {},
): Promise<StackSourceConfig> => {
  await initEsbuild(options.wasmURL)
  const js = (await transform(code, { loader: 'ts', format: 'esm', target: 'esnext' })).code
  const module = await importConfigModule(`${DEFINE_CONFIG_STUB}${js}`)
  const config = (module.default ?? module.config) as StackSourceConfig | undefined
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('[stack] 配置源需要默认导出配置对象——defineConfig(...) 的返回值或纯数据对象')
  }
  return config
}

const importConfigModule = async (js: string): Promise<Record<string, unknown>> => {
  if (typeof window === 'undefined') {
    return import(/* @vite-ignore */ `data:text/javascript,${encodeURIComponent(js)}`)
  }
  const url = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }))
  try {
    return await import(/* @vite-ignore */ url)
  } finally {
    URL.revokeObjectURL(url)
  }
}
