# Playground 安全模型与持久化 XSS 防范

本文件是 playground 沙箱的安全权威记录。代码零注释（AGENTS.md 规则），这里承载全部
原注释承载的安全论证；改安全相关代码前先读这份。

## 隔离边界（现状）

- iframe 只有 `sandbox="allow-scripts"`。严禁 `allow-same-origin`（把框内文档拉回宿主源，
  DOM 遍历即击穿全部隔离）、`allow-top-navigation`、`allow-popups`、`allow-forms`、
  `allow-modals`——沙箱里的代码只许算与说，不许动宿主。
- 宿主 ↔ 运行时唯一通道是 postMessage。消息显式构造、带版本字段 `{ v: 1, type: ... }`；
  宿主对每条消息双重校验——来源（`event.source` 对上当前 iframe 的 contentWindow）与
  结构（`isRuntimeMessage`），不认识的一律丢弃。
- 运行时文档必须与宿主不同源：`allow-scripts` 沙箱把框内文档剥成 opaque origin（srcdoc
  与跨源 src 皆然），拿不到宿主任何数据、存储全禁（读 `parent.location` 抛 SecurityError
  是自证，ready 消息带 `parentBlocked`）。独立源 dev 为第二端口 5174
  （`vite.runtime.config.ts`），生产为另一域名静态托管；宿主以
  `VITE_PLAYGROUND_RUNTIME_ORIGIN` 指向它。

## 持久化 XSS——存储放宽阶段（allow-same-origin）的头号风险

放宽后运行时源将拥有 IDB/OPFS/localStorage，且浏览器按「顶层站＋框源」分区存储——
**所有用户沙箱共享同一份运行时源存储**。恶意代码因此可以投毒：写入被加工过的数据/代码，
同源的其他项目读取时即被波及（跨项目持久化攻击）。存储相关代码必须遵守三条纪律：

1. **读取即不可信**：任何从存储读出的数据先过结构校验与大小限额，再谈使用——存储内容
   一律按不可信输入对待，绝不因「是我们自己写的」而豁免；
2. **项目命名空间**：虚拟工程以不可猜测 ID 隔离，禁止全局可寻址的平铺键，读写只落
   自己的命名空间；
3. **执行通道唯一**：存储内容永远不进 `eval` / `new Function` / 裸 `import()`——一切代码
   只经运行时的 run 消息 → Blob URL + `import()` 这一条沙箱通道执行，运行时文档永不含
   eval。

### 宿主侧配套不变量（现在就生效）

- **纯文本渲染**：沙箱输出、文件名、一切用户内容在宿主组件永远经 React 文本节点渲染，
  严禁 `dangerouslySetInnerHTML` 与任何 URL/HTML 注入位；
- **文件名白名单**：字母/数字开头，仅 `._-` 与字母数字，≤64 字符；进文件列表与 UI 前
  先校验，扁平工程无目录，路径与注入把戏在源头拒绝。

### 契约看守

`apps/tutorial/e2e/playground-embed.spec.ts` 断言 sandbox 属性、跨源 src、握手自证
（独立源部署＋父窗口访问阻断）；`playground-files.spec.ts` 看守文件操作与白名单；
`playground-config.spec.ts` 看守配置文件（预览编辑、构建加载、非法配置拒绝）。
放宽 allow-same-origin 时同步改写：含 allow-scripts＋allow-same-origin、不含
top-navigation/popups/forms/modals、src 源 ≠ 宿主源。

e2e 栈自包含（playwright webServer 数组）：站点 `yarn build`＋preview 于 4491（构建时
经进程 env 注入 `VITE_PLAYGROUND_RUNTIME_ORIGIN=http://localhost:5175`），运行时
`dev:runtime --port 5175`——与交互 dev 的 5173/5174 互不抢占，跨源契约不再隐式依赖
「机器上恰好在跑的 dev 服务器」。

## 运行时嵌入头（vite.runtime.config.ts）

`COEP: require-corp` ＋ `CORP: cross-origin` ＋ `Cache-Control: no-store`：

