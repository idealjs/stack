import { defineConfig } from '@idealjs/stack'
import { bundle, imports, minify } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'

export default defineConfig({
  inputs: [
    { name: 'page', path: 'src/pages/index.html' },
    { name: 'app', path: 'src/app.ts' },
  ],
  dist: 'dist/esm',
  alias: {
    '@/': 'src/',
  },
  fs: nodeFs(),
  load: async (ctx, id) => ctx.fs.readFile(id),
  hooks: [imports(), minify({ dir: 'dist/min' }), bundle({ entry: 'app', dir: 'dist/bundle' })],
})
