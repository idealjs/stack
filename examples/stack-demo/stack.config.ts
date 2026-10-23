import { defineConfig } from '@idealjs/stack'

export default defineConfig({
  inputs: {
    app: 'src/app.ts',
    tool: 'src/tool.ts',
  },
  outputs: [{ dir: 'dist/esm' }, { dir: 'dist/min', minify: true }],
  alias: {
    '@/': 'src/',
  },
})
