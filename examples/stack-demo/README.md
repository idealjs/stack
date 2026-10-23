# stack-demo

`stack` 构建工具的最小示例：两个入口 × 两个输出，验证 inputs×outputs 笛卡尔积、alias 解析与 preserve-ESM 产物。

```
src/
├── app.ts            入口 1：相对导入 common/utils + alias 导入 @/info
├── tool.ts           入口 2：同一批公共模块的另一条导入链
├── info.ts           经 alias（@/ → src/）引用的模块
└── common/
    └── utils.ts      TS 接口 / 泛型函数（证明类型剥离转译）
```

## CLI 用法

```bash
yarn install
yarn workspace stack-demo build        # 产出 dist/esm 与 dist/min 两套
node dist/esm/app.js                   # 直接执行产物
node dist/esm/tool.js
yarn workspace stack-demo dev          # stack --watch：防抖全量重建
```

## SDK 用法（不经 CLI）

```bash
yarn workspace stack-demo build:sdk    # 运行 sdk.mjs
```

`sdk.mjs` 直接 `import { build, defineConfig } from '@stack/stack'`，注入 node 宿主的 `nodeFsPlugin`（来自 `@stack/stack/node`）后拿到 `BuildResult` 并自行写盘——核心不含任何 node 依赖，文件系统永远由宿主以插件形式注入。

## 与 vite 的差异

vite 一次 build 只有一组输出；stack 的配置是 `inputs`（n 个入口）× `outputs`（m 个输出配置）的笛卡尔积——每个入口都按每份输出配置构建一遍，产物互不影响。
