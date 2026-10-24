import { defineConfig, minify } from '@idealjs/stack'

export default defineConfig({
  inputs: {
    app: 'src/app.ts',
    tool: 'src/tool.ts',
  },
  dist: 'dist/esm',
  alias: {
    '@/': 'src/',
  },
  plugins: [minify({ dir: 'dist/min' })],
})
