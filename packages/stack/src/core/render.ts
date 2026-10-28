import type { StackInputKind } from './config.ts'
import type { RenderArtifact } from './engine-types.ts'
import type { EmittedFile } from './hooks.ts'
import { dirnamePath, relativePath, replaceExtension, toSpecifier } from './pathUtil.ts'

export interface RenderRecord {
  id: string
  pathAnchor: string
  kind: StackInputKind
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

const canonicalPath = (id: string, baseDir: string, kind: StackInputKind): string => {
  const relative = relativePath(baseDir, id)
  return kind === 'module' ? replaceExtension(relative, '.js') : relative
}

export function renderPreserveEsm(input: RenderInput): EmittedFile[] {
  const baseDir = commonDirectory([
    ...input.entryIds,
    ...input.records.map((record) => record.pathAnchor),
  ])
  const targetPaths = new Map<string, string>()
  for (const [from, to] of input.redirects) targetPaths.set(from, to)
  for (const record of input.records) {
    const primary =
      record.artifacts[0]?.path ?? canonicalPath(record.pathAnchor, baseDir, record.kind)
    targetPaths.set(record.id, primary)
    for (const [from, to] of input.redirects) {
      if (to === record.id) targetPaths.set(from, primary)
    }
  }
  const files: EmittedFile[] = []
  for (const record of input.records) {
    for (const artifact of record.artifacts) {
      const artifactPath = artifact.path ?? canonicalPath(record.pathAnchor, baseDir, record.kind)
      files.push({
        path: artifactPath,
        code: rewriteArtifact(artifact, artifactPath, targetPaths, record.kind),
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
  kind: StackInputKind,
): string => {
  const rewrites: { start: number; end: number; specifier: string }[] = []
  for (const ref of artifact.imports) {
    if (ref.id === null) continue
    const targetPath = targetPaths.get(ref.id)
    if (targetPath === undefined) continue
    rewrites.push({
      start: ref.valueStart,
      end: ref.valueEnd,
      specifier: toSpecifier(dirnamePath(artifactPath), targetPath),
    })
  }
  rewrites.sort((left, right) => right.start - left.start)
  let code = artifact.code
  for (const rewrite of rewrites) {
    const replacement = kind === 'html' ? rewrite.specifier : JSON.stringify(rewrite.specifier)
    code = code.slice(0, rewrite.start) + replacement + code.slice(rewrite.end)
  }
  return code
}
