import { defineConfig, type Plugin } from 'vite'
import { runtimeDocCache } from './vite-plugin'

const serveRuntimeDoc = (): Plugin => ({
  name: 'serve-runtime-doc',
  apply: 'serve',
  configureServer(server) {
    const compose = runtimeDocCache()
    server.middlewares.use((req, res, next) => {
      const base = server.config.base.replace(/\/$/, '')
      const roots = new Set(
        base ? ['/', '/index.html', base, `${base}/`, `${base}/index.html`] : ['/', '/index.html'],
      )
      if (!roots.has((req.url ?? '').split('?')[0])) return next()
      compose().then((doc) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(doc)
      }, next)
    })
  },
})

export default defineConfig({
  base: process.env.WEB_RUNNER_BASE ?? '/',
  server: {
    port: 5174,
    strictPort: true,
    cors: true,
    allowedHosts: ['5174.code.idealjs.com', 'code.idealjs.com'],
  },
  preview: { port: 5274, strictPort: true },
  plugins: [serveRuntimeDoc()],
})
