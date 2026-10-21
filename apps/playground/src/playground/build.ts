import * as esbuild from 'esbuild-wasm'
import type { Message, Plugin } from 'esbuild-wasm'
import wasmURL from 'esbuild-wasm/esbuild.wasm?url'
import type { PlaygroundBuildConfig } from './config'

export interface ProjectFileLike {
  name: string
  code: string
}

export interface BuildProblem {
  level: 'error' | 'warn'
  text: string
}

export interface BuildOutcome {
  ok: boolean
  code: string | null
  html: string | null
  problems: BuildProblem[]
}

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']

let initialized: Promise<void> | null = null

async function ensureEsbuild(): Promise<void> {
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL, worker: false }).catch((err) => {
      initialized = null
      throw err
    })
  }
  return initialized
}

function loaderOf(name: string): esbuild.Loader {
  if (name.endsWith('.tsx')) return 'tsx'
  if (name.endsWith('.ts')) return 'ts'
  if (name.endsWith('.jsx')) return 'jsx'
  if (name.endsWith('.json')) return 'json'
  return 'js'
}

function flattenSpecifier(path: string): string {
  return path.replace(/^\.\//, '').replace(/^(?:\.\.\/)+/, '')
}

function virtualFs(files: readonly ProjectFileLike[]): Plugin {
  const byName = new Map(files.map((f) => [f.name, f.code]))
  return {
    name: 'playground-virtual-fs',
    setup(build) {
      build.onResolve({ filter: /^[./]/ }, (args) => {
        const base = flattenSpecifier(args.path)
        const candidates = [base, ...RESOLVE_EXTENSIONS.map((ext) => base + ext)]
        const found = candidates.find((name) => byName.has(name))
        if (found) return { path: found, namespace: 'virtual' }
        return {
          errors: [
            { text: `工程里没有「${args.path}」——相对导入只解析工程内已有文件（可省略扩展名）` },
          ],
        }
      })
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        if (args.kind === 'entry-point') return { path: args.path, namespace: 'virtual' }
        return { errors: [{ text: `外部依赖暂不支持：${args.path}` }] }
      })
      build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => ({
        contents: byName.get(args.path) ?? '',
        loader: loaderOf(args.path),
        resolveDir: '.',
      }))
    },
  }
}

function describeProblem(message: Message): string {
  const loc = message.location
  return loc ? `${loc.file}:${loc.line} ${message.text}` : message.text
}

function describeValue(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`
  return String(value)
}

function extractHtmlBody(raw: string): string {
  const doc = new DOMParser().parseFromString(raw, 'text/html')
  doc.querySelectorAll('script').forEach((el) => el.remove())
  return doc.body.innerHTML
}

export async function buildProject(
  files: readonly ProjectFileLike[],
  config: PlaygroundBuildConfig,
): Promise<BuildOutcome> {
  if (!files.some((f) => f.name === config.entry)) {
    return {
      ok: false,
      code: null,
      html: null,
      problems: [
        { level: 'error', text: `入口文件不存在：${config.entry}（entry 必须是工程内的文件名）` },
      ],
    }
  }
  let html: string | null = null
  if (config.html !== null) {
    const doc = files.find((f) => f.name === config.html)
    if (!doc) {
      return {
        ok: false,
        code: null,
        html: null,
        problems: [
          { level: 'error', text: `入口文档不存在：${config.html}（html 必须是工程内的文件名）` },
        ],
      }
    }
    html = extractHtmlBody(doc.code)
  }
  try {
    await ensureEsbuild()
  } catch (err) {
    return {
      ok: false,
      code: null,
      html: null,
      problems: [{ level: 'error', text: `esbuild 初始化失败：${describeValue(err)}` }],
    }
  }
  try {
    const result = await esbuild.build({
      entryPoints: [config.entry],
      bundle: true,
      write: false,
      format: config.format,
      target: config.target,
      minify: config.minify,
      define: Object.keys(config.define).length > 0 ? config.define : undefined,
      plugins: [virtualFs(files)],
      logLevel: 'silent',
    })
    const problems: BuildProblem[] = result.warnings.map((m) => ({
      level: 'warn',
      text: describeProblem(m),
    }))
    const js = result.outputFiles?.find((f) => f.path.endsWith('.js')) ?? result.outputFiles?.[0]
    if (!js) {
      return {
        ok: false,
        code: null,
        html: null,
        problems: [...problems, { level: 'error', text: '构建没有产出可执行的 JS' }],
      }
    }
    return { ok: true, code: js.text, html, problems }
  } catch (err) {
    const failure = err as { errors?: Message[]; warnings?: Message[] } | null
    if (failure && Array.isArray(failure.errors)) {
      return {
        ok: false,
        code: null,
        html: null,
        problems: [
          ...(failure.warnings ?? []).map((m) => ({
            level: 'warn' as const,
            text: describeProblem(m),
          })),
          ...failure.errors.map((m) => ({ level: 'error' as const, text: describeProblem(m) })),
        ],
      }
    }
    return {
      ok: false,
      code: null,
      html: null,
      problems: [{ level: 'error', text: describeValue(err) }],
    }
  }
}
