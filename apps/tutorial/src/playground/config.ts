export const CONFIG_FILE_NAME = 'esbuild.config.json'

export interface PlaygroundBuildConfig {
  entry: string
  html: string | null
  target: string
  format: 'esm' | 'iife'
  minify: boolean
  define: Record<string, string>
}

export const CONFIG_TEMPLATE = `${JSON.stringify(
  {
    entry: 'main.ts',
    target: 'esnext',
    format: 'esm',
    minify: false,
    define: {},
  },
  null,
  2,
)}\n`

const CONFIG_KEYS = ['entry', 'html', 'target', 'format', 'minify', 'define']
const TARGETS = ['esnext', 'es2022', 'es2020', 'es2017', 'es2015']
const FORMATS = ['esm', 'iife']
const DEFINE_KEY_RE = /^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$/

export type ParsedConfig =
  | { ok: true; config: PlaygroundBuildConfig }
  | { ok: false; error: string }

export function parseBuildConfig(raw: string): ParsedConfig {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (err) {
    return {
      ok: false,
      error: `${CONFIG_FILE_NAME} 不是合法 JSON：${err instanceof Error ? err.message : String(err)}`,
    }
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: `${CONFIG_FILE_NAME} 顶层必须是 JSON 对象` }
  }
  const obj = data as Record<string, unknown>
  const unknownKeys = Object.keys(obj).filter((key) => !CONFIG_KEYS.includes(key))
  if (unknownKeys.length > 0) {
    return {
      ok: false,
      error: `配置字段白名单：${CONFIG_KEYS.join('、')}；不认识的字段：${unknownKeys.join('、')}`,
    }
  }
  const errors: string[] = []
  const entry = readEntry(obj, errors)
  const html = readHtml(obj, errors)
  const target = readTarget(obj, errors)
  const format = readFormat(obj, errors)
  const minify = readMinify(obj, errors)
  const define = readDefine(obj, errors)
  if (errors.length > 0) return { ok: false, error: errors.join('；') }
  return { ok: true, config: { entry, html, target, format, minify, define } }
}

function readHtml(obj: Record<string, unknown>, errors: string[]): string | null {
  const value = obj.html
  if (value === undefined) return null
  if (typeof value !== 'string' || value === '') {
    errors.push('html 必须是非空字符串（入口文档的文件名）')
    return null
  }
  return value
}

function readEntry(obj: Record<string, unknown>, errors: string[]): string {
  const value = obj.entry
  if (value === undefined) return 'main.ts'
  if (typeof value !== 'string' || value === '') {
    errors.push('entry 必须是非空字符串（工程内的文件名）')
    return 'main.ts'
  }
  return value
}

function readTarget(obj: Record<string, unknown>, errors: string[]): string {
  const value = obj.target
  if (value === undefined) return 'esnext'
  if (typeof value !== 'string' || !TARGETS.includes(value)) {
    errors.push(`target 只能是：${TARGETS.join('、')}`)
    return 'esnext'
  }
  return value
}

function readFormat(obj: Record<string, unknown>, errors: string[]): 'esm' | 'iife' {
  const value = obj.format
  if (value === undefined) return 'esm'
  if (typeof value !== 'string' || !FORMATS.includes(value)) {
    errors.push(`format 只能是：${FORMATS.join('、')}`)
    return 'esm'
  }
  return value as 'esm' | 'iife'
}

function readMinify(obj: Record<string, unknown>, errors: string[]): boolean {
  const value = obj.minify
  if (value === undefined) return false
  if (typeof value !== 'boolean') {
    errors.push('minify 必须是布尔值')
    return false
  }
  return value
}

function readDefine(obj: Record<string, unknown>, errors: string[]): Record<string, string> {
  const value = obj.define
  if (value === undefined) return {}
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    errors.push('define 必须是对象：键是全局标识符，值是替换进去的代码文本（字符串）')
    return {}
  }
  const out: Record<string, string> = {}
  for (const [key, item] of Object.entries(value)) {
    if (!DEFINE_KEY_RE.test(key)) {
      errors.push(`define 的键不是合法标识符：${key}`)
      continue
    }
    if (typeof item !== 'string') {
      errors.push(`define.${key} 的值必须是字符串`)
      continue
    }
    out[key] = item
  }
  return out
}
