import { defineConfig, type Plugin } from 'vite'
import { runtimeDoc } from './vite-plugin'

const composeRuntimeDoc: Plugin = {
  name: 'compose-runtime-doc',
  apply: 'serve',
  transformIndexHtml: {
    order: 'post',
    handler: () => runtimeDoc(),
  },
}

export default defineConfig({
  base: process.env.WEB_RUNNER_BASE ?? '/',
  server: {
    port: 5174,
    strictPort: true,
    cors: true,
    allowedHosts: ['5174.code.idealjs.com', 'code.idealjs.com'],
  },
  preview: { port: 5274, strictPort: true },
  plugins: [composeRuntimeDoc],
})
