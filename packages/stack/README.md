# @idealjs/stack

对标 vite/rollup 的 preserve-ESM 构建工具。MVP 阶段做一件事：**静态解析模块图，把 n 个输入 × m 个输出逐组合转译落位**，不拼接 bundle。

## 产品定位

- **CLI 是 SDK 的薄壳**：包主导出（`.`）提供 `build(config): Promise<BuildResult>` 与全部类型，CLI（`bin/stack`）只是「读配置 → 组装 node 插件 → 调 build → 写盘打印」的宿主之一。程序化调用与 CLI 调用走完全同一条链路。
- **核心是 web standard 的**：`src/core/` 与 SDK 入口零 `node:` 导入（有测试断言）。文件读写、路径解析全部经插件钩子注入——rollup 的「核心不碰 fs」模式。node 侧能力（`nodeFsPlugin`、`runCLI`）在 `./node` 子路径导出下，浏览器宿主不得引入。
- **静态解析而非 import hook**：用 acorn 从 `Program.body` 收集静态 import/export 说明符与动态 import 字符串字面量构建依赖图，不做运行时拦截。确定性更强、无启动成本，代价是动态拼接的说明符不可见（MVP 边界）。
- **n×m 笛卡尔积**：`inputs`（n 个入口）× `outputs`（m 份输出配置）全组合构建。与 vite「一次 build 一组输出」的哲学差异：多目标（esm/min/未来 cjs）是配置的一等公民，不是多次调用。

## 配置模型

```ts
import { defineConfig } from '@idealjs/stack'

export default defineConfig({
  root: '.',                                  // 可选，默认 '.'
  inputs: { app: 'src/app.ts', tool: 'src/tool.ts' },
  outputs: [{ dir: 'dist/esm' }, { dir: 'dist/min', minify: true }],
  alias: { '@/': 'src/' },                    // 前缀替换，target 是 root 相对路径
  plugins: [],
})
```

alias 语义：source 命中前缀（或整串等于 key）即替换为 target + 剩余部分，结果按 root 相对路径进入 resolveId 链。

## 钩子协议

```ts
interface StackPlugin {
  name: string
  resolveId?(source, importer): string | null   // source → 模块 id
  load?(id): string | null                        // id → 源码
  transform?(id, code): string | null             // 转译链
  buildEnd?(ctx): void                            // ctx.result 为完整 BuildResult
}
```

- 调度语义：**链式 first-non-null**——按 plugins 声明顺序依次调用，第一个返回非 null 的结果生效。
- id 契约：resolveId 返回的 id 应是 POSIX 规范化路径形态（node 宿主为绝对路径，内存/浏览器宿主可为任意稳定字符串）。
- 解析失败规则：相对说明符、alias 命中、绝对路径解析失败即抛错；裸说明符（npm 包名）解析失败视为 external，产物原样保留。
- 转译管线：load → 用户 transform 链 → 核心 esbuild-wasm 按 id 扩展名剥类型（ts/tsx/jsx）→ acorn 收集说明符。

## 产物布局（preserve-ESM）

- 以全部入口 id 的公共祖先目录为基，每模块按相对结构落位，扩展名 `.ts/.tsx → .js`。
- import/export 说明符按新位置重写为相对路径（含动态 import 字符串字面量），external 说明符不动。
- minify 输出在重写之后做 esbuild 压缩（esbuild 不改写 import 字符串，重写结果安全）。
- 核心不写盘：产物经 emitFile 收进 `BuildResult.outputs[].files`（`{ path, code }`，path 相对 output.dir）返回给宿主。

## CLI

```bash
stack [--config stack.config.ts] [--watch]
```

`--watch` 用 `fs.watch` 递归监听（忽略 node_modules/dist/.git），150ms 防抖全量重建；配置文件本身的热重载不在 MVP 内（改配置需重启）。

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
