# @idealjs/stack

对标 vite/rollup 的 preserve-ESM 构建工具。v2 形态是**需求引擎**：引擎是 worklist 调度器
（FIFO，确定性），一切皆需求——模块需求（路径 P 的最终形态）与产出需求（`ctx.output`
登记即广播）。协议权威记录见 [docs/protocol-v2.md](./docs/protocol-v2.md)。

## 产品定位

- **CLI 是 SDK 的薄壳**：包主导出（`.`）提供 `build(config): Promise<BuildResult>` 与全部
  类型，CLI（`bin/stack`）只是「读配置 → 补缺省 fs → 调 build → 写盘打印」的宿主之一。
- **核心是 web standard 的**：`src/core/` 与 SDK 入口零 `node:` 导入（有测试断言）。平台
  I/O 只经注入 fs——`defineConfig` 的 `fs` 字段是平台绑定的唯一发生地，跨平台仅需换
  fs 注入。node 侧能力（`nodeFs`、`runCLI`）在 `./node` 子路径下。
- **静态解析而非运行时拦截**：acorn 顶层扫描收集静态 import/export 说明符与动态 import
  字符串字面量；引擎对 lower 返回的工件必再解析以长图。动态拼接的说明符不可见（MVP 边界）。
- **单产出通道**：核心登记第一份 `default` 规范产物（非特权产出方，只是第一个产出者），
  hook 经 `ctx.output` 追加衍生产物。登记即冻结（append-only）、登记即广播（watch 订阅）、
  重名报双来源（天然环断路器）。

## 配置模型（inputs / fs / load / hooks 四件套）

```ts
import { defineConfig } from '@idealjs/stack'
import { bundle, minify } from '@idealjs/stack/builtins'
import { nodeFs } from '@idealjs/stack/node'

export default defineConfig({
  root: '.',                            // 可选，默认 '.'
  inputs: [{ name: 'app', path: 'src/app.ts' }],  // 唯一的入口声明（初始模块需求）
  dist: 'dist/esm',                     // 可选，default 产物落位，默认 'dist'
  alias: { '@/': 'src/' },              // 前缀替换，target 是 root 相对路径
  fs: nodeFs(),                         // 平台注入；node CLI 缺省 nodeFs()，SDK/浏览器显式传入
  load: async (ctx, id) => ctx.fs.readFile(id),   // 配置级唯一加载器，必须经 ctx.fs
  hooks: [minify({ dir: 'dist/min' }), bundle({ entry: 'app', dir: 'dist/bundle' })],
})
```

- `fs: StackFs`（`readFile`/`writeFile`）；`memoryFs(files?)` 根导出（纯 Map，测试与浏览器用）；
- `load` 未配置时缺省 `ctx.fs.readFile`；解析的候选探测（`.ts/.tsx/.js/.jsx/.mjs/index`）
  由引擎经同一注入 fs 完成；
- 直接 `import fs`（平台 API）是协议违例：平台锁定与合并冲突只允许发生在 fs 注入处。

## 需求引擎

- **模块相**：resolve demand → resolve 链（纯函数、first-non-null、可内联供料
  `{ id, content }`；全部未命中时裸说明符＝external 保留、相对/绝对路径＝报错）→ 无内联
  内容则 load（ctx.fs）→ lower 链（产物集累积，一化 0..n；0＝消费终结、恒等合法）→ 产物
  带内容作为新 demand 回到 resolve。图层环无害（入图即止，交给 ESM live binding）。
- **产出相**：模块需求排干 → 引擎登记 `default`（preserve-ESM：入口公共祖先落位、说明符
  重写 `.ts→.js`、alias 与动态 import 字面量重写、external 保留）→ derive hooks 按注册序
  触发 → 产出事件驱动 watch 命中的 lower → quiescence → seal → `BuildResult`。
- **pull 层环**：lower 内 `await ctx.demand(specifiers)` 拉取依赖传递闭包终态（依赖先行、
  按 id 去重共享 Promise、external 跳过）；await 链成环抛可捕获 `CycleError`（带环路径，
  `core/cycle.ts` 独立纯检测器：addEdge 环检查＋可达性 memo＋contract 收缩重建）。协议
  认可的正解是 catch 后 `ctx.merge(specifiers, name?)` 解环（load 结果精确清理→拼接→注册
  新模块→注册表重定向→解除全体挂起）。

## lower ctx API（五件套）

