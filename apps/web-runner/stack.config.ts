import { defineConfig } from '@idealjs/stack'
import { imports, inlineScript } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'
import { sdkEmbed } from './sdk-embed.ts'

export default defineConfig({
  inputs: [{ name: 'runtime', path: 'index.html' }],
  fs: nodeFs(),
  dist: 'dist-runtime',
  hooks: [sdkEmbed(), imports(), inlineScript()],
})
