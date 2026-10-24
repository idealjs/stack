import { bundle, defineConfig, minify } from '@idealjs/stack'
import { nodeFs } from '@idealjs/stack/node'

export default defineConfig({
  inputs: [{ name: 'main', path: 'src/main.ts' }],
  fs: nodeFs(),
  load: async (ctx, id) => ctx.fs.readFile(id),
  hooks: [minify({ dir: 'dist/min' }), bundle({ entry: 'main', dir: 'dist/bundle' })],
})
