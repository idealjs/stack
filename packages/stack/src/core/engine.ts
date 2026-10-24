import { transform } from 'esbuild-wasm'
import { OutputChannel } from './channel.ts'
import type { StackConfig, StackFs } from './config.ts'
import { CycleDetector } from './cycle.ts'
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
import { parseModuleImports, parseTopLevelNames } from './parse.ts'
import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
} from './pathUtil.ts'

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
  promise: Promise<FinalModule> | null
  final: FinalModule | null
  artifacts: RenderArtifact[]
  redirect: string | null
}

interface QueueTask {
  id: string
  resolve: (module: FinalModule) => void
  reject: (error: unknown) => void
}

interface CleanedPart {
  code: string
  baseId: string
}

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

const loaderForId = (id: string): 'ts' | 'tsx' | 'js' | 'jsx' => {
  if (id.endsWith('.tsx')) return 'tsx'
  if (id.endsWith('.jsx')) return 'jsx'
  if (id.endsWith('.ts') || id.endsWith('.mts')) return 'ts'
  return 'js'
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
  readonly #loaded = new Map<string, string>()
  readonly #stripped = new Map<string, string>()
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
    this.#resolveContext = { root: this.root }
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

  async resolveEntry(input: { name: string; path: string }): Promise<void> {
    const resolution = await this.resolveDemand(input.path, `${this.root}/`, { entry: true })
    if (resolution.kind === 'external') {
      throw new Error(`[stack] 无法解析入口 "${input.path}"（root=${this.root}）`)
    }
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
        if (result.content !== undefined && !this.#loaded.has(result.id)) {
          this.#loaded.set(result.id, result.content)
        }
        return { kind: 'module', id: result.id }
      }
    }
    if (isRelativeSpecifier(rawSource) || rawSource.startsWith('/')) {
      const base = rawSource.startsWith('/')
        ? rawSource
        : joinPath(dirnamePath(importer), rawSource)
      const id = await this.#probe(moduleCandidates(base))
      if (id !== null) return { kind: 'module', id }
      throw new Error(`[stack] 无法解析导入 "${rawSource}"（来自 ${importer}）`)
    }
    const rootRelative = await this.#probe(moduleCandidates(joinPath(this.root, source)))
    if (rootRelative !== null) return { kind: 'module', id: rootRelative }
    if (options.entry === true || aliased) {
      throw new Error(`[stack] 无法解析导入 "${rawSource}"（来自 ${importer}，root=${this.root}）`)
    }
    return { kind: 'external', specifier: rawSource }
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
      promise: null,
      final: null,
      artifacts: [],
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

  async demandFrom(requester: string, specifiers: string[]): Promise<FinalModule[]> {
    const emitted = new Set<string>()
    const order: FinalModule[] = []
    const walk = async (id: string): Promise<void> => {
      const mod = await this.ensureLifecycle(id)
      for (const ref of mod.imports) {
        if (ref.id === null) continue
        this.detector.addEdge(mod.id, ref.id)
        if (!emitted.has(ref.id)) await walk(ref.id)
      }
      if (!emitted.has(mod.id)) {
        emitted.add(mod.id)
        order.push(mod)
      }
    }
    for (const specifier of specifiers) {
      const resolution = await this.resolveDemand(specifier, requester)
      if (resolution.kind === 'external') continue
      this.detector.addEdge(requester, resolution.id)
      if (!emitted.has(resolution.id)) await walk(resolution.id)
    }
    return order
  }

  async mergeFrom(requester: string, specifiers: string[], name?: string): Promise<FinalModule> {
    const ids: string[] = []
    for (const specifier of specifiers) {
      const resolution = await this.resolveDemand(specifier, requester)
      if (resolution.kind === 'external') {
        throw new Error(`[stack] merge 不能合并 external 说明符："${specifier}"`)
      }
      const target = this.followRedirects(resolution.id)
      if (!ids.includes(target)) ids.push(target)
    }
    if (ids.length === 0) throw new Error('[stack] merge 需要至少一个可解析的模块说明符')
    const mergedId = name ?? `merged:${ids.join('+')}`
    const parts: CleanedPart[] = []
    for (const id of ids) {
      const raw = await this.#loadForLifecycle(id)
      const stripped = await this.#strip(id, raw)
      const cleaned = await this.#removeImportsInto(stripped, id, new Set(ids))
      parts.push({ code: cleaned, baseId: id })
    }
    const collision = this.#topLevelCollision(parts.map((part) => part.code))
    if (collision !== null) {
      throw new Error(
        `[stack] merge 顶层标识符冲突："${collision}"（${mergedId}）——请先重构去重或显式改名`,
      )
    }
    let mergedCode = ''
    const imports: ImportRef[] = []
    const deps: string[] = []
    const resolvedImports: ResolvedArtifactImport[] = []
    for (const part of parts) {
      const offset = mergedCode.length
      for (const parsed of parseModuleImports(part.code)) {
        const resolution = await this.resolveDemand(parsed.source, part.baseId)
        const resolvedId = resolution.kind === 'module' ? resolution.id : null
        resolvedImports.push({
          specifier: parsed.source,
          start: parsed.start + offset,
          end: parsed.end + offset,
          declarationStart: parsed.declarationStart + offset,
          declarationEnd: parsed.declarationEnd + offset,
          resolvedId,
        })
        if (resolvedId !== null && !deps.includes(resolvedId)) deps.push(resolvedId)
        imports.push({ specifier: parsed.source, id: resolvedId })
      }
      mergedCode = `${mergedCode}${part.code}\n`
    }
    const merged: FinalModule = { id: mergedId, code: mergedCode, deps, imports }
    const mergedEntry: ModuleEntry = {
      id: mergedId,
      pathAnchor: ids[0],
      promise: null,
      final: merged,
      artifacts: [{ code: mergedCode, imports: resolvedImports }],
      redirect: null,
    }
    this.#registry.set(mergedId, mergedEntry)
    for (const id of ids) {
      const entry = this.#registry.get(id)
      if (entry !== undefined) {
        entry.final = merged
        entry.redirect = mergedId
      }
      this.#redirects.set(id, mergedId)
    }
    this.detector.contract(ids, mergedId)
    return merged
  }

  lowerContext(moduleId: string, hookName: string): LowerContext {
    return {
      fs: this.readOnlyFs,
      output: (spec) => this.channel.register(spec, hookProducer(hookName)),
      lowerImport: (code) => parseModuleImports(code).map((parsed) => parsed.source),
      demand: (specifiers) => this.demandFrom(moduleId, specifiers),
      merge: (specifiers, name) => this.mergeFrom(moduleId, specifiers, name),
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

  renderRecords(): { id: string; pathAnchor: string; artifacts: RenderArtifact[] }[] {
    const records: { id: string; pathAnchor: string; artifacts: RenderArtifact[] }[] = []
    for (const entry of this.#registry.values()) {
      if (entry.redirect !== null || entry.final === null) continue
      if (entry.artifacts.length === 0) continue
      records.push({ id: entry.id, pathAnchor: entry.pathAnchor, artifacts: entry.artifacts })
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
    const raw = await this.#loadForLifecycle(id)
    const stripped = await this.#strip(id, raw)
    let artifacts: Artifact[] = [{ code: stripped }]
    for (const hook of this.moduleLowerHooks) {
      const ctx = this.lowerContext(id, hook.name)
      const next = await hook.lower(id, artifacts, ctx)
      if (next !== undefined && next !== null) artifacts = [...next]
    }
    const redirectTarget = this.followRedirects(id)
    if (redirectTarget !== id) {
      const merged = this.#registry.get(redirectTarget)
      if (merged !== undefined && merged.final !== null) return merged.final
    }
    const renderArtifacts: RenderArtifact[] = []
    const imports: ImportRef[] = []
    const deps: string[] = []
    for (const artifact of artifacts) {
      const resolved: ResolvedArtifactImport[] = []
      for (const parsed of parseModuleImports(artifact.code)) {
        const resolution = await this.resolveDemand(parsed.source, id)
        const resolvedId = resolution.kind === 'module' ? resolution.id : null
        resolved.push({
          specifier: parsed.source,
          start: parsed.start,
          end: parsed.end,
          declarationStart: parsed.declarationStart,
          declarationEnd: parsed.declarationEnd,
          resolvedId,
        })
        if (resolvedId === null) continue
        imports.push({ specifier: parsed.source, id: resolvedId })
        if (!deps.includes(resolvedId)) deps.push(resolvedId)
        if (!this.#registry.has(this.followRedirects(resolvedId))) {
          await this.ensureLifecycle(resolvedId)
        }
      }
      renderArtifacts.push({ path: artifact.path, code: artifact.code, imports: resolved })
    }
    const final: FinalModule = {
      id,
      code: artifacts.map((artifact) => artifact.code).join('\n'),
      deps,
      imports,
    }
    entry.final = final
    entry.artifacts = renderArtifacts
    return final
  }

  async #probe(candidates: string[]): Promise<string | null> {
    for (const candidate of candidates) {
      let content: string | null | undefined = null
      try {
        content = await this.#loadViaLoader(candidate)
      } catch {
        content = null
      }
      if (typeof content === 'string') {
        if (!this.#loaded.has(candidate)) this.#loaded.set(candidate, content)
        return candidate
      }
    }
    return null
  }

  #loadViaLoader(id: string): string | null | undefined | Promise<string | null | undefined> {
    const loader = this.#config.load
    if (loader !== undefined) return loader({ fs: this.readOnlyFs }, id)
    return this.readOnlyFs.readFile(id)
  }

  async #loadForLifecycle(id: string): Promise<string> {
    const cached = this.#loaded.get(id)
    if (cached !== undefined) return cached
    let content: string | null | undefined
    try {
      content = await this.#loadViaLoader(id)
    } catch {
      throw new Error(`[stack] 无法加载模块：${id}`)
    }
    if (typeof content !== 'string') throw new Error(`[stack] 无法加载模块：${id}`)
    this.#loaded.set(id, content)
    return content
  }

  async #strip(id: string, code: string): Promise<string> {
    const cached = this.#stripped.get(id)
    if (cached !== undefined) return cached
    const result = await transform(code, {
      loader: loaderForId(id),
      format: 'esm',
      target: 'esnext',
    })
    this.#stripped.set(id, result.code)
    return result.code
  }

  async #removeImportsInto(code: string, baseId: string, ids: Set<string>): Promise<string> {
    const parsed = parseModuleImports(code)
    const doomed: { start: number; end: number }[] = []
    for (const entry of parsed) {
      if (entry.declarationStart === entry.start && entry.declarationEnd === entry.end) continue
      const resolution = await this.resolveDemand(entry.source, baseId)
      if (resolution.kind !== 'module') continue
      if (!ids.has(this.followRedirects(resolution.id))) continue
      doomed.push({ start: entry.declarationStart, end: entry.declarationEnd })
    }
    doomed.sort((left, right) => right.start - left.start)
    let cleaned = code
    for (const range of doomed) {
      cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end)
    }
    return cleaned
  }

  #topLevelCollision(parts: string[]): string | null {
    const seen = new Map<string, number>()
    for (const part of parts) {
      for (const name of new Set(parseTopLevelNames(part))) {
        seen.set(name, (seen.get(name) ?? 0) + 1)
      }
    }
    for (const [name, count] of seen) {
      if (count > 1) return name
    }
    return null
  }

  #requireFs(): StackFs {
    const fs = this.#config.fs
    if (fs === undefined) {
      throw new Error('[stack] 需要注入 fs：node 宿主用 nodeFs()，浏览器/测试用 memoryFs()')
    }
    return fs
  }
}
