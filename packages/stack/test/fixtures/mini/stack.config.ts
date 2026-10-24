import { defineConfig } from '@idealjs/stack'
import { minify } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'

export default defineConfig({
  inputs: [{ name: 'main', path: 'src/main.ts' }],
  dist: 'dist/esm',
  alias: { '@/': 'src/' },
  fs: nodeFs(),
  load: async (ctx, id) => ctx.fs.readFile(id),
  hooks: [minify({ dir: 'dist/min' })],
})
