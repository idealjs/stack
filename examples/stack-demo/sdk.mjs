import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { build, defineConfig } from '@stack/stack'
import { nodeFsPlugin } from '@stack/stack/node'

const root = process.cwd()
const config = defineConfig({
  inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
  outputs: [{ dir: 'dist/sdk' }, { dir: 'dist/sdk-min', minify: true }],
  alias: { '@/': 'src/' },
  plugins: [nodeFsPlugin(root)],
})

const result = await build(config)

console.log(`SDK 直调完成：${result.moduleCount} 个模块、${result.outputs.length} 个输出`)
for (const output of result.outputs) {
  console.log(`  ${output.dir}：${output.files.map((file) => file.path).join('、')}`)
}

for (const output of result.outputs) {
  for (const file of output.files) {
    const target = resolve(root, output.dir, file.path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, file.code)
  }
}
