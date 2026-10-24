import type { EmittedOutput, OutputContext, OutputLowerHook, WatchHook } from './hooks.ts'

export interface OutputChannelOptions {
  watchHooks: (WatchHook & { lower: OutputLowerHook })[]
  contextFor: (hookName: string) => OutputContext
  fail: (error: unknown) => void
}

export class OutputChannel {
  readonly #watchHooks: (WatchHook & { lower: OutputLowerHook })[]
  readonly #contextFor: (hookName: string) => OutputContext
  readonly #fail: (error: unknown) => void
  readonly #outputs: EmittedOutput[] = []
  readonly #producers: string[] = []
  readonly #jobs: EmittedOutput[] = []
  readonly #idleWaiters: (() => void)[] = []
  #dispatching = false
  #sealed = false

  constructor(options: OutputChannelOptions) {
    this.#watchHooks = options.watchHooks
    this.#contextFor = options.contextFor
    this.#fail = options.fail
  }

  get sealed(): boolean {
    return this.#sealed
  }

  register(spec: EmittedOutput, producer: string): void {
    if (this.#sealed) {
      throw new Error(`[stack] 构建会话已结束（seal 已执行），不能再登记产出：${producer}`)
    }
    const index = this.#outputs.findIndex((output) => output.name === spec.name)
    if (index !== -1) {
      throw new Error(
        `[stack] 产出重名 "${spec.name}"：${this.#producers[index]} 已产出同名产出，${producer} 再次产出——修正前人产出的唯一合法形式是登记新产出`,
      )
    }
    const output: EmittedOutput = Object.freeze({
      name: spec.name,
      dir: spec.dir,
      files: Object.freeze(spec.files.map((file) => Object.freeze({ ...file }))),
    })
    this.#outputs.push(output)
    this.#producers.push(producer)
    this.#jobs.push(output)
    this.#kick()
  }

  view(): readonly EmittedOutput[] {
    return this.#outputs
  }

  snapshot(): EmittedOutput[] {
    return [...this.#outputs]
  }

  async drain(): Promise<void> {
    while (this.#dispatching || this.#jobs.length > 0) {
      await new Promise<void>((resolve) => {
        this.#idleWaiters.push(resolve)
      })
    }
  }

  seal(): void {
    this.#sealed = true
  }

  #kick(): void {
    if (this.#dispatching) return
    this.#dispatching = true
    void this.#run()
  }

  async #run(): Promise<void> {
    try {
      for (;;) {
        const job = this.#jobs.shift()
        if (job === undefined) break
        for (const hook of this.#watchHooks) {
          if (!hook.watch.includes(job.name)) continue
          try {
            await hook.lower(this.#contextFor(hook.name), job)
          } catch (error) {
            this.#fail(error)
          }
        }
      }
    } finally {
      this.#dispatching = false
      if (this.#jobs.length > 0) {
        this.#kick()
      } else {
        for (const waiter of this.#idleWaiters.splice(0)) waiter()
      }
    }
  }
}
