# stack-demo

`stack` 构建工具的最小示例：两个入口一次构建，核心产出 `default` 规范产物，`minify` 插件经 `ctx.output` 追加压缩产物——验证单通道产出模型、alias 解析与 preserve-ESM 产物。

```
src/
├── app.ts            入口 1：相对导入 common/utils + alias 导入 @/info
├── tool.ts           入口 2：同一批公共模块的另一条导入链
├── info.ts           经 alias（@/ → src/）引用的模块
└── common/
    └── utils.ts      TS 接口 / 泛型函数（证明类型剥离转译）
```

配置形态：`inputs`（对象数组，name ＋ path）定义构建什么、`dist` 定义规范产物落位（`dist/esm`），`plugins: [minify({ dir: 'dist/min' })]` 定义衍生产物——多份输出的乘法不是配置运算，而是插件组合。

## CLI 用法

```bash
yarn install
yarn workspace stack-demo build        # 产出 default（dist/esm）与 min（dist/min）两份
node dist/esm/app.js                   # 直接执行产物
node dist/esm/tool.js
yarn workspace stack-demo dev          # stack --watch：防抖全量重建
```

## SDK 用法（不经 CLI）

```bash
yarn workspace stack-demo build:sdk    # 运行 sdk.mjs
```

`sdk.mjs` 直接 `import { build, defineConfig, minify } from '@idealjs/stack'`，注入 node 宿主的 `nodeFsPlugin`（来自 `@idealjs/stack/node`）后拿到 `BuildResult` 并自行写盘——核心不含任何 node 依赖，文件系统永远由宿主以插件形式注入。

## 与 vite 的差异

输入定义构建什么；产物由唯一产出通道定义——核心先产出 `default` 规范产物，插件在 buildEnd 经 `ctx.output` 追加衍生产物（重名抛错、模块阶段禁止产出），`BuildResult` 交宿主写盘。vite/rollup 的 output 配置＋插件 emitFile 双轨制，在这里收敛为单轨。
