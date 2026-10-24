import { bundle, defineConfig, minify } from '@idealjs/stack'
import { nodeFs } from '@idealjs/stack/node'

export default defineConfig({
  inputs: [{ name: 'app', path: 'src/app.ts' }],
  dist: 'dist/esm',
  alias: {
    '@/': 'src/',
  },
  fs: nodeFs(),
  load: async (ctx, id) => ctx.fs.readFile(id),
  hooks: [minify({ dir: 'dist/min' }), bundle({ entry: 'app', dir: 'dist/bundle' })],
})
