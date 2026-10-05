import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// MPA：根目录每个 *.html 是一个入口，对应 src/pages/<name>/main.tsx
const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)])),
    },
  },
})
