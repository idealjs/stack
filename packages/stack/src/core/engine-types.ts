import type { StackInputKind } from './config.ts'
import type { FinalModule } from './hooks.ts'

export interface ResolvedArtifactImport {
  specifier: string
  start: number
  end: number
  declarationStart: number
  declarationEnd: number
  resolvedId: string | null
}

export interface RenderArtifact {
  path?: string
  code: string
  imports: ResolvedArtifactImport[]
}

export interface ModuleEntry {
  id: string
  pathAnchor: string
  kind: StackInputKind
  promise: Promise<FinalModule> | null
  final: FinalModule | null
  artifacts: RenderArtifact[]
  redirect: string | null
}

export interface QueueTask {
  id: string
  resolve: (module: FinalModule) => void
  reject: (error: unknown) => void
}

export interface CleanedPart {
  code: string
  baseId: string
}
