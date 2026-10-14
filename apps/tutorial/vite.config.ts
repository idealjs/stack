import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// MPA：根目录每个 *.html 是一个入口，对应 src/pages/<name>/main.tsx
const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

// WebContainer 依赖 SharedArrayBuffer → 页面必须 crossOriginIsolated：
// COOP+COEP 是浏览器开启跨域隔离的硬前提（生产反代需配同名头，见 README）。
const ISOLATION_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  server: { headers: ISOLATION_HEADERS },
  // 端口域名隧道（<port>.code.idealjs.com）访问用；只放行自有域名，不放开 true 防 DNS rebinding
  preview: {
    allowedHosts: ['.code.idealjs.com'],
    headers: ISOLATION_HEADERS,
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)])),
    },
  },
})
