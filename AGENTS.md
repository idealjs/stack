# AGENTS.md

给 AI agent 与协作者的仓库约定。

## Git：main 禁止直推，并入一律 PR ＋ rebase

- **main 受保护，不能直接 push**，本地 main 只用于同步远端；一切改动通过 PR 并入，保持线性历史：
  1. 功能分支上先 `git rebase main`（冲突在分支侧解决）；
  2. push 分支并开 PR（`tea pulls create -b main -t <标题> -d <说明>`），由平台以 rebase 方式并入。
- **禁止 `-no-ff` / 普通 merge 产生 merge commit**。
- 涉及视觉基线（`apps/tutorial/e2e/visual.spec.ts-snapshots/*.png`）的分支，rebase 重放后可能在每条 commit 上遇到图片冲突——逐条取任一侧即可，**并在合并完成后于 main 上整批重建基线**：
  ```bash
  cd apps/tutorial && npx playwright test e2e/visual.spec.ts --update-snapshots=all
  ```
  必须用 `all` 模式：默认 `changed` 模式受 1% 容差影响会**静默跳过**小于容差的漂移（历史上导航文案改动 ~1077px/页 曾被长期吞掉）。

## PR：描述必须带图

- 涉及页面 / 组件视觉效果的 PR，**描述里必须带截图**，改动前后对照（before / after）；纯 docs、ci、依赖类改动可免。
- 图随分支提交进 `docs/assets/<主题>/`，命名 `pr-shot-before-*.png` / `pr-shot-after-*.png`（先例：`docs/assets/design-colors-rule-note/`、`docs/screenshots/lazy-dev/<commit>/`）。
- PR 描述里内嵌用**分支绝对 raw 链接**，不能用相对路径——合并前 base 分支上还没有这些文件：
  ```markdown
  ![改后·桌面](https://gitea.idealjs.com/idealjs/stack/raw/branch/<分支>/docs/assets/<主题>/pr-shot-after-desktop.png)
  ```
- 出图口径与 e2e 一致：起 `stack preview`（带 `VITE_STACK_RUNTIME_ORIGIN` 指向 web-runner）后用 playwright 截图，视口取 e2e 惯用档位（桌面 1280×900、移动 390×844），`document.fonts.ready` 后再截防字体抖动；fixed 贴签 / 抽屉类状态用视口截图（非 fullPage）。

## 代码零注释：唯一例外 biome 指令

- 源码（`ts` / `tsx` / `js` / `jsx` / `mjs` / `css`）中**禁止一切注释**。唯一允许的是工具指令：
  - biome：`// biome-ignore <规则>: <原因>` / `/* biome-ignore … */`
  - TS 三斜线编译器指令：`/// <reference types="vite/client" />`
- 机制说明、设计取舍、「为什么这么写」一律**不进代码**——写进对应的设计册页面（design-*）、markdown 文档或 commit message。宁可让代码自解释，也不留注释。
- 改完代码跑一遍 `node scripts/strip-comments.mjs` 保持零注释：脚本全量清除存量注释（ts/tsx 走 TypeScript AST，字符串与 JSX 文本安全；css 走状态机），biome 指令与三斜线指令保留。
