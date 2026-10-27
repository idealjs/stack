import assert from 'node:assert/strict'
import test from 'node:test'
import { loadConfigFromSource } from '../src/core/loadConfigSource.ts'

test('loadConfigFromSource 解析合法配置源', async () => {
  const config = await loadConfigFromSource(`export default {\n  entry: 'main.ts',\n}\n`)
  assert.deepEqual(config, { entry: 'main.ts' })
})

test('loadConfigFromSource 的 defineConfig 注入生效——配置源不 import 任何东西', async () => {
  const config = await loadConfigFromSource(`export default defineConfig({ entry: 'hello.ts' })\n`)
  assert.deepEqual(config, { entry: 'hello.ts' })
})

test('loadConfigFromSource 剥离 TS 类型语法', async () => {
  const code = `interface DemoConfig {\n  entry: string\n}\nconst config: DemoConfig = { entry: 'main.ts' }\nexport default config\n`
  const config = await loadConfigFromSource(code)
  assert.deepEqual(config, { entry: 'main.ts' })
})

test('loadConfigFromSource 对非对象 default 导出响亮报错', async () => {
  await assert.rejects(
    loadConfigFromSource(`export default 42\n`),
    /\[stack\] 配置源需要默认导出配置对象/,
  )
  await assert.rejects(
    loadConfigFromSource(`export default 'nope'\n`),
    /\[stack\] 配置源需要默认导出配置对象/,
  )
})

test('loadConfigFromSource 解析 inputs 形态——html 入口按扩展名推断 kind 由宿主消费', async () => {
  const config = await loadConfigFromSource(
    `export default {\n  inputs: [{ name: 'page', path: 'index.html' }],\n}\n`,
  )
  assert.deepEqual(config, { inputs: [{ name: 'page', path: 'index.html' }] })
})

test('loadConfigFromSource 的 inputs 与 entry 同时出现时两个字段都如实返回——优先级归宿主', async () => {
  const config = await loadConfigFromSource(
    `export default defineConfig({\n  inputs: [{ name: 'demo', path: 'main.ts' }],\n  entry: 'main.ts',\n})\n`,
  )
  assert.deepEqual(config, {
    inputs: [{ name: 'demo', path: 'main.ts' }],
    entry: 'main.ts',
  })
})

test('loadConfigFromSource 对空 inputs 数组响亮报错', async () => {
  await assert.rejects(
    loadConfigFromSource(`export default { inputs: [] }\n`),
    /inputs 需要非空数组/,
  )
})

test('loadConfigFromSource 对缺 name/path 的 inputs 项响亮报错', async () => {
  await assert.rejects(
    loadConfigFromSource(`export default { inputs: [{ path: 'main.ts' }] }\n`),
    /inputs\[0\]\.name 需要非空字符串/,
  )
  await assert.rejects(
    loadConfigFromSource(`export default { inputs: [{ name: 'demo' }] }\n`),
    /inputs\[0\]\.path 需要非空字符串/,
  )
  await assert.rejects(
    loadConfigFromSource(`export default { inputs: ['main.ts'] }\n`),
    /inputs\[0\] 需要 \{ name, path \} 对象/,
  )
})
