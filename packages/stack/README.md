# @idealjs/stack

对标 vite/rollup 的 preserve-ESM 构建工具。MVP 阶段做一件事：**静态解析模块图，一次构建产出规范 ESM 产物，衍生产物经插件在唯一产出通道追加**，不拼接 bundle。

## 产品定位

- **CLI 是 SDK 的薄壳**：包主导出（`.`）提供 `build(config): Promise<BuildResult>` 与全部类型，CLI（`bin/stack`）只是「读配置 → 组装 node 插件 → 调 build → 写盘打印」的宿主之一。程序化调用与 CLI 调用走完全同一条链路。
- **核心是 web standard 的**：`src/core/` 与 SDK 入口零 `node:` 导入（有测试断言）。文件读写、路径解析全部经插件钩子注入——rollup 的「核心不碰 fs」模式。node 侧能力（`nodeFsPlugin`、`runCLI`）在 `./node` 子路径导出下，浏览器宿主不得引入。
- **静态解析而非 import hook**：用 acorn 从 `Program.body` 收集静态 import/export 说明符与动态 import 字符串字面量构建依赖图，不做运行时拦截。确定性更强、无启动成本，代价是动态拼接的说明符不可见（MVP 边界）。
- **产出单通道**：输入定义构建什么；产物由唯一产出通道定义——核心先产出 `default` 规范产物，插件在 buildEnd 经 `ctx.output` 追加衍生产物。rollup 的 output 配置＋插件 emitFile 双轨制就此收敛为单轨。

## 配置模型

```ts
import { defineConfig, minify } from '@idealjs/stack'

export default defineConfig({
  root: '.',                            // 可选，默认 '.'
  inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
  dist: 'dist/esm',                     // 可选，规范产物落位目录，默认 'dist'
  alias: { '@/': 'src/' },              // 前缀替换，target 是 root 相对路径
  plugins: [minify({ dir: 'dist/min' })],
})
```

alias 语义：source 命中前缀（或整串等于 key）即替换为 target + 剩余部分，结果按 root 相对路径进入 resolveId 链。

## 产出模型（单通道）

- 构建会话持有唯一产出通道；核心渲染完规范产物后，**经与插件完全相同的 API** 产出第一份 `{ name: 'default', dir: config.dist ?? 'dist', files }`——核心不是特权产出者，只是第一个调用方。
- `buildEnd(ctx)` 是唯一产出阶段：`ctx.outputs` 为已缓存产出的只读视图（核心 default＋先序插件的产出），`ctx.output({ name, dir, files })` 追加衍生产物。
- 产出重名即抛错，错误信息带两个来源（先产出方与再次产出方）；模块阶段（resolveId/load/transform）拿不到产出 API，捕获越期调用同样被拒——rollup 双轨怪味（output 配置驱动渲染＋emitFile 侧通道、钩子分裂为每输出/每构建两族）的根源被协议层面封死。
- `BuildResult.outputs: EmittedOutput[]` 按产出顺序排列，交宿主写盘；核心不写盘。
- **minify 内置插件是范本**：多份输出的「乘法」从配置运算子（rollup/vite 的 outputs 数组）变成插件组合——`minify({ from?, name?, dir })` 读 `ctx.outputs` 里 `name === from`（默认 `'default'`）的产出，对 .js 文件 esbuild 压缩后产出 `{ name: name ?? 'min', dir }`；from 不存在即抛错。任意衍生产物（min/cjs 壳/manifest/报告）皆循此道。

## 钩子协议

```ts
interface StackPlugin {
  name: string
  resolveId?(source, importer): string | null   // source → 模块 id
  load?(id): string | null                        // id → 源码
  transform?(id, code): string | null             // 转译链
  buildEnd?(ctx): void                            // ctx.outputs 只读视图＋ctx.output 唯一产出 API
}
```

- 调度语义：**链式 first-non-null**——按 plugins 声明顺序依次调用，第一个返回非 null 的结果生效；buildEnd 按声明顺序串行执行，每个插件看到「default＋先序插件」的产出，也以自己的名字为产出归属。
- **异步纪律**：四个钩子一律可返回 `T | Promise<T>`，调度器顺序 `await`、**绝不并行**——同一构建的钩子调用序恒定；buildEnd「只看到排在前面的产出」的不变量依赖顺序性。`ctx.output()` 本身是同步 void：异步的是登记之前的加工（await 加工完成再登记，登记动作立即入缓存）。这由宿主现实倒逼：esbuild-wasm 的 JS API 只有异步形态，浏览器文件读取（fetch/OPFS）天然返回 Promise——协议不支持 async 钩子，浏览器宿主就停在纸面。
- id 契约：resolveId 返回的 id 应是 POSIX 规范化路径形态（node 宿主为绝对路径，内存/浏览器宿主可为任意稳定字符串）。
- 解析失败规则：相对说明符、alias 命中、绝对路径解析失败即抛错；裸说明符（npm 包名）解析失败视为 external，产物原样保留。
- 转译管线：load → 用户 transform 链 → 核心 esbuild-wasm 按 id 扩展名剥类型（ts/tsx/jsx）→ acorn 收集说明符。

## 产物布局（preserve-ESM）

- 以全部入口 id 的公共祖先目录为基，每模块按相对结构落位，扩展名 `.ts/.tsx → .js`。
- import/export 说明符按新位置重写为相对路径（含动态 import 字符串字面量），external 说明符不动。
- 衍生产物（如 minify）在重写之后的产物上加工（esbuild 不改写 import 字符串，重写结果安全）。
- `EmittedOutput.files` 内 `{ path, code }` 的 path 相对该产出自己的 dir。

## CLI

```bash
stack [--config stack.config.ts] [--watch]
```

摘要按产出顺序逐行打印 `name → dir（N 个文件，大小）`。`--watch` 用 `fs.watch` 递归监听（忽略 node_modules/dist/.git），150ms 防抖全量重建；配置文件本身的热重载不在 MVP 内（改配置需重启）。

## 浏览器路线

核心与 SDK 入口只依赖 acorn 与 esbuild-wasm（两者均可浏览器运行）。浏览器宿主形态：内存 FS 插件 + esbuild-wasm 的 `initialize({ wasmURL })`，即可在页面内跑完整构建——这不是纸面承诺：`browser/` 是一个真实 harness（vite dev 直接 serve TS 源），`yarn test:browser`（Playwright，webServer 起 vite 于 5901 端口）在 chromium 里跑全部内存 FS 场景并断言零 console error。

## 测试

- `yarn test`：node 侧——parse 说明符收集、共享场景套件、CLI 端到端（test/fixtures/mini 夹具工程，子进程跑 bin/stack.mjs）、零 node: 断言（核心 + SDK 入口 + 浏览器闭包）。
- `yarn test:browser`：Playwright 断言浏览器页面 data-state=passed、用例数与场景数一致、失败清单为空、页面零 console error / pageerror。
- `yarn test:all`：两者串联。
- 场景单一事实源在 `test/scenarios.ts`：场景文件表、配置与期望（含错误路径与协议行为）全部数据化/内联，node 的 build.spec.ts 与浏览器 harness 共用同一套 `SCENARIOS` 与 `runScenario`，杜绝双份漂移。

## MVP 边界（明确不做）

- scope hoisting、bundle 拼接、code splitting、sourcemap——preserve-ESM 足够验证整条管线
- bare specifier 的 node_modules 解析（一律 external）
- CSS / 资产 / HTML 入口
- 缓存与增量构建（watch 是防抖全量重建）
- buildEnd 产出的并发编排（插件串行，先序可见即可）
