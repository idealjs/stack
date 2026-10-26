# Web Runner 安全模型与持久化 XSS 防范

本文件是 web-runner 沙箱的安全权威记录。代码零注释（AGENTS.md 规则），这里承载全部
原注释承载的安全论证；改安全相关代码前先读这份。

## 隔离边界（现状）

- iframe 只有 `sandbox="allow-scripts"`。严禁 `allow-same-origin`（把框内文档拉回宿主源，
  DOM 遍历即击穿全部隔离）、`allow-top-navigation`、`allow-popups`、`allow-forms`、
  `allow-modals`——沙箱里的代码只许算与说，不许动宿主。
- 宿主 ↔ 运行时唯一通道是 postMessage。消息显式构造、带版本字段 `{ v: 2, type: ... }`；
  宿主对每条消息双重校验——来源（`event.source` 对上当前 iframe 的 contentWindow）与
  结构（`isRuntimeMessage`），不认识的一律丢弃。
- 运行时文档必须与宿主**特意分开、非同源部署**：iframe 若与宿主同源，框内用户代码一旦
  绕过沙箱即直取宿主 cookie（含登录会话）、DOM 与 storage。隔离是两道防线的纵深——
  第一道 `allow-scripts` 沙箱把框内文档剥成 opaque origin（srcdoc 与跨源 src 皆然，
  拿不到宿主任何数据、存储全禁；读 `parent.location` 抛 SecurityError 是自证，ready
  消息带 `parentBlocked`）；第二道是跨源 src 本身：将来 sandbox 属性若被误删或放宽，
  浏览器同源策略仍把框内文档挡在宿主源之外——同源部署则两道一起丢。独立源 dev 为
  第二端口 5174（`scripts/serve.mjs` 静态服务器），生产为另一域名静态托管；宿主以
  `VITE_WEB_RUNNER_ORIGIN` 指向它。

## 外部访问：code-server 反向代理下的双入口形态

远程经 code.idealjs.com（code-server 反向代理）访问时，教程站有两个入口、运行时一个：

- 教程站·端口子域名：`https://5173.code.idealjs.com`——code-server 端口子域名代理，
  顶层导航，会话/登录跳转正常。**跨源验证的正式形态**：此入口下教程页与运行时不同源。
- 教程站·主域路径：`https://code.idealjs.com/absproxy/5173/`——`/absproxy` 语义为路径
  直通（应用自知前缀），配教程 vite `base`（env `TUTORIAL_BASE`）。**远程开发入口**：
  此入口下教程页与运行时（主域 `/absproxy/5174/`）同源——origin 不含路径，上节的
  第二道防线在该入口不存在，隔离只剩 sandbox 剥源一道（opaque origin 仍成立，框内
  代码依旧拿不到宿主数据）。此入口是为远程开发便利而设，**不是**跨源能力的验证场所；
  验证跨源请走端口子域名入口。
- 沙箱运行时：`https://code.idealjs.com/absproxy/5174/`（src 形态）。运行时文档由
  stack 构建＋inlineScript 内联为自包含单文件（`dist-runtime/index.html`，零工具注入、
  零外置 script），`scripts/serve.mjs` 静态直出——路径匹配/base 处理不存在（文档只认
  根路径），改运行时源文件由 `stack --watch` 重建、刷新即生效。**经 code-server 鉴权链时
  仍须保持文档自包含**：`sandbox="allow-scripts"` 把运行时文档剥成 opaque origin，浏览器
  SameSite 规则下 opaque origin 文档发起的子资源请求不带 SameSite=Lax cookie（code-server
  会话正是 Lax），任何外部子资源必 401；而 iframe 文档导航由父页面发起、cookie 可达。
  **wasm 是自包含边界的唯一例外**：esbuild-wasm 二进制无法内联进文本 doc，运行时初始化时
  fetch 同源 `/esbuild.wasm`——此请求同样受 opaque-origin 无 cookie 约束，在 code-server
  鉴权链的运行时位（absproxy 与端口子域名的 5174）会 401，demo 构建将响亮报错（输出面板
  可见）；不受影响的位：e2e（localhost:5175，无鉴权）、生产（独立域名静态托管，wasm 由
  `build:runtime` 复制进 dist）、srcdoc（wasm 走教程源，见下）。恢复路径：给运行时静态
  服务器挂无鉴权域，或 wasm 以同源匿名可读位部署。
  该入口下运行时与宿主同源（origin 不含路径），同源告警如实亮红，隔离只剩 sandbox
  一道——与 srcdoc 等强度。跨源 src ＋ 子资源形态只在无 cookie 鉴权的运行时位成立：
  e2e（localhost:5175）、生产（独立域名静态托管 `dist-runtime/`）。srcdoc
  （`VITE_WEB_RUNNER_ORIGIN` 置空）保留为兜底——doc 本体零网络，但沙箱内构建仍需
  教程源提供 `/esbuild.wasm`（教程 vite 中间件映射，CORS 全开）。

