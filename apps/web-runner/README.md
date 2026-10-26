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
yarn workspace @stack/web-runner dev:runtime     # stack dev --port 5174：watch 重建 + hono 伺服
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
