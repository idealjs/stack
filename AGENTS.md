# AGENTS.md

给 AI agent 与协作者的仓库约定。

## Git：分支并入 main 只用 rebase

- 功能分支并入 **main 一律只用 rebase**，保持线性历史：
  1. 分支上先 `git rebase main`（冲突在分支侧解决）；
  2. 回 main 执行 `git merge --ff-only <branch>` 完成并入。
- **禁止 `-no-ff` / 普通 merge 产生 merge commit**。
- 涉及视觉基线（`apps/tutorial/e2e/visual.spec.ts-snapshots/*.png`）的分支，rebase 重放后可能在每条 commit 上遇到图片冲突——逐条取任一侧即可，**并在合并完成后于 main 上整批重建基线**：
  ```bash
  cd apps/tutorial && npx playwright test e2e/visual.spec.ts --update-snapshots=all
  ```
  必须用 `all` 模式：默认 `changed` 模式受 1% 容差影响会**静默跳过**小于容差的漂移（历史上导航文案改动 ~1077px/页 曾被长期吞掉）。

## 代码零注释：唯一例外 biome 指令

- 源码（`ts` / `tsx` / `js` / `jsx` / `mjs` / `css`）中**禁止一切注释**。唯一允许的是工具指令：
  - biome：`// biome-ignore <规则>: <原因>` / `/* biome-ignore … */`
  - TS 三斜线编译器指令：`/// <reference types="vite/client" />`
- 机制说明、设计取舍、「为什么这么写」一律**不进代码**——写进对应的设计册页面（design-*）、markdown 文档或 commit message。宁可让代码自解释，也不留注释。
- 改完代码跑一遍 `node scripts/strip-comments.mjs` 保持零注释：脚本全量清除存量注释（ts/tsx 走 TypeScript AST，字符串与 JSX 文本安全；css 走状态机），biome 指令与三斜线指令保留。
