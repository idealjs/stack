import { defineConfig, minify } from '@idealjs/stack'

export default defineConfig({
  inputs: [{ name: 'main', path: 'src/main.ts' }],
  dist: 'dist/esm',
  alias: { '@/': 'src/' },
  plugins: [minify({ dir: 'dist/min' })],
})
