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
