import { defineConfig, minify } from '@idealjs/stack'

export default defineConfig({
  inputs: [
    { name: 'app', path: 'src/app.ts' },
    { name: 'tool', path: 'src/tool.ts' },
  ],
  dist: 'dist/esm',
  alias: {
    '@/': 'src/',
  },
  hooks: [minify({ dir: 'dist/min' })],
})
