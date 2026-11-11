import type { StackConfig } from './config.ts'
import { withDefaultHooks } from './defaults.ts'
import { DemandEngine } from './engine.ts'
import type { BuildResult } from './hooks.ts'
import { CORE_PRODUCER } from './hooks.ts'
import { DEFAULT_DIST, renderPreserveEsm } from './render.ts'

export type { BuildResult }
export { DEFAULT_DIST }

export async function build(config: StackConfig): Promise<BuildResult> {
  if (config.fs === undefined) {
    throw new Error(
      '[stack] fs is required: node hosts use nodeFs() (@idealjs/stack/node), browser/tests use memoryFs()',
    )
  }
  if ((config.inputs ?? []).length === 0)
    throw new Error('[stack] config.inputs requires at least one entry')
  const startedAt = Date.now()
  const engine = new DemandEngine(withDefaultHooks(config))
  try {
    for (const input of config.inputs) {
      await engine.resolveEntry(input)
    }
  } catch (error) {
    engine.fail(error)
    await engine.waitIdle()
    throw error
  }
  await engine.waitIdle()
  const failure = engine.failure()
  if (failure !== undefined && failure !== null) throw failure
  engine.channel.register(
    {
      name: 'default',
      dir: config.dist ?? DEFAULT_DIST,
      files: renderPreserveEsm({
        records: engine.renderRecords(),
        entryIds: engine.entryIds(),
        redirects: engine.redirects(),
      }),
    },
    CORE_PRODUCER,
  )
  await engine.channel.drain()
  const channelFailure = engine.failure()
  if (channelFailure !== undefined && channelFailure !== null) throw channelFailure
  for (const hook of engine.deriveHooks) {
    await hook.derive(engine.outputContext(hook.name))
    await engine.channel.drain()
    const deriveFailure = engine.failure()
    if (deriveFailure !== undefined && deriveFailure !== null) throw deriveFailure
  }
  engine.channel.seal()
  return {
    outputs: engine.channel.snapshot(),
    moduleCount: engine.moduleCount(),
    durationMs: Date.now() - startedAt,
  }
}
