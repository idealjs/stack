import { transform } from 'esbuild-wasm'
import { initEsbuild } from './esbuildRuntime.ts'

export interface StackSourceInput {
  name: string
  path: string
}

export interface StackSourceConfig {
  inputs?: StackSourceInput[]
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
  return validateStackSourceConfig(config)
}

const validateStackSourceConfig = (config: StackSourceConfig): StackSourceConfig => {
  if (config.inputs === undefined) return config
  if (!Array.isArray(config.inputs) || config.inputs.length === 0) {
    throw new Error('[stack] 配置源的 inputs 需要非空数组')
  }
  config.inputs.forEach((input, index) => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new Error(`[stack] 配置源的 inputs[${index}] 需要 { name, path } 对象`)
    }
    if (typeof input.name !== 'string' || input.name === '') {
      throw new Error(`[stack] 配置源的 inputs[${index}].name 需要非空字符串`)
    }
    if (typeof input.path !== 'string' || input.path === '') {
      throw new Error(`[stack] 配置源的 inputs[${index}].path 需要非空字符串`)
    }
  })
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
