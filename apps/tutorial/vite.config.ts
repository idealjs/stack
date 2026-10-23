import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { webRunnerDoc } from '@stack/web-runner/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

const baseSlashRedirect = (): Plugin => ({
  name: 'base-slash-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const base = server.config.base.replace(/\/$/, '')
      const [path, query] = (req.url ?? '').split('?')
      if (base && path === base) {
        res.writeHead(301, { Location: `${base}/${query ? `?${query}` : ''}` })
        res.end()
        return
      }
      next()
    })
  },
})

export default defineConfig({
  base: process.env.TUTORIAL_BASE ?? '/',
  server: {
    allowedHosts: ['5173.code.idealjs.com', 'code.idealjs.com'],
  },
  plugins: [baseSlashRedirect(), webRunnerDoc, react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)]),
      ),
    },
  },
})
