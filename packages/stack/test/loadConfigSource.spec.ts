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
