import type { EmittedFile } from './build.ts'

export interface EmittedOutput {
  name: string
  dir: string
  files: EmittedFile[]
}

export type ResolveIdHook = (
  source: string,
  importer: string,
) => string | null | undefined | Promise<string | null | undefined>

export type LoadHook = (
  id: string,
) => string | null | undefined | Promise<string | null | undefined>

export type TransformHook = (
  id: string,
  code: string,
) => string | null | undefined | Promise<string | null | undefined>

export interface BuildEndContext {
  outputs: readonly EmittedOutput[]
  output: (spec: EmittedOutput) => void
}

export type BuildEndHook = (ctx: BuildEndContext) => void | Promise<void>

export interface StackPlugin {
  name: string
  resolveId?: ResolveIdHook
  load?: LoadHook
  transform?: TransformHook
  buildEnd?: BuildEndHook
}

export const CORE_PRODUCER = '核心规范产物'
export const MODULE_STAGE_ERROR = '只能在 buildEnd 阶段产出'

export interface OutputChannel {
  beginBuildEnd(): void
  seal(): void
  produce(spec: EmittedOutput, producer: string): void
  view(): readonly EmittedOutput[]
  snapshot(): EmittedOutput[]
}

export function createOutputChannel(): OutputChannel {
  const outputs: EmittedOutput[] = []
  const producers: string[] = []
  let stage: 'module' | 'buildEnd' | 'sealed' = 'module'
  return {
    beginBuildEnd() {
      stage = 'buildEnd'
    },
    seal() {
      stage = 'sealed'
    },
    produce(spec, producer) {
      if (stage === 'module') throw new Error(`[stack] ${MODULE_STAGE_ERROR}（当前处于模块阶段）`)
      if (stage === 'sealed') throw new Error(`[stack] 构建会话已结束，${MODULE_STAGE_ERROR}`)
      const index = outputs.findIndex((output) => output.name === spec.name)
      if (index !== -1) {
        throw new Error(
          `[stack] 产出重名 "${spec.name}"：${producers[index]} 已产出同名产出，${producer} 再次产出`,
        )
      }
      outputs.push({ name: spec.name, dir: spec.dir, files: spec.files })
      producers.push(producer)
    },
    view() {
      return outputs
    },
    snapshot() {
      return [...outputs]
    },
  }
}

export function createBuildEndContext(channel: OutputChannel, producer: string): BuildEndContext {
  return {
    outputs: channel.view(),
    output: (spec) => channel.produce(spec, producer),
  }
}

export interface PluginScheduler {
  resolveId(source: string, importer: string): Promise<string | null>
  load(id: string): Promise<string | null>
  transform(id: string, code: string): Promise<string | null>
  buildEnd(channel: OutputChannel): Promise<void>
}

const callFirst = async <T>(
  hooks: T[],
  call: (hook: T) => string | null | undefined | Promise<string | null | undefined>,
): Promise<string | null> => {
  for (const hook of hooks) {
    const value = await call(hook)
    if (value != null) return value
  }
  return null
}

export function createPluginScheduler(plugins: readonly StackPlugin[] = []): PluginScheduler {
  const list = [...plugins]
  return {
    resolveId(source, importer) {
      return callFirst(list, (plugin) => plugin.resolveId?.(source, importer))
    },
    load(id) {
      return callFirst(list, (plugin) => plugin.load?.(id))
    },
    transform(id, code) {
      return callFirst(list, (plugin) => plugin.transform?.(id, code))
    },
    async buildEnd(channel) {
      for (const plugin of list) {
        if (plugin.buildEnd === undefined) continue
        await plugin.buildEnd(createBuildEndContext(channel, `插件 "${plugin.name}"`))
      }
    },
  }
}
