# @stack/web-runner

playground 沙箱运行时（无 React 依赖）。供给层与运行引擎都由
[@idealjs/stack](../../packages/stack) 驱动——本包是 stack 的 dogfooding 现场；
沙箱安全模型见 [SECURITY.md](./SECURITY.md)。

## 构建：stack 单文件 doc

```bash
yarn workspace @stack/web-runner build:runtime   # stack 构建 + esbuild.wasm 复制进产物
yarn workspace @stack/web-runner dev:runtime     # scripts/dev.mjs：stack --watch + 静态服务器（5174）
```

`stack.config.ts`：html 入口 `index.html`（script src `./runtime/main.ts`）＋
hooks `[sdkEmbed(), imports(), inlineScript()]`——imports 声明 runtime 闭包、
inlineScript 把闭包内联为单个 module script，产出自包含 doc；`sdkEmbed()`（本包
`sdk-embed.ts`）用 esbuild-wasm 把 `runtime/sdk-entry.ts`（stack SDK 浏览器面：
build/defineConfig/memoryFs/imports/bundle＋initStack）打包成零外部依赖的单脚本，
内联在 runtime 标签之前——运行时文档内嵌整个 stack SDK，沙箱内可独立构建 demo。

产物：`dist-runtime/index.html`（自包含 doc，无任何 src= 外链 script）＋
`esbuild.wasm`（宿主脚本复制，部署静态托管用；`runtime/` 下的散装 js 是 default
产物的常规留存，index.html 以 default-inline 版本为准，不参与部署）。

## 服务：零依赖静态服务器

`scripts/serve.mjs`（node:http）：serve `dist-runtime`，`/` → index.html，
`/esbuild.wasm` → node_modules 映射（dev 兜底，watch 重建会清掉复制件），
端口默认 5174、`--port` 可覆盖（tutorial e2e 用 5175），CORS 全开（沙箱
opaque origin 拉 wasm 必需）、no-store（watch 热更）。

## 运行引擎（沙箱内 stack）

run 消息（协议 v2）携带 demo 源文件＋入口＋define——runtime 的 `project.ts` 走
内嵌 SDK：`memoryFs(demo files)` → `build({ inputs, fs, hooks: [imports(), bundle()] })`
→ 单文件 wrapped bundle → 既有执行核心（Blob URL + import()、console 捕获、异常
回传、done）不变。esbuild-wasm 初始化 `initStack('/esbuild.wasm')`：wasm 由运行时
所在源提供（dev 静态服务器映射；部署复制件）。define 为整词文本替换（esbuild
define 语义的近似，记录于 SECURITY.md）；config 的 target/format/minify 在 stack
引擎下失效（preserve-ESM 单一形态）。

## tutorial 接缝

`virtual:web-runner-doc`（`apps/tutorial/vite.config.ts` 本地实现）：fs 读本包
`dist-runtime/index.html`（dev 期 `stack --watch` 保持常新，vite watcher 变更即
整页刷新）；文件缺失回退占位 doc 并 console.warn。srcdoc 模式下 wasm 由教程源
提供（tutorial vite 中间件 `/esbuild.wasm`）。
