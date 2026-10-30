import { OutputChannel } from './channel.ts'
import type { StackConfig, StackFs, StackInput, StackInputKind } from './config.ts'
import { inputKindOf } from './config.ts'
import { CycleDetector } from './cycle.ts'
import type { ModuleEntry, QueueTask, RenderArtifact } from './engine-types.ts'
import type {
  Artifact,
  DeriveHook,
  FinalModule,
  ImportRef,
  LowerContext,
  ModuleHook,
  ModuleLowerHook,
  OutputContext,
  OutputLowerHook,
  Resolution,
  ResolveContext,
  ResolveHook,
  StackHook,
  WatchHook,
} from './hooks.ts'
import { hookProducer } from './hooks.ts'
import { createLoading } from './loading.ts'
import { parseModuleImports } from './parse.ts'
import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from './pathUtil.ts'
import {
  type ResourceRuntime,
  loweringBindImportFrom as resourcesBindImports,
  loweringImportFrom as resourcesLoweringImport,
} from './resources.ts'

const applyAlias = (
  source: string,
  alias: Record<string, string> | undefined,
): { source: string; aliased: boolean } => {
  if (alias === undefined) return { source, aliased: false }
  for (const [prefix, target] of Object.entries(alias)) {
    if (source === prefix || source.startsWith(prefix)) {
      return { source: `${target}${source.slice(prefix.length)}`, aliased: true }
    }
  }
  return { source, aliased: false }
}

export class DemandEngine {
  readonly detector = new CycleDetector()
  readonly channel: OutputChannel
  readonly entries: { name: string; id: string }[] = []
  readonly root: string
  readonly resolveHooks: (StackHook & { resolve: ResolveHook })[]
  readonly moduleLowerHooks: (ModuleHook & { lower: ModuleLowerHook })[]
  readonly watchHooks: (WatchHook & { lower: OutputLowerHook })[]
  readonly deriveHooks: (StackHook & { derive: DeriveHook })[]
  readonly readOnlyFs: { readFile(path: string): Promise<string> }
  readonly #config: StackConfig
  readonly #registry = new Map<string, ModuleEntry>()
  readonly #redirects = new Map<string, string>()
  readonly #kindOverrides = new Map<string, StackInputKind>()
  readonly #loading: ReturnType<typeof createLoading>
  readonly #runtime: ResourceRuntime
  readonly #queue: QueueTask[] = []
  readonly #idleWaiters: (() => void)[] = []
  readonly #resolveContext: ResolveContext
  #pendingTasks = 0
  #failure: { error: unknown } | null = null

  constructor(config: StackConfig) {
    this.#config = config
    this.root = normalizePath(config.root ?? '.')
    const hooks = config.hooks ?? []
    this.resolveHooks = hooks.filter(
      (hook): hook is StackHook & { resolve: ResolveHook } => hook.resolve !== undefined,
    )
    this.moduleLowerHooks = hooks.filter(
      (hook): hook is ModuleHook & { lower: ModuleLowerHook } =>
        hook.watch === undefined && hook.lower !== undefined,
    )
    this.watchHooks = hooks.filter(
      (hook): hook is WatchHook & { lower: OutputLowerHook } =>
        hook.watch !== undefined && hook.lower !== undefined,
    )
    this.deriveHooks = hooks.filter(
      (hook): hook is StackHook & { derive: DeriveHook } => hook.derive !== undefined,
    )
    this.readOnlyFs = { readFile: (path) => this.#requireFs().readFile(path) }
    this.#loading = createLoading({ fs: this.readOnlyFs, load: this.#config.load })
    this.#runtime = {
      ensureLifecycle: (id) => this.ensureLifecycle(id),
      resolveDemand: (source, importer) => this.resolveDemand(source, importer),
      followRedirects: (id) => this.followRedirects(id),
      detector: this.detector,
      knownModule: (id) => this.#registry.has(id),
      bindModule: (id, into) => this.#bindModule(id, into),
    }
    this.#resolveContext = { root: this.root, fs: this.readOnlyFs }
    this.channel = new OutputChannel({
      watchHooks: this.watchHooks,
      contextFor: (hookName) => this.outputContext(hookName),
      fail: (error) => this.fail(error),
    })
  }

