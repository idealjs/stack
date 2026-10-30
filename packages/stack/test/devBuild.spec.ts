import assert from 'node:assert/strict'
import test from 'node:test'
import type { BuildResult } from '../src/core/hooks.ts'
import { createDevBuildQueue } from '../src/node/devBuild.ts'

interface Deferred {
  promise: Promise<void>
  resolve: () => void
  reject: (error: unknown) => void
}

const deferred = (): Deferred => {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('并发 ensure 合并为一次构建，共享同一结果', async () => {
  let runs = 0
  const gate = deferred()
  const queue = createDevBuildQueue({
    run: async () => {
      runs += 1
      await gate.promise
      return { outputs: [], moduleCount: runs, durationMs: 0 }
    },
  })
  const first = queue.ensure()
  const second = queue.ensure()
  const third = queue.ensure()
  assert.equal(queue.status(), 'building')
  gate.resolve()
  const [a, b, c] = await Promise.all([first, second, third])
  assert.equal(runs, 1)
  assert.equal(a, b)
  assert.equal(b, c)
  assert.equal(queue.status(), 'ready')
})

test('构建完成后再 ensure 命中缓存，不再重跑', async () => {
  let runs = 0
  const results: BuildResult[] = []
  const queue = createDevBuildQueue({
    run: async () => {
      runs += 1
      const result: BuildResult = { outputs: [], moduleCount: runs, durationMs: 0 }
      results.push(result)
      return result
    },
  })
  const first = await queue.ensure()
  const again = await queue.ensure()
  assert.equal(runs, 1)
  assert.equal(again, first)
  assert.equal(again, results[0])
})

test('构建期间到达的 invalidate 触发且仅触发一次链式重建', async () => {
  const gates = [deferred(), deferred()]
  const results: BuildResult[] = []
  const queue = createDevBuildQueue({
    run: async () => {
      const result: BuildResult = { outputs: [], moduleCount: results.length, durationMs: 0 }
      results.push(result)
      await gates[results.length - 1].promise
      return result
    },
  })
  const pending = queue.ensure()
  queue.invalidate()
  gates[0].resolve()
  gates[1].resolve()
  const fresh = await pending
  assert.equal(results.length, 2)
  assert.equal(fresh, results[1])
})

test('invalidate 在无构建时也会在后台自动起构建', async () => {
  let runs = 0
  const queue = createDevBuildQueue({
    run: async () => {
      runs += 1
      return { outputs: [], moduleCount: runs, durationMs: 0 }
    },
  })
  queue.invalidate()
  const result = await queue.ensure()
  assert.equal(runs, 1)
  assert.equal(queue.status(), 'ready')
  assert.equal(result.moduleCount, 1)
})

test('构建失败时 ensure 拒绝并保持失败态，invalidate 后重试成功', async () => {
  let runs = 0
  let fail = true
  const built: BuildResult[] = []
  const failed: unknown[] = []
  const queue = createDevBuildQueue({
    run: async () => {
      runs += 1
      if (fail) throw new Error(`boom-${runs}`)
      const result: BuildResult = { outputs: [], moduleCount: runs, durationMs: 0 }
      built.push(result)
      return result
    },
    onBuilt: (result) => built.push(result),
    onFailed: (error) => failed.push(error),
  })
  await assert.rejects(queue.ensure(), /boom-1/)
  assert.equal(queue.status(), 'failed')
  await assert.rejects(queue.ensure(), /boom-1/)
  assert.equal(runs, 1, '失败态下再 ensure 直接复用失败，不重复构建')
  assert.equal(failed.length, 1)
  assert.equal(built.length, 0)
  fail = false
  queue.invalidate()
  const result = await queue.ensure()
  assert.equal(runs, 2)
  assert.equal(queue.status(), 'ready')
  assert.deepEqual(built.length, 2, 'onBuilt 与 run 返回同源结果各收到一次')
  assert.equal(result, built[1])
})
