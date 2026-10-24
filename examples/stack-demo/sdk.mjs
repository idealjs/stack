import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { build, defineConfig } from '@idealjs/stack'
import { bundle, imports, minify } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'

const root = process.cwd()
const config = defineConfig({
  inputs: [
    { name: 'page', path: 'src/pages/index.html' },
    { name: 'app', path: 'src/app.ts' },
  ],
  dist: 'dist/sdk',
  alias: { '@/': 'src/' },
  fs: nodeFs(),
  load: async (ctx, id) => ctx.fs.readFile(id),
  hooks: [
    imports(),
    minify({ dir: 'dist/sdk-min' }),
    bundle({ entry: 'app', dir: 'dist/sdk-bundle' }),
  ],
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
