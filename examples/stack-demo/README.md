# stack-demo

`stack` 构建工具的最小示例（v2 需求引擎形态）：一个入口一次构建，核心经唯一产出通道
登记 `default` 规范产物，`minify` 以 watch 订阅 default 派生压缩产物，`bundle` 在 derive
相把入口闭包打成单文件——验证需求引擎、alias 解析、preserve-ESM 产物与内置 hooks。

```
src/
├── app.ts            入口：相对导入 common/utils + alias 导入 @/info
├── info.ts           经 alias（@/ → src/）引用的模块
└── common/
    └── utils.ts      TS 接口 / 泛型函数（证明类型剥离转译）
```

配置形态（v2 四件套：inputs / fs / load / hooks）：

- `inputs` 是唯一的入口声明——「路径 P 的模块的最终形态」是引擎的初始模块需求；
- `fs: nodeFs()` 平台注入在宿主写配置的那一刻完成，core 与 hooks 全程平台无关；
- `load` 是配置级唯一加载器，必须经 `ctx.fs`（缺省即 `ctx.fs.readFile`）；
- `hooks` 是能力注册表：`minify` 声明 `watch: ['default']`，产出登记即触发；
  `bundle` 声明 `derive`，模块集排干后按终态模块集＋依赖边做 SCC 分解与单文件打包。

## CLI 用法

```bash
yarn install
yarn workspace stack-demo build        # 产出 default（dist/esm）、min（dist/min）、bundle（dist/bundle）
node dist/esm/app.js                   # preserve-ESM 产物直接执行
node dist/bundle/bundle.js             # 单文件打包产物直接执行
yarn workspace stack-demo dev          # stack --watch：防抖全量重建
```

## SDK 用法（不经 CLI）

```bash
yarn workspace stack-demo build:sdk    # 运行 sdk.mjs
```

`sdk.mjs` 直接 `import { build, defineConfig, minify, bundle } from '@idealjs/stack'`，
注入 `nodeFs()`（来自 `@idealjs/stack/node`）后拿到 `BuildResult` 并自行写盘——核心零
`node:`，平台 I/O 只发生在 `defineConfig` 的 `fs` 注入处，跨平台仅需换 fs 实现。

## 与 vite 的差异

输入定义构建什么；产物由唯一产出通道涌现——核心登记第一份 `default`（非特权产出方），
hook 经 `ctx.output` 追加衍生产物（登记即冻结、登记即广播、重名报双来源），
`BuildResult` 交宿主写盘。vite/rollup 的 output 配置＋插件 emitFile 双轨制，在这里收敛
为单轨；插件顺序问题在 v2 里被需求与订阅取代——组合＝能力并集，插入无意义。
