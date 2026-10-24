import { defineConfig, minify } from '@idealjs/stack'

export default defineConfig({
  inputs: { main: 'src/main.ts' },
  dist: 'dist/esm',
  alias: { '@/': 'src/' },
  plugins: [minify({ dir: 'dist/min' })],
})
