import type { LoadContext, StackInputKind } from './config.ts'
import type { ParsedImport } from './parse.ts'

export interface EmittedFile {
  path: string
  code: string
}

export interface EmittedOutput {
  readonly name: string
  readonly dir: string
  readonly files: readonly EmittedFile[]
}

export interface BuildResult {
  outputs: EmittedOutput[]
  moduleCount: number
  durationMs: number
}

export interface ImportRef {
  specifier: string
  id: string | null
}

export interface FinalModule {
  id: string
  kind: StackInputKind
  code: string
  deps: string[]
  imports: ImportRef[]
}

export interface ArtifactImport {
  specifier: string
  id: string | null
  valueStart: number
  valueEnd: number
}

export interface Artifact {
  path?: string
  code: string
  imports?: ArtifactImport[]
}

export interface ResolveResult {
  id: string
  content?: string
}

export interface ResolveContext {
  readonly root: string
}

export type ResolveHook = (
  specifier: string,
  importer: string,
  ctx: ResolveContext,
) => ResolveResult | null | undefined | Promise<ResolveResult | null | undefined>

export type Resolution = { kind: 'module'; id: string } | { kind: 'external'; specifier: string }

export interface ReadOnlyFs {
  readFile(path: string): Promise<string>
}

export interface LowerContext {
  fs: ReadOnlyFs
  output: (spec: EmittedOutput) => void
  lowerImport: (code: string) => string[]
  loweringImport: (id: string) => Promise<FinalModule | null>
  loweringBindImport: (ids: string[]) => Promise<void>
}

export type ModuleLowerHook = (
  id: string,
  artifacts: Artifact[],
  ctx: LowerContext,
) => Artifact[] | Promise<Artifact[]>

export interface OutputContext extends LoadContext {
  output: (spec: EmittedOutput) => void
  modules: FinalModule[]
  inputs: { name: string; id: string }[]
}

export type OutputLowerHook = (ctx: OutputContext, output: EmittedOutput) => void | Promise<void>

export type DeriveHook = (ctx: OutputContext) => void | Promise<void>

export interface ModuleHook {
  name: string
  watch?: undefined
  resolve?: ResolveHook
  lower?: ModuleLowerHook
  derive?: DeriveHook
}

export interface WatchHook {
  name: string
  watch: string[]
  resolve?: ResolveHook
  lower?: OutputLowerHook
  derive?: DeriveHook
}

export type StackHook = ModuleHook | WatchHook

export const CORE_PRODUCER = '核心规范产物'

export const hookProducer = (name: string): string => `插件 "${name}"`

export type { LoadContext, ParsedImport }
