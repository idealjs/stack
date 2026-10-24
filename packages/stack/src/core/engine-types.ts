import type { StackInputKind } from './config.ts'
import type { ArtifactImport, FinalModule } from './hooks.ts'

export interface RenderArtifact {
  path?: string
  code: string
  imports: ArtifactImport[]
}

export interface ModuleEntry {
  id: string
  pathAnchor: string
  kind: StackInputKind
  promise: Promise<FinalModule> | null
  final: FinalModule | null
  artifacts: RenderArtifact[]
  declared: string[]
  redirect: string | null
}

export interface QueueTask {
  id: string
  resolve: (module: FinalModule) => void
  reject: (error: unknown) => void
}
