# 分支规范

规则覆盖 main 的保护要求与功能分支的切出、命名、同步。

- main 受分支保护，禁止直推，禁止 force push，一切变更通过 PR 合入。
- 功能分支命名格式为 type/简述，使用 kebab-case，type 与提交类型一致，如 feat/add-parser、fix/null-check、chore/deps-upgrade。
- 分支从最新 main 切出，发起 PR 前先同步 main，保证 PR 可干净评审。同步一律 `git rebase main`（冲突在分支侧解决），不得把 main merge 进分支。
