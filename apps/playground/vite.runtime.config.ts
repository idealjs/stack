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
// COEP+CORP 使本文档在「带 COEP require-corp 的宿主页」下也可嵌入：跨源导航嵌入要求
// 框内文档自身带 COEP require-corp（仅 CORP 不够），CORP 兜底子资源可嵌入性。缺头的
// 宿主 COEP 会以 ERR_BLOCKED_BY_RESPONSE 拒装（框成 chrome-error 页，协议静默死）。
// 宿主不带 COEP 时这对头无害——即无论宿主隔离策略如何，运行时始终可嵌入。
// 生产接缝：`yarn build:runtime` 产出 dist-runtime/，整体静态托管到与宿主站点不同的
// 域名，并配 Access-Control-Allow-Origin: *（无状态运行时文档，放开无害）＋同款头。
const EMBEDDABLE_HEADERS = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  // 文档内容不变则 ETag 不变，304 会沿用客户端旧缓存条目的响应头——修头后老标签页
  // 依旧拿旧头被拒，极难排查；dev 文档直接禁缓存，永拿新鲜头
  'Cache-Control': 'no-store',
}
export default defineConfig({
  root: 'playground-runtime',
  server: { port: 5174, strictPort: true, cors: true, headers: EMBEDDABLE_HEADERS },
  preview: { port: 5274, strictPort: true, headers: EMBEDDABLE_HEADERS },
  build: { outDir: 'dist-runtime' },
})
