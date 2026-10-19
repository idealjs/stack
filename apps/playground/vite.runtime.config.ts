import { defineConfig } from 'vite'

const EMBEDDABLE_HEADERS = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin',

  'Cache-Control': 'no-store',
}
export default defineConfig({
  root: 'playground-runtime',
  server: { port: 5174, strictPort: true, cors: true, headers: EMBEDDABLE_HEADERS },
  preview: { port: 5274, strictPort: true, headers: EMBEDDABLE_HEADERS },
  build: { outDir: 'dist-runtime' },
})
