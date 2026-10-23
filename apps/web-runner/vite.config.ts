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

const inlineRuntimeHtml = (): Plugin => ({
  name: 'inline-runtime-html',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const htmlKey = Object.keys(bundle).find((k) => k.endsWith('.html'))
    if (!htmlKey) return
    const htmlFile = bundle[htmlKey]
    if (htmlFile.type !== 'asset') return
    let source = String(htmlFile.source)
    for (const key of Object.keys(bundle)) {
      const file = bundle[key]
      if (file.type !== 'chunk' || !file.isEntry) continue
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const tag = new RegExp(`<script[^>]*src="[^"]*${escaped}"[^>]*>\\s*</script>`)
      if (!tag.test(source)) continue
      const code = file.code.replace(/<\/script>/g, '<\\/script>')
      source = source.replace(tag, `<script type="module">\n${code}\n</script>`)
      delete bundle[key]
    }
    htmlFile.source = source
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
  build: { outDir: 'dist-runtime' },
  plugins: [serveRuntimeDoc(), inlineRuntimeHtml()],
})
