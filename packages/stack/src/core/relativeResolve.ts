import type { ReadOnlyFs, StackHook } from './hooks.ts'
import { dirnamePath, isRelativeSpecifier, joinPath, moduleCandidates } from './pathUtil.ts'

export interface RelativeResolveOptions {
  name?: string
}

export function relativeResolve(options: RelativeResolveOptions = {}): StackHook {
  const name = options.name ?? 'fs'

  const resolve = async (
    specifier: string,
    importer: string,
    ctx: { root: string; fs: ReadOnlyFs },
  ): Promise<{ id: string } | null> => {
    if (isRelativeSpecifier(specifier) || specifier.startsWith('/')) {
      const base = specifier.startsWith('/')
        ? specifier
        : joinPath(dirnamePath(importer), specifier)
      const id = await probeFirst(ctx.fs, moduleCandidates(base))
      if (id !== null) return { id }
      throw new Error(`[stack] cannot resolve import "${specifier}" from ${importer}`)
    }
    const rooted = await probeFirst(ctx.fs, moduleCandidates(joinPath(ctx.root, specifier)))
    if (rooted !== null) return { id: rooted }
    return null
  }

  return {
    name: `relative:${name}`,
    resolve,
  }
}

const probeFirst = async (fs: ReadOnlyFs, candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
      await fs.readFile(candidate)
      return candidate
    } catch {}
  }
  return null
}
