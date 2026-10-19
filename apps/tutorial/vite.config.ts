import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

export default defineConfig({
  server: {},
  preview: {
    allowedHosts: ['.code.idealjs.com'],
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
