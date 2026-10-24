import type { StackConfig } from './config.ts'
import { buildModuleGraph, type ModuleGraph, type ModuleInfo } from './graph.ts'
import { dirnamePath, relativePath, replaceExtension, toSpecifier } from './pathUtil.ts'
import type { EmittedOutput } from './plugin.ts'
import { CORE_PRODUCER, createOutputChannel, createPluginScheduler } from './plugin.ts'

export interface EmittedFile {
  path: string
  code: string
}

export interface BuildResult {
  outputs: EmittedOutput[]
  moduleCount: number
  durationMs: number
}

export const DEFAULT_DIST = 'dist'

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

function renderGraph(graph: ModuleGraph): EmittedFile[] {
  const baseDir = commonDirectory(graph.entries.map((entry) => entry.id))
  const files: EmittedFile[] = []
  for (const moduleInfo of [...graph.modules.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  )) {
    files.push({
      path: outputPathOf(moduleInfo.id, baseDir),
      code: rewriteImports(moduleInfo, baseDir, outputPathOf(moduleInfo.id, baseDir)),
    })
  }
  files.sort((left, right) => left.path.localeCompare(right.path))
  return files
}

export async function build(config: StackConfig): Promise<BuildResult> {
  if ((config.inputs ?? []).length === 0) throw new Error('[stack] config.inputs 至少需要一个入口')
  const startedAt = Date.now()
  const scheduler = createPluginScheduler(config.plugins)
  const graph = await buildModuleGraph(
    { root: config.root ?? '.', inputs: config.inputs, alias: config.alias },
    scheduler,
  )
  const channel = createOutputChannel()
  channel.beginBuildEnd()
  channel.produce(
    { name: 'default', dir: config.dist ?? DEFAULT_DIST, files: renderGraph(graph) },
    CORE_PRODUCER,
  )
  await scheduler.buildEnd(channel)
  channel.seal()
  return {
    outputs: channel.snapshot(),
    moduleCount: graph.modules.size,
    durationMs: Date.now() - startedAt,
  }
}