教程站站内链接一律相对形态（`./xxx.html`）：根部署（本地、子域名、SSG 生产）与前缀
部署（absproxy）双兼容；`e2e/pages.spec.ts` 的 href 选择器同步为相对形态。

配置接缝：`apps/tutorial/.env.development` 的 `VITE_WEB_RUNNER_ORIGIN`（默认
`http://localhost:5174`＝本地 dev 的运行时位；置空 = srcdoc；设远程位 = 跨源 src，仅限
无 cookie 鉴权问题的位）、根 `package.json` dev 脚本只并行拉起 tutorial dev 与 web-runner
的 `stack dev`；教程侧 `TUTORIAL_BASE=/absproxy/5173` 仅为远程 absproxy 场景的**可选
注入**（默认启动指令不携带——教程的 301 重定向会被浏览器永久缓存，撤环境后仍阴魂
不散，已改 302）；运行时静态服务器端口默认 5174（`--port` 覆盖）。
教程站 `allowedHosts` 含 `code.idealjs.com`（代理透传保留 Host）；运行时是自持静态
服务器，无 Host 假设。
e2e 栈（5175）不设这些 env，base 默认 `/`、运行时位构建时注入，契约不受影响。

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
经进程 env 注入 `VITE_WEB_RUNNER_ORIGIN=http://localhost:5175`），运行时
`dev:runtime --port 5175`——与交互 dev 的 5173/5174 互不抢占，跨源契约不再隐式依赖
「机器上恰好在跑的 dev 服务器」。

## 运行时嵌入头（已移除）

曾为运行时文档配 `COEP: require-corp` ＋ `CORP: cross-origin` ＋ `Cache-Control:
no-store`，作为「宿主页将来若开 COEP」的嵌入保险——当前教程站不带 COEP
（WebContainer 路线搁置即移除，esbuild-wasm 不需要 SharedArrayBuffer），这对头无实际
作用，2026-10 移除。**将来回补提示**：若某宿主页启用 `COEP: require-corp`（如重启
WebContainer 路线），跨源嵌入要求框内文档自身也带 COEP require-corp（仅 CORP 不够），
缺头浏览器以 `ERR_BLOCKED_BY_RESPONSE` 拒装（框成 chrome-error 页、协议静默死）——届时
在 `scripts/serve.mjs` 的响应头与生产静态托管处加回同名头即可；
`no-store` 则防 304 沿用旧缓存条目的响应头（修头后老标签页依旧拿旧头被拒）。
serve.mjs 现带 `Cache-Control: no-store`（watch 热更即时可见）。

## 运行时文档「一份原文、两条路」

web-runner 包（`apps/web-runner/`，无 React 依赖）＝纯运行时应用：根 `index.html`
（`<script src="./runtime/main.ts">` 入口标签）＋ `runtime/` 侧枝（`main.ts` 主干两行
引导：装监听→报到；`types.ts` 协议常量与消息类型、`outbound.ts` 出站通道、`format.ts`
值→文本、`execute.ts` 执行核心、`project.ts` demo 构建引擎（内嵌 stack SDK 驱动）、
`sdk.ts` SDK 桥接面、`listeners.ts` 挂接装置集中）。供给层由 stack 承担
（`stack.config.ts`：html 入口＋`sdkEmbed()`/`imports()`/`inlineScript()`）：
imports 声明 runtime 闭包、inlineScript 把闭包内联为单个 module script、sdkEmbed 把
stack SDK 浏览器面（`runtime/sdk-entry.ts` 经 esbuild-wasm 打包，零外部依赖）内联在
runtime 之前——产物 `dist-runtime/index.html` 即自包含单文件 doc（无任何 src= 外链
script），两条路消费同一份产物：

