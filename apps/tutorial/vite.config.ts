import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

const ISOLATION_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  server: { headers: ISOLATION_HEADERS },

  preview: {
    allowedHosts: ['.code.idealjs.com'],
    headers: ISOLATION_HEADERS,
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)]),
      ),
    },
  },
})
