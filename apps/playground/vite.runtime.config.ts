import { defineConfig } from 'vite'

// ===== 运行时独立源（dev 接缝）=====
// 只 serve playground-runtime/ 这个极简目录（零依赖、零构建，见其 index.html 头注释）。
// dev 用第二个 vite 端口（5174）＝与宿主（默认 5173）不同源——运行时文档的真实部署位。
// 注意：沙箱只给 allow-scripts 时，浏览器把框进来的文档剥成 opaque origin（无论 srcdoc
// 还是跨源 src），所以本阶段 ready 上报的 origin 恒为 "null"、OPFS 不可用；独立源是给
// 后续 OPFS 阶段准备的——届时沙箱放宽为 allow-scripts + allow-same-origin（在该独立源上
// 放宽是安全的：文档源是这个独立源，宿主隔离不破），真实 origin 与 OPFS 才拿得到。
// cors: true 是 dev 的硬前提：沙箱文档以 Origin: null 拉取本源的 module script
// （vite dev 会把内联脚本拆成 html-proxy），默认 CORS 规则拒收 Origin: null。
// 生产接缝：`yarn build:runtime` 产出 dist-runtime/，整体静态托管到与宿主站点不同的
// 域名，并配 Access-Control-Allow-Origin: *（无状态运行时文档，放开无害）。
export default defineConfig({
  root: 'playground-runtime',
  server: { port: 5174, strictPort: true, cors: true },
  preview: { port: 5274, strictPort: true },
  build: { outDir: 'dist-runtime' },
})
