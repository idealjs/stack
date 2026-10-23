import { existsSync, readFileSync } from 'node:fs'
import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from '../core/pathUtil.ts'
import type { StackPlugin } from '../core/plugin.ts'

export function nodeFsPlugin(root: string): StackPlugin {
  const rootDir = normalizePath(root)
  return {
    name: 'node-fs',
    resolveId(source, importer) {
      const base = source.startsWith('/')
        ? source
        : isRelativeSpecifier(source)
          ? joinPath(dirnamePath(importer), source)
          : joinPath(rootDir, source)
      return (
        moduleCandidates(normalizePath(base)).find((candidate) => existsSync(candidate)) ?? null
      )
    },
    load(id) {
      return existsSync(id) ? readFileSync(id, 'utf8') : null
    },
  }
}
