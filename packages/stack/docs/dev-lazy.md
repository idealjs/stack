# dev 懒加载：服务先行，构建后台

`stack dev` 的加载策略：HTTP 服务与 TUI 反馈先行，构建作为后台任务逐步推进，请求按需等待构建结果并被缓存。本文说明机制与取舍。

## 原方案的问题

原 `runDev` 在启动序列里先 `await buildOnce()`（全量构建＋写盘），完成后才 `startDevServer`、才打印横幅。后果：

- TUI 反馈被构建阻塞：项目越大，「敲命令后毫无动静」的窗口越长；
- 服务不可用：构建完成前所有请求直接连接拒绝；
- 无法利用等待时间：浏览器/用户没有渐进信号，只有完成后的瞬间爆发输出。

## 新启动时序

```
runDev (watch 模式)
 ├─ startDevServer ──────── 端口就绪（毫秒级）
 ├─ printDevBanner ──────── 「ready in X ms」＋「后台构建中」
 ├─ queue.invalidate() ──── 后台开始首轮构建（不 await）
 └─ startWatcher ─────────── 文件变更 → queue.invalidate()
```

`ready in X ms` 的语义从「构建完成」改为「服务监听就绪」。构建进展由每次构建完成后的常规 summary 行（`default → dist/esm …构建完成：N 个输入，M 个模块，用时 Xms`）接力反馈。

## 单飞构建队列（devBuild.ts）

`createDevBuildQueue` 是 dev 懒加载的核心原语，三个方法：

- `ensure()`：需要最新构建结果时调用。有缓存且无脏标记 → 立即返回缓存；有在途构建 → **join 同一个在途 promise**（不重复起构建）；否则起一次构建。若等待期间出现脏标记，继续等下一轮，保证拿到的是「当前代码」的产物而非旧轮结果。
- `invalidate()`：标记脏并自动在后台起一轮构建（fire-and-forget）。在途构建期间到达的 invalidate 不产生并发第二轮，只设脏标记——第一轮结束后由下一次 `ensure`/泵入自动链式重建。这就是「处理队列」：单飞（single-flight）＋脏标记（dirty flag），FS 事件风暴由 watcher 的 150ms 防抖先行合并。
- `status()`：idle / building / ready / failed，供观测。

失败语义：构建失败时 `ensure()` 以该错误拒绝，失败态被缓存（重复 `ensure` 不重跑）；下一次 `invalidate()`（文件变更）自动重试。`onBuilt`/`onFailed` 钩子承接 TUI 输出与 live reload 推送。

单测见 `test/devBuild.spec.ts`：并发合并、缓存命中、在途脏标记链式重建恰好一轮、后台自起、失败保持与重试。

## 请求路径

dev server 的 catch-all 在读磁盘之前先询问 `options.serve` 提供者：

1. cli 侧提供者 `await queue.ensure()` 拿最新 `BuildResult`，把所有产出文件铺成 `URL 路径 → 产物` 的内存索引（路径 = 输出目录相对 root 的 POSIX 路径＋文件路径，与写盘布局一致）；
2. 命中 → 直接从内存回包（html 仍注入 live reload 脚本）；
3. 未命中 → 回落读磁盘 `dist`（覆盖 `--asset`、esbuild.wasm 等非构建产出的既有路径），再未命中 → 404；
4. **首次构建未完成**：请求在 `ensure()` 上等待，构建完成后即时返回——首访懒加载；
5. **首次构建失败**：请求得到 500 与错误信息（浏览器可见）；
6. **重建失败但已有上一轮结果**：继续供上一轮产物（Vite 式降级），错误只进 TUI，不推 reload。

缓存失效只有一条路：`invalidate()`。dev 期间 dist 仍照常写盘（行为兼容、便于对照检查），但服务以内存产物为准。

## 与原 watch 行为的合并

原 `startWatcher` 自带 rebuilding/queued 单飞逻辑，现在由队列统一承担：watcher 只负责防抖与忽略段过滤，变更回调就是 `queue.invalidate()`。`stack watch`（无服务）与 `stack dev` 共用同一队列，`--no-watch`（preview 语义）保持急切构建不变。

## 为什么暂缓逐模块懒加载（Vite 式）

引擎侧其实已具备逐模块的全部原语：`DemandEngine` 的注册表就是「在途 promise 去重 ＋ final 缓存」，`#queue/#pump` 就是逐模块处理队列。dev 没有直接走到逐模块服务，卡在两个输出级事实：

1. **watch hook 是输出级整项目变换**。如 tutorial 的 tailwind 编译（全库扫描候选）与 SSG 渲染（`ctx.modules` 全量参与），在「只构建被请求模块」的模型下没有逐模块等价物；首个 css 请求仍会退化为全量构建。
2. **规范产物渲染依赖全量记录集**。`renderPreserveEsm` 的 baseDir/`__shared` 布局由全部 records 计算，逐文件渲染会因后到模块改变已发路径。

演进路径（若未来要做）：dev 专用 URL 映射改为**纯路径函数** `devUrlFor(id)`（root 相对路径，入口集启动时已知，天然稳定），逐模块渲染只重写本模块的 `ArtifactImport` 区间指向 dev URL；bare import 经 `vendor()` 的 resolve/lower 已在引擎内变成内部模块，无需特判；请求粒度的去重/缓存直接落在 `ensureLifecycle` 上。届时 tailwind 类整项目变换需要自己的 dev 期缓存与失效粒度，是插件协议的扩展点，不是 dev server 的内部分支。
