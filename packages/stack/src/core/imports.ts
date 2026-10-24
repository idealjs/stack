import { inputKindOf } from './config.ts'
import { CycleError } from './cycle.ts'
import type { Artifact, ArtifactImport, LowerContext, StackHook } from './hooks.ts'
import { parseModuleImports } from './parse.ts'
import { parseHtmlAssets } from './parseHtml.ts'

export interface ImportsOptions {
  name?: string
}

export function imports(options: ImportsOptions = {}): StackHook {
  const name = options.name ?? 'imports'
  return {
    name: `imports:${name}`,
    lower: async (id, artifacts, ctx) => {
      const kind = inputKindOf(id)
      if (kind === 'css') return artifacts
      const next: Artifact[] = []
      for (const artifact of artifacts) {
        next.push(
          kind === 'html'
            ? await declareHtml(id, artifact, ctx)
            : await declareModule(id, artifact, ctx),
        )
      }
      return next
    },
  }
}

const pull = async (
  id: string,
  ctx: LowerContext,
  specifier: string,
  valueStart: number,
  valueEnd: number,
): Promise<ArtifactImport> => {
  try {
    const final = await ctx.loweringImport(specifier)
    return { specifier, id: final?.id ?? null, valueStart, valueEnd }
  } catch (error) {
    if (!(error instanceof CycleError) || error.edge === null || error.edge.from !== id) throw error
    return { specifier, id: error.edge.to, valueStart, valueEnd }
  }
}

const declareModule = async (
  id: string,
  artifact: Artifact,
  ctx: LowerContext,
): Promise<Artifact> => {
  const refs: ArtifactImport[] = []
  for (const parsed of parseModuleImports(artifact.code)) {
    refs.push(await pull(id, ctx, parsed.source, parsed.start, parsed.end))
  }
  return { ...artifact, imports: refs }
}

const declareHtml = async (
  id: string,
  artifact: Artifact,
  ctx: LowerContext,
): Promise<Artifact> => {
  const refs: ArtifactImport[] = []
  for (const asset of parseHtmlAssets(artifact.code)) {
    refs.push(await pull(id, ctx, asset.specifier, asset.start, asset.end))
  }
  return { ...artifact, imports: refs }
}
