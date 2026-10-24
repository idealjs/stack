import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { build, defineConfig, minify } from '@idealjs/stack'
import { nodeHooks } from '@idealjs/stack/node'

const root = process.cwd()
const config = defineConfig({
  inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
  dist: 'dist/sdk',
  alias: { '@/': 'src/' },
  hooks: [nodeHooks(root), minify({ dir: 'dist/sdk-min' })],
})

const result = await build(config)

console.log(`SDK 直调完成：${result.moduleCount} 个模块、${result.outputs.length} 份产出`)
for (const output of result.outputs) {
  console.log(
    `  ${output.name} → ${output.dir}：${output.files.map((file) => file.path).join('、')}`,
  )
}

for (const output of result.outputs) {
  for (const file of output.files) {
    const target = resolve(root, output.dir, file.path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, file.code)
  }
}