- 宿主页若带 `COEP: require-corp`，跨源导航嵌入要求**框内文档自身**带 COEP require-corp
  （仅 CORP 不够），CORP 兜底子资源可嵌入性；缺头浏览器以 `ERR_BLOCKED_BY_RESPONSE`
  拒装（框成 chrome-error 页，协议静默死）；
- 宿主不带 COEP 时这对头无害——无论宿主隔离策略如何，运行时始终可嵌入；
- `no-store` 防 304 沿用客户端旧缓存条目的响应头（文档内容不变 ETag 不变，修头后老
  标签页依旧拿旧头被拒，极难排查）。

教程站的 COOP/COEP 隔离头已移除（WebContainer 路线搁置；esbuild-wasm 不需要
SharedArrayBuffer）。若 WebContainer 路线重启：教程 `vite.config.ts` 加回
server/preview 的 COOP+COEP 头即可，运行时侧已常备，零成本适配。

## 运行时文档「一份原文、两条路」

`playground-runtime/index.html` 零外部依赖：跨源路由 `dev:runtime`（第二端口）直接
serve；srcdoc 路由宿主经 `?raw` 原文注入 iframe。执行核心同为 Blob URL＋动态 `import()`
（`@vite-ignore`：vite dev 的 import-analysis 拒分析 blob 说明符）。生产接缝：
`yarn build:runtime` 产出 `dist-runtime/` 整体托管到另一域名，配
`Access-Control-Allow-Origin: *` ＋ 同款 COEP/CORP 头。

## 文件管理边界

文件列表存宿主内存（React state）。文件名白名单（字母/数字开头，仅 `._-`，≤64 字符）
保证扁平工程、无目录；`esbuild.config.json` 是固定配置位，不可删，保证「运行」永远
有配置可读（删除守卫＋新建重名检查双保险）。

## 构建管线（esbuild-wasm）

「运行」的执行语义是「工程打包产物」：点击运行先在组件侧（`@stack/playground` 包内
`build.ts`）用 esbuild-wasm 把整个工程构建成单份 JS，产物仍只经 run 消息 → Blob URL +
`import()` 唯一通道进沙箱——执行通道唯一纪律不变，运行时文档保持零依赖纯执行器
（不装 wasm、不做转译，「一份原文两条路」原样）。

构建放在组件侧而非沙箱内，理由三条：① srcdoc 退化路不需要运行时源服务器常驻
（沙箱内构建必须先 fetch esbuild 产物，零常驻进程的 e2e 性质随之外失）；② 构建诊断
（配置校验错、esbuild 错误/警告）由宿主直接渲染，协议 v1 零新增消息；③ 宿主侧校验
发生在任何代码进入沙箱之前，拒绝路径零执行成本。

配置文件 `esbuild.config.json` 是声明式 JSON，遵守读取即不可信：解析＋字段白名单
（entry/target/format/minify/define）校验通过后才喂 `esbuild.build`，配置内容永不进
任何求值通道——它不是代码，也不允许变成代码（要可执行配置就得在沙箱里求值再回传，
那条路线被此设计排除）。

本轮明确不支持的边界（构建期直接报错，不静默）：裸说明符导入（react 等外部依赖）、
JSX 语法；相对导入由虚拟 FS 插件解析（扁平工程、可省略扩展名）。

## 入口文档预览（config 的 html 字段）

`html` 字段声明入口文档（如 index.html）：宿主侧 DOMParser 解析该文件、剥掉全部
`<script>` 元素，把 body 注入沙箱文档的 body——用户 HTML 只在沙箱文档内生效，宿主
DOM 接触不到它。剥 script 是「执行通道唯一」在文档侧的延伸：页面里的脚本只许经
esbuild 构建通道进沙箱；内联事件属性（onclick 等）保留——即便触发也仍在沙箱 origin
内执行，出不了框。每轮执行先重置沙箱 body（有则注入、无则清空），每次运行都是全新
文档；html 模式下沙箱 iframe 本体即为预览框（同一个文档同时承担 DOM 渲染与
console/异常回传），非 html 模式保持 0×0 退场。