```ts
interface LowerContext {
  fs: { readFile(path: string): Promise<string> }        // 注入 fs 只读面
  output(spec: EmittedOutput): void                      // 唯一副作用：登记产出（登记即冻结）
  lowerImport(code: string): string[]                    // acorn 封装：静态＋动态 import 字面量
  demand(specifiers: string[]): Promise<FinalModule[]>   // 递归需求：环时抛可捕获 CycleError
  merge(specifiers: string[], name?: string): Promise<FinalModule>  // 环解法
}
```

## 内置 hooks（SDK 根导出）

- `minify({ from?, name?, dir })`：`watch: [from ?? 'default']`，.js 走 esbuild-wasm 异步
  minify，登记 `{ name: name ?? 'min', dir }`——「按产出订阅」的范本；
- `bundle({ entry, dir, name?, runtime? })`：derive 图根。Tarjan SCC 分解（声明序
  tie-break）→ 表示切换：单点分量拼接（剥内部 import、external 保留）、多点分量 wrapped
  （`__define(id, fn)` 惰性函数＋import 改写 `const { x } = __require('id')` 解构近似＋入口
  `__require(entryId)` 启动，运行时模板 `runtime` 可覆写）。环语义由运行时保持，全程无
  await 无死锁。行为规格见 [docs/recipe-single-file.md](./docs/recipe-single-file.md)。

## 钩子协议

```ts
type StackHook =
  | { name; watch?; resolve?; lower?(id, artifacts, ctx): Artifact[] }   // 模块相
  | { name; watch: string[]; lower?(ctx, output): void }                 // 产出相订阅
```

- resolve / load / lower / derive 一律可 `T | Promise<T>`；worklist FIFO 调度，确定性优先；
- hook 是**能力的注册表**，不是链上的位置：组合＝能力并集，插入无意义；
- 产出登记即冻结：修正前人产出的唯一合法形式是登记新产出；`seal()` 是全协议唯一的终态；
- 互指环走 token 晚绑定（演进方向，未实现，见 protocol-v2）。

## 产物布局（preserve-ESM）

- 以全部入口 id 的公共祖先目录为基，每模块按相对结构落位，扩展名 `.ts/.tsx → .js`；
  lower 产物可自带显式 path（如 bundle.js）；
- import/export 说明符按新位置重写为相对路径（含动态 import 字符串字面量），external 不动；
- merge 重定向后的模块以首个成员的落位路径呈现，引用方重写指向它；
- `EmittedOutput.files` 内 `{ path, code }` 的 path 相对该产出自己的 dir。

## CLI

```bash
stack [--config stack.config.ts] [--watch]
```

摘要按产出顺序逐行打印 `name → dir（N 个文件，大小）`，末行报输入数/模块数/用时。
`--watch` 用 `fs.watch` 递归监听（忽略 node_modules/dist/.git），150ms 防抖全量重建；
配置文件本身的热重载不在 MVP 内（改配置需重启）。

## 浏览器路线

核心与 SDK 入口只依赖 acorn 与 esbuild-wasm（两者均可浏览器运行）。`browser/` 是真实
harness（vite dev 直接 serve TS 源），`yarn test:browser`（Playwright，webServer 起 vite
于 5901 端口）在 chromium 里跑全部内存 FS 场景并断言零 console error。

## 测试

- `yarn test`：node 侧——parse 说明符收集、循环检测器单测（`test/cycle.spec.ts`）、共享
  场景套件（含 await 环三种出路、bundle 环结构、watch 环断路）、CLI 端到端（mini 与
  cycle 夹具，后者断言单文件 bundle 产物 node 可执行）、零 node: 断言；
- `yarn test:browser`：Playwright 断言 data-state=passed、用例数与场景数一致、零
  console error / pageerror；
- 场景单一事实源在 `test/scenarios.ts`：memoryFs 驱动 SDK build 全流程，node 的
  build.spec.ts 与浏览器 harness 共用同一套 `SCENARIOS` 与 `runScenario`。

## MVP 边界（明确不做）

- scope hoisting、code splitting、sourcemap；
- bare specifier 的 node_modules 解析（一律 external）；
- CSS / 资产 / HTML 入口与 token 晚绑定（协议已留演进方向）；
- 缓存与增量构建（watch 是防抖全量重建）；
- bundle wrapped 表示的标识符级 scope 分析（解构近似，边界见 recipe-single-file）；
- 无限产出链以 quiescence 不达暴露（MVP 不设上限）。
