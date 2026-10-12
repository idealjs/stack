import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// MPA：根目录每个 *.html 是一个入口，对应 src/pages/<name>/main.tsx（与 design-lab 同构）
const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

export default defineConfig({
  // 端口域名隧道（<port>.code.idealjs.com）访问用；只放行自有域名，不放开 true 防 DNS rebinding
  preview: {
    allowedHosts: ['.code.idealjs.com'],
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)])),
    },
  },
})
