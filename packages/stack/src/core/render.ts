import type { RenderArtifact } from './engine-types.ts'
import type { EmittedFile } from './hooks.ts'
import { dirnamePath, relativePath, replaceExtension, toSpecifier } from './pathUtil.ts'

export interface RenderRecord {
  id: string
  pathAnchor: string
  artifacts: RenderArtifact[]
}

export interface RenderInput {
  records: RenderRecord[]
  entryIds: string[]
  redirects: Map<string, string>
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

const canonicalPath = (id: string, baseDir: string): string =>
  replaceExtension(relativePath(baseDir, id), '.js')

export function renderPreserveEsm(input: RenderInput): EmittedFile[] {
  const baseDir = commonDirectory(input.entryIds)
  const targetPaths = new Map<string, string>()
  for (const [from, to] of input.redirects) targetPaths.set(from, to)
  for (const record of input.records) {
    const primary = record.artifacts[0]?.path ?? canonicalPath(record.pathAnchor, baseDir)
    targetPaths.set(record.id, primary)
    for (const [from, to] of input.redirects) {
      if (to === record.id) targetPaths.set(from, primary)
    }
  }
  const files: EmittedFile[] = []
  for (const record of input.records) {
    for (const artifact of record.artifacts) {
      const artifactPath = artifact.path ?? canonicalPath(record.pathAnchor, baseDir)
      files.push({
        path: artifactPath,
        code: rewriteArtifact(artifact, artifactPath, targetPaths),
      })
    }
  }
  files.sort((left, right) => left.path.localeCompare(right.path))
  return files
}

const rewriteArtifact = (
  artifact: RenderArtifact,
  artifactPath: string,
  targetPaths: Map<string, string>,
): string => {
  const rewrites: { start: number; end: number; specifier: string }[] = []
  for (const resolved of artifact.imports) {
    if (resolved.resolvedId === null) continue
    const targetPath = targetPaths.get(resolved.resolvedId)
    if (targetPath === undefined) continue
    rewrites.push({
      start: resolved.start,
      end: resolved.end,
      specifier: toSpecifier(dirnamePath(artifactPath), targetPath),
    })
  }
  rewrites.sort((left, right) => right.start - left.start)
  let code = artifact.code
  for (const rewrite of rewrites) {
    code =
      code.slice(0, rewrite.start) + JSON.stringify(rewrite.specifier) + code.slice(rewrite.end)
  }
  return code
}