- **src 路（主形态）**：`scripts/serve.mjs`（node:http 零依赖静态服务器）直出
  `dist-runtime/`，`/` → index.html、`/esbuild.wasm` → node_modules 映射（watch 重建
  清掉复制件时的兜底）；`stack --watch` 重建后刷新即生效。自包含 doc 的唯一常规网络
  请求是 iframe 文档导航（父页面发起、cookie 可达）；wasm 例外与鉴权链边界见上节。
- **srcdoc 路（兜底）**：宿主经 tutorial vite 配置内的 virtual module
  （`virtual:web-runner-doc`）fs 读同一份 `dist-runtime/index.html` 赋 `srcDoc`——
  doc 本体零网络（wasm 走教程源中间件）；文件缺失回退占位 doc 并 console.warn。
  stack --watch 重建触发 vite watcher → 失效虚拟模块＋整页刷新。

执行核心同为 Blob URL＋动态 `import()`。

**暂定与后向接缝**：两处字符串操作——sdkEmbed 的入口标签定点替换（无正则、标签缺失
即抛错）、virtual module 的 `export default ${JSON.stringify(...)}`——是「不引重型
依赖」约束下的最小原语，暂定接受。后续方向：HTML 解析为可操作的 AST 数据结构
（parse5 / node-html-parser 一类，树上节点替换取代字符串拼接、virtual module 走正规
代码生成），待运行时文档结构复杂到字符串操作开始失控时再引入；当下引入属超前依赖。
vite 供给层已退役（`vite.config.ts`/`vite-plugin.ts` 删除，本包不再依赖 vite）。

## 文件管理边界

文件列表存宿主内存（React state）。文件名白名单（字母/数字开头，仅 `._-`，≤64 字符）
保证扁平工程、无目录；`esbuild.config.json` 是固定配置位，不可删，保证「运行」永远
有配置可读（删除守卫＋新建重名检查双保险）。

## 构建管线（沙箱内嵌 stack 引擎）

「运行」的执行语义是「工程打包产物」：run 消息（协议 v2）携带 demo **源文件**＋入口＋
define（esbuild.config.json 的 entry/html 字段宿主校验后直传），沙箱内的 runtime 用
**内嵌的 stack SDK**（`runtime/project.ts`）完成构建：`memoryFs(demo files)` →
`build({ inputs, fs, hooks: [imports(), bundle()] })` → 单文件 wrapped bundle → 既有
执行核心（Blob URL + `import()`）——执行通道唯一纪律不变。esbuild-wasm 初始化走
`initStack('/esbuild.wasm')`（wasm 由运行时所在源提供，鉴权链边界见上节）。

宿主仍保留的是**配置校验与拒绝**（发生在任何代码进入沙箱之前，拒绝路径零执行成本）：
解析＋字段白名单（entry/target/format/minify/define）＋入口/入口文档存在性检查；
配置内容永不进任何求值通道——它不是代码，也不允许变成代码。

语义变化如实记录：构建从宿主 esbuild-wasm 虚拟 FS 打包改为沙箱内 stack 引擎
（preserve-ESM＋wrapped 单文件）；config 的 `target`/`format`/`minify` 在 stack 引擎下
失效（保留白名单兼容、不生效）；`define` 降级为**整词文本替换**（标识符边界的正则
近似——字符串与属性名里的同名标识符会被误替换；原 esbuild 语义是构建期表达式替换），
由 runtime 在喂 memoryFs 前应用。构建诊断经既有 error 消息回传（协议零新增消息）。

本轮明确不支持的边界（响亮报错，不静默）：裸说明符导入（stack 判 external，wrapped
bundle 里的原生 import 在 Blob 执行时失败并回传）；相对导入由 stack 内存 FS 解析
（扁平工程、可省略扩展名，alias 不适用）。

## 入口文档预览（config 的 html 字段）

`html` 字段声明入口文档（如 index.html）：宿主侧 DOMParser 解析该文件、剥掉全部
`<script>` 元素，把 body 注入沙箱文档的 body——用户 HTML 只在沙箱文档内生效，宿主
DOM 接触不到它。剥 script 是「执行通道唯一」在文档侧的延伸：页面里的脚本只许经
stack 构建通道进沙箱；内联事件属性（onclick 等）保留——即便触发也仍在沙箱 origin
内执行，出不了框。每轮执行先重置沙箱 body（有则注入、无则清空），每次运行都是全新
文档；html 模式下沙箱 iframe 本体即为预览框（同一个文档同时承担 DOM 渲染与
console/异常回传），非 html 模式保持 0×0 退场。
