import { defineConfig, type Plugin } from 'vite'
import { composeRuntimeDoc } from './vite-plugin'

const serveComposedDoc: Plugin = {
  name: 'serve-composed-doc',
  apply: 'serve',
  transformIndexHtml: {
    order: 'post',
    handler: () => composeRuntimeDoc(),
  },
}

const emitComposedDoc: Plugin = {
  name: 'emit-composed-doc',
  apply: 'build',
  enforce: 'post',
  async generateBundle(_, bundle) {
    const doc = await composeRuntimeDoc()
    for (const key of Object.keys(bundle)) delete bundle[key]
    this.emitFile({ type: 'asset', fileName: 'index.html', source: doc })
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
  build: { outDir: 'dist-runtime' },
  plugins: [serveComposedDoc, emitComposedDoc],
})
