# @stack/web-runner

playground 沙箱运行时——**纯执行器**（无 React 依赖、无构建引擎）。供给层由
[@idealjs/stack](../../packages/stack) 驱动；demo 构建是宿主（tutorial practice
页）的责任：宿主页面用 stack SDK 在浏览器内构建，把产物经 run 消息送进来，本包
只负责执行。沙箱安全模型见 [SECURITY.md](./SECURITY.md)。

## 分工：宿主构建、沙箱执行

- **宿主（apps/tutorial）**：`src/playground/demoBuild.ts` 用 stack SDK 完成 demo
  构建——`memoryFs(工程文件)` ＋ `build({ inputs, hooks: [imports(), bundle()] })`，
  在 5173 页面内跑（esbuild-wasm 由 tutorial vite 中间件同源伺服 `/esbuild.wasm`），
  产出 wrapped 单文件 bundle；入口由 index.html 的 script src 推导、入口与入口文档
  的存在性校验也在宿主。
- **web-runner（本包）**：只执行。run 消息（协议 v1）携带 `{ code, html }`——code 是
  宿主构建产物，html 是入口文档的身体；执行核心 Blob URL ＋ `import()`，console 捕获、
  异常回传、done 不变。沙箱内零构建、零 esbuild-wasm、零子资源请求。

## 构建：stack 单文件 doc

```bash
yarn workspace @stack/web-runner build:runtime   # stack 构建
yarn workspace @stack/web-runner dev:runtime     # stack dev --base /absproxy/5174 --port 5174：watch 重建 + hono 伺服
```

`stack.config.ts`：html 入口 `index.html`（script src `./runtime/main.ts`）＋
hooks `[imports(), inlineScript()]`——imports 声明 runtime 闭包、inlineScript 把
闭包内联为单个 module script，产出自包含 doc。

产物：`dist-runtime/index.html`（自包含单文件 doc，无任何 src= 外链 script、零
子资源；`runtime/` 下的散装 js 是 default 产物的常规留存，index.html 以
default-inline 版本为准，不参与部署）。纯执行器形态下 doc 约 4KB——曾内嵌整个
stack SDK 的 220KB 形态随「构建进沙箱」一起退场。

## 运行引擎（纯执行器）

`listeners.ts` 只认两类入站消息：ping（回 ready）与 run。run 分支取
`{ code, html }` 直接进 `execute.ts`：每轮重置沙箱 body（有 html 注入、无则清空）、
Blob URL ＋ 动态 `import()`、`default.init()` 钩子、console 四级捕获与异常格式化回传、
序号守卫防旧轮消息污染、done 收尾。协议 v1（`types.ts`）。

## tutorial 接缝

`virtual:web-runner-doc`（`apps/tutorial/vite.config.ts` 本地实现）：fs 读本包
`dist-runtime/index.html`（dev 期 `stack --watch` 保持常新，vite watcher 变更即
整页刷新）；文件缺失回退占位 doc 并 console.warn。srcdoc 与跨源 src 双路消费同一份
产物；沙箱对 `/esbuild.wasm` 已无任何请求——wasm 现为宿主页面的同源资源（tutorial
vite dev/preview 中间件伺服，供宿主侧 stack 初始化）。

## 远程访问（环境变量与同域）

三个部署位，各自的环境变量与注意点：

- **本地 dev（默认形态，零额外注入）**：无环境变量要求——tutorial vite `base='/'`；
  教程 `.env.development` 的 `VITE_WEB_RUNNER_ORIGIN=http://localhost:5174`（iframe
  src 指向运行时位）；根 `package.json` 的 dev 脚本并行拉起 tutorial dev（5173）与本包
  `stack dev --base /absproxy/5174 --port 5174`。
- **远程 code-server 同域场景**：教程侧注入 `TUTORIAL_BASE=/absproxy/5173`（vite
  base，经根 dev 脚本**可选**携带——默认不注入，本地用不上；曾用 301 做前缀跳转被
  浏览器永久缓存、撤掉环境后仍阴魂不散，已改 302 且默认不携带）；教程 env
  `VITE_WEB_RUNNER_ORIGIN=https://code.idealjs.com/absproxy/5174`（运行时与宿主同源——
  同源告警如实亮红，隔离只剩 sandbox 一道，与 srcdoc 等强度）。`stack dev --port`
  与 `TUTORIAL_BASE=/absproxy/5173` 的端口数字成对，改一处必须同步另一处。
- **生产**：`VITE_WEB_RUNNER_ORIGIN=https://<runtime-domain>`——运行时独立域静态托管
  `dist-runtime/`，跨源 src 形态（第二道防线完整）。

修改位置：教程侧 env 全部在 `apps/tutorial/.env.development`；`TUTORIAL_BASE` 只经根
dev 脚本注入（vite 无此配置项）。e2e 栈不读这些 env——playwright webServer 构建时经
进程 env 注入 `VITE_WEB_RUNNER_ORIGIN=http://localhost:5175` 并以 `dev:runtime --port
5175` 起运行时位，与交互 dev 的 5173/5174 互不抢占、契约独立。

注意事项：运行时 doc 零子资源后，鉴权链（code-server 的 SameSite=Lax cookie）只影响
doc 导航本身——由父页面发起、cookie 可达；宿主页面的 `/esbuild.wasm` 是同源资源、带
会话 cookie 读取，无跨源问题。安全论证见
[SECURITY.md](./SECURITY.md)「外部访问」节。
