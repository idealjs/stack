import { transform } from 'esbuild-wasm'
import type { StackConfig, StackOutput } from './config.ts'
import { buildModuleGraph, type ModuleGraph, type ModuleInfo } from './graph.ts'
import { dirnamePath, relativePath, replaceExtension, toSpecifier } from './pathUtil.ts'
import { createPluginScheduler } from './plugin.ts'

export interface EmittedFile {
  path: string
  code: string
}

export interface OutputResult {
  dir: string
  minify: boolean
  entryPaths: Record<string, string>
  files: EmittedFile[]
  durationMs: number
}

export interface BuildResult {
  outputs: OutputResult[]
  moduleCount: number
  durationMs: number
}

const commonDirectory = (paths: string[]): string => {
  if (paths.length === 0) return '.'
  const segmentLists = paths.map((path) => dirnamePath(path).split('/'))
  let shared = segmentLists[0]
  for (const segments of segmentLists.slice(1)) {
    let kept = 0
    while (kept < shared.length && kept < segments.length && shared[kept] === segments[kept]) {
      kept += 1
    }
    shared = shared.slice(0, kept)
  }
  return shared.join('/') || '/'
}

const outputPathOf = (id: string, baseDir: string): string =>
  replaceExtension(relativePath(baseDir, id), '.js')

const rewriteImports = (moduleInfo: ModuleInfo, baseDir: string, outputPath: string): string => {
  const rewrites = moduleInfo.imports.flatMap((declaration) => {
    if (declaration.resolvedId === null) return []
    const targetPath = outputPathOf(declaration.resolvedId, baseDir)
    return [
      {
        start: declaration.start,
        end: declaration.end,
        specifier: toSpecifier(dirnamePath(outputPath), targetPath),
      },
    ]
  })
  rewrites.sort((left, right) => right.start - left.start)
  let code = moduleInfo.code
  for (const rewrite of rewrites) {
    code =
      code.slice(0, rewrite.start) + JSON.stringify(rewrite.specifier) + code.slice(rewrite.end)
  }
  return code
}

async function buildOutput(graph: ModuleGraph, output: StackOutput): Promise<OutputResult> {
  const startedAt = Date.now()
  const baseDir = commonDirectory(graph.entries.map((entry) => entry.id))
  const minify = output.minify === true
  const files: EmittedFile[] = []
  for (const moduleInfo of [...graph.modules.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  )) {
    let code = rewriteImports(moduleInfo, baseDir, outputPathOf(moduleInfo.id, baseDir))
    if (minify) {
      const result = await transform(code, {
        loader: 'js',
        format: 'esm',
        target: 'esnext',
        minify: true,
      })
      code = result.code
    }
    files.push({ path: outputPathOf(moduleInfo.id, baseDir), code })
  }
  const entryPaths: Record<string, string> = {}
  for (const entry of graph.entries) {
    entryPaths[entry.name] = outputPathOf(entry.id, baseDir)
  }
  files.sort((left, right) => left.path.localeCompare(right.path))
  return { dir: output.dir, minify, entryPaths, files, durationMs: Date.now() - startedAt }
}

export async function build(config: StackConfig): Promise<BuildResult> {
  const inputNames = Object.keys(config.inputs ?? {})
  if (inputNames.length === 0) throw new Error('[stack] config.inputs 至少需要一个入口')
  if ((config.outputs ?? []).length === 0)
    throw new Error('[stack] config.outputs 至少需要一个输出')
  const startedAt = Date.now()
  const scheduler = createPluginScheduler(config.plugins)
  const graph = await buildModuleGraph(
    { root: config.root ?? '.', inputs: config.inputs, alias: config.alias },
    scheduler,
  )
  const outputs: OutputResult[] = []
  for (const output of config.outputs) {
    outputs.push(await buildOutput(graph, output))
  }
  const result: BuildResult = {
    outputs,
    moduleCount: graph.modules.size,
    durationMs: Date.now() - startedAt,
  }
  await scheduler.buildEnd({ result })
  return result
}
