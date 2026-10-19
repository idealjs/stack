import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// MPA：根目录每个 *.html 是一个入口，对应 src/pages/<name>/main.tsx
const pages = readdirSync(__dirname).filter((f) => f.endsWith('.html'))

// ===== 运行时独立源（宿主侧接缝）=====
// 沙箱运行时文档必须部署在与宿主不同的源上（OPFS 在 opaque origin 下不可用，见
// playground-runtime/index.html 头注释——allow-scripts 沙箱当下把两条路都剥成 opaque，
// 独立源是 OPFS 阶段放宽 allow-same-origin 的前提位）。构建/开发时注入
// VITE_PLAYGROUND_RUNTIME_ORIGIN（如 http://localhost:5174，由 vite.runtime.config.ts 的
// dev server 提供）即指向独立源部署位；缺省不设 → srcdoc 退化路径（零额外进程即可跑通
// 全功能 hello world，两条路同为 opaque、隔离一视同仁）。
// 生产接缝：运行时目录整体部署到另一域名静态托管（yarn build:runtime 出独立产物），
// 宿主以该域名构建：VITE_PLAYGROUND_RUNTIME_ORIGIN=https://<runtime-domain> yarn build。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, f)])),
    },
  },
})
