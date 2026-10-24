import assert from 'node:assert/strict'
import test from 'node:test'
import { CycleDetector, CycleError } from '../src/core/cycle.ts'

test('addEdge 无环图（链与菱形）不误报', () => {
  const detector = new CycleDetector()
  detector.addEdge('a', 'b')
  detector.addEdge('b', 'c')
  detector.addEdge('a', 'c')
  detector.addEdge('c', 'd')
  detector.addEdge('d', 'e')
  assert.equal(detector.reaches('a', 'e'), true)
  assert.equal(detector.reaches('e', 'a'), false)
  assert.equal(detector.reaches('b', 'd'), true)
  assert.throws(() => detector.addEdge('e', 'b'), CycleError)
})

test('先 a→b 后 b→a 报环且 path 为 [a, b, a]', () => {
  const detector = new CycleDetector()
  detector.addEdge('a', 'b')
  try {
    detector.addEdge('b', 'a')
    assert.fail('应抛出 CycleError')
  } catch (error) {
    assert.ok(error instanceof CycleError)
    assert.deepEqual(error.path, ['a', 'b', 'a'])
    assert.match(error.message, /循环依赖/)
    assert.match(error.message, /a → b → a/)
  }
})

test('三节点环 path 保持加边顺序 [a, b, c, a]', () => {
  const detector = new CycleDetector()
  detector.addEdge('a', 'b')
  detector.addEdge('b', 'c')
  try {
    detector.addEdge('c', 'a')
    assert.fail('应抛出 CycleError')
  } catch (error) {
    assert.ok(error instanceof CycleError)
    assert.deepEqual(error.path, ['a', 'b', 'c', 'a'])
  }
})

test('可达性 memo 加速下长链回边仍被检出且重复加边幂等', () => {
  const detector = new CycleDetector()
  const length = 64
  for (let index = 0; index < length; index += 1) {
    detector.addEdge(`n${index}`, `n${index + 1}`)
  }
  assert.equal(detector.reaches('n0', `n${length}`), true)
  assert.equal(detector.reaches(`n${length}`, 'n0'), false)
  assert.doesNotThrow(() => detector.addEdge('n0', 'n32'))
  assert.doesNotThrow(() => detector.addEdge('n0', 'n32'))
  try {
    detector.addEdge(`n${length}`, 'n0')
    assert.fail('应抛出 CycleError')
  } catch (error) {
    assert.ok(error instanceof CycleError)
    assert.equal(error.path[0], 'n0')
    assert.equal(error.path[error.path.length - 1], 'n0')
    assert.equal(error.path.length, length + 2)
  }
})

test('contract 后旧节点查询规范化到新节点', () => {
  const detector = new CycleDetector()
  detector.addEdge('a', 'b')
  detector.addEdge('b', 'c')
  detector.contract(['b', 'c'], 'bc')
  assert.equal(detector.reaches('a', 'b'), true)
  assert.equal(detector.reaches('a', 'bc'), true)
  assert.equal(detector.reaches('b', 'c'), false)
  detector.addEdge('x', 'c')
  assert.equal(detector.reaches('x', 'bc'), true)
  try {
    detector.addEdge('bc', 'x')
    assert.fail('应抛出 CycleError')
  } catch (error) {
    assert.ok(error instanceof CycleError)
    assert.deepEqual(error.path, ['x', 'bc', 'x'])
  }
})

test('contract 重建可达性后经合并节点的环被检出、无环不误报', () => {
  const detector = new CycleDetector()
  detector.addEdge('a', 'b')
  detector.addEdge('b', 'c')
  detector.contract(['b', 'c'], 'bc')
  assert.doesNotThrow(() => detector.addEdge('d', 'a'))
  try {
    detector.addEdge('bc', 'd')
    assert.fail('应抛出 CycleError')
  } catch (error) {
    assert.ok(error instanceof CycleError)
    assert.deepEqual(error.path, ['d', 'a', 'bc', 'd'])
  }
  const diamond = new CycleDetector()
  diamond.addEdge('p', 'q')
  diamond.addEdge('p', 'r')
  diamond.addEdge('q', 's')
  diamond.addEdge('r', 's')
  diamond.contract(['q', 'r'], 'qr')
  assert.doesNotThrow(() => diamond.addEdge('s', 'x'))
  assert.equal(diamond.reaches('p', 'x'), true)
  assert.throws(() => diamond.addEdge('x', 'p'), CycleError)
})

test('自环加边即报环', () => {
  const detector = new CycleDetector()
  try {
    detector.addEdge('a', 'a')
    assert.fail('应抛出 CycleError')
  } catch (error) {
    assert.ok(error instanceof CycleError)
    assert.deepEqual(error.path, ['a', 'a'])
  }
})