  fail(error: unknown): void {
    if (this.#failure !== null) return
    this.#failure = { error }
    for (const waiter of this.#idleWaiters.splice(0)) waiter()
  }

  failure(): unknown {
    return this.#failure?.error
  }

  async resolveEntry(input: StackInput): Promise<void> {
    const resolution = await this.resolveDemand(input.path, `${this.root}/`, { entry: true })
    if (resolution.kind === 'external') {
      throw new Error(`[stack] 无法解析入口 "${input.path}"（root=${this.root}）`)
    }
    this.#kindOverrides.set(resolution.id, inputKindOf(input.path, input.type))
    this.entries.push({ name: input.name, id: resolution.id })
    await this.ensureLifecycle(resolution.id)
  }

  async resolveDemand(
    rawSource: string,
    importer: string,
    options: { entry?: boolean } = {},
  ): Promise<Resolution> {
    const { source, aliased } = applyAlias(rawSource, this.#config.alias)
    for (const hook of this.resolveHooks) {
      const result = await hook.resolve(source, importer, this.#resolveContext)
      if (result != null) {
        if (result.content !== undefined) this.#loading.seed(result.id, result.content)
        return { kind: 'module', id: result.id }
      }
    }
    if (isRelativeSpecifier(rawSource) || rawSource.startsWith('/')) {
      const base = rawSource.startsWith('/')
        ? rawSource
        : joinPath(dirnamePath(importer), rawSource)
      const id = await this.#loading.probe(moduleCandidates(base))
      if (id !== null) return { kind: 'module', id }
      throw new Error(`[stack] 无法解析导入 "${rawSource}"（来自 ${importer}）`)
    }
    const rootRelative = await this.#loading.probe(moduleCandidates(joinPath(this.root, source)))
    if (rootRelative !== null) return { kind: 'module', id: rootRelative }
    if (options.entry === true || aliased) {
      throw new Error(`[stack] 无法解析导入 "${rawSource}"（来自 ${importer}，root=${this.root}）`)
    }
    return { kind: 'external', specifier: rawSource }
  }

  kindOf(id: string): StackInputKind {
    return this.#kindOverrides.get(id) ?? inputKindOf(id)
  }

  ensureLifecycle(id: string): Promise<FinalModule> {
    const target = this.followRedirects(id)
    const existing = this.#registry.get(target)
    if (existing !== undefined) {
      if (existing.final !== null) return Promise.resolve(existing.final)
      if (existing.promise !== null) return existing.promise
      return this.#beginLifecycle(existing)
    }
    const created: ModuleEntry = {
      id: target,
      pathAnchor: target,
      kind: this.kindOf(target),
      promise: null,
      final: null,
      artifacts: [],
      declared: [],
      redirect: null,
    }
    this.#registry.set(target, created)
    return this.#beginLifecycle(created)
  }

  followRedirects(id: string): string {
    let current = id
    for (let step = 0; step < this.#redirects.size + 1; step += 1) {
      const next = this.#redirects.get(current)
      if (next === undefined) return current
      current = next
    }
    return current
  }

  async loweringImport(moduleId: string, id: string): Promise<FinalModule | null> {
    const final = await resourcesLoweringImport(this.#runtime, moduleId, id)
    if (final === null) return null
    const entry = this.#registry.get(this.followRedirects(moduleId))
    if (entry !== undefined && !entry.declared.includes(final.id)) {
      entry.declared.push(final.id)
    }
    return final
  }

  loweringBindImport(moduleId: string, ids: string[]): Promise<void> {
    return resourcesBindImports(this.#runtime, moduleId, ids)
  }

  lowerContext(moduleId: string, hookName: string): LowerContext {
    return {
      fs: this.readOnlyFs,
      output: (spec) => this.channel.register(spec, hookProducer(hookName)),
      lowerImport: (code) => parseModuleImports(code).map((parsed) => parsed.source),
      loweringImport: (id) => this.loweringImport(moduleId, id),
      loweringBindImport: (ids) => this.loweringBindImport(moduleId, ids),
    }
  }

  outputContext(hookName: string): OutputContext {
    return {
      fs: this.readOnlyFs,
      output: (spec) => this.channel.register(spec, hookProducer(hookName)),
      modules: this.finalModules(),
      inputs: this.entries.map((entry) => ({ ...entry })),
    }
  }

  finalModules(): FinalModule[] {
    const seen = new Set<FinalModule>()
    const modules: FinalModule[] = []
    for (const entry of this.#registry.values()) {
      if (entry.redirect !== null || entry.final === null) continue
      if (seen.has(entry.final)) continue
      seen.add(entry.final)
      modules.push(entry.final)
    }
    return modules
  }

  moduleCount(): number {
    return this.finalModules().length
  }

  renderRecords(): {
    id: string
    pathAnchor: string
    kind: StackInputKind
    artifacts: RenderArtifact[]
  }[] {
    const records: {
      id: string
      pathAnchor: string
      kind: StackInputKind
      artifacts: RenderArtifact[]
    }[] = []
    for (const entry of this.#registry.values()) {
      if (entry.redirect !== null || entry.final === null) continue
      if (entry.artifacts.length === 0) continue
      records.push({
        id: entry.id,
        pathAnchor: entry.pathAnchor,
        kind: entry.kind,
        artifacts: entry.artifacts,
      })
    }
    return records
  }

  redirects(): Map<string, string> {
    return new Map(this.#redirects)
  }

  entryIds(): string[] {
    return this.entries.map((entry) => entry.id)
  }

  async waitIdle(): Promise<void> {
    if (this.#failure !== null) return
    if (this.#pendingTasks === 0 && this.#queue.length === 0) return
    await new Promise<void>((resolve) => {
      this.#idleWaiters.push(resolve)
    })
  }

  async #beginLifecycle(entry: ModuleEntry): Promise<FinalModule> {
    const promise = new Promise<FinalModule>((resolve, reject) => {
      this.#queue.push({ id: entry.id, resolve, reject })
    })
    promise.catch(() => {})
    entry.promise = promise
    this.#pump()
    return promise
  }

  #pump(): void {
    for (;;) {
      const task = this.#queue.shift()
      if (task === undefined) break
      this.#pendingTasks += 1
      void this.#runLifecycle(task.id)
        .then(
          (module) => task.resolve(module),
          (error) => {
            this.fail(error)
            task.reject(error)
          },
        )
        .finally(() => {
          this.#pendingTasks -= 1
          if (this.#pendingTasks === 0 && this.#queue.length === 0) {
            for (const waiter of this.#idleWaiters.splice(0)) waiter()
          }
        })
    }
  }

  async #runLifecycle(id: string): Promise<FinalModule> {
    const entry = this.#registry.get(id)
    if (entry === undefined) throw new Error(`[stack] 内部错误：模块未注册：${id}`)
    if (entry.final !== null) return entry.final
    const kind = entry.kind
    const raw = await this.#loading.loadForLifecycle(id)
    const stripped = await this.#loading.strip(id, raw, kind)
    let artifacts: Artifact[] = [{ code: stripped }]
    for (const hook of this.moduleLowerHooks) {
      const ctx = this.lowerContext(id, hook.name)
      const next = await hook.lower(id, artifacts, ctx)
      if (next !== undefined && next !== null) artifacts = [...next]
    }
    const redirectTarget = this.followRedirects(id)
    if (redirectTarget !== id) {
      const bound = this.#registry.get(redirectTarget)
      if (bound !== undefined && bound.final !== null) return bound.final
    }
    const renderArtifacts: RenderArtifact[] = artifacts.map((artifact) => ({
      path: artifact.path,
      code: artifact.code,
      imports: artifact.imports ?? [],
    }))
    const imports: ImportRef[] = []
    const deps: string[] = []
    for (const artifact of renderArtifacts) {
      for (const ref of artifact.imports) {
        if (!imports.some((existing) => existing.specifier === ref.specifier)) {
          imports.push({ specifier: ref.specifier, id: ref.id })
        }
        if (ref.id !== null && !deps.includes(ref.id)) deps.push(ref.id)
      }
    }
    for (const target of entry.declared) {
      const normalized = this.followRedirects(target)
      if (normalized !== id && !deps.includes(normalized)) deps.push(normalized)
    }
    const final: FinalModule = {
      id,
      kind,
      code: artifacts.map((artifact) => artifact.code).join('\n'),
      deps,
      imports,
    }
    entry.final = final
    entry.artifacts = renderArtifacts
    return final
  }

  #bindModule(id: string, into: string): void {
    const entry = this.#registry.get(id)
    if (entry !== undefined) entry.redirect = into
    this.#redirects.set(id, into)
  }

  #requireFs(): StackFs {
    const fs = this.#config.fs
    if (fs === undefined) {
      throw new Error('[stack] 需要注入 fs：node 宿主用 nodeFs()，浏览器/测试用 memoryFs()')
    }
    return fs
  }
}
