import { defineConfig } from '@idealjs/stack'
import { imports, vendor } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'

export default defineConfig({
  inputs: [{ name: 'browser', path: 'browser/index.html' }],
  fs: nodeFs(),
  dist: 'dist',
  hooks: [vendor({ entries: ['acorn', 'esbuild-wasm'] }), imports()],
})
