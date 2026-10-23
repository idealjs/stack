import { defineConfig, type Plugin } from 'vite'
import { composeRuntimeDoc } from './vite-plugin'

const serveComposedDoc: Plugin = {
  name: 'compose-runtime-doc',
  apply: 'serve',
  transformIndexHtml: {
    order: 'post',
    handler: () => composeRuntimeDoc(),
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
  plugins: [serveComposedDoc],
})
