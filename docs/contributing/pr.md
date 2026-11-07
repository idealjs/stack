# PR 规范

规则覆盖 PR 的创建、评审与合并全流程。执行 PR 相关操作前先读本文档；AGENTS.md 只保留红线与路由。

- 目标分支一律为 main，一个 PR 只解决一件事。
- PR 标题遵循 Conventional Commits。
- PR 描述固定三段，标题即「## 背景」「## 变更内容」「## 自测结果」：
  - **背景**——为什么做这件事、问题是什么；
  - **变更内容**——改了什么（可按主题分小节与列表）；
  - **自测结果**——验证手段与结果（本地复现、e2e、CI run 编号都归此节）；纯 docs 类没有可测效果时，写 CI 绿即可。
- 涉及页面 / 组件视觉效果的 PR，「自测结果」里必须带改动前后对照截图（before / after）；纯 docs、ci、依赖类改动可免。
- 截图以附件直贴 PR，不进仓库。两种贴法：
  - web 粘贴：编辑 PR 描述时直接 `Ctrl+V` 粘贴剪贴板里的截图，Gitea 自动上传为附件并插入 `/attachments/<uuid>` 链接；
  - API 上传（AI 顺手用）：`POST /repos/<owner>/<repo>/issues/<PR 序号>/assets`，multipart 字段 `attachment` 带文件，token 取 `~/.config/tea/config.yml`，返回的 `browser_download_url` 内嵌进描述：
    ```bash
    T=$(awk '/token:/{print $2}' ~/.config/tea/config.yml | head -1)
    curl -X POST "https://gitea.idealjs.com/api/v1/repos/idealjs/stack/issues/<PR 序号>/assets" \
      -H "Authorization: token $T" -F "attachment=@<截图>.png"
    ```
  不用分支 raw 链接指向仓库内文件——分支合入删除即死链（先例：PR #32 贴图被迫三换其链）。
- 出图口径与 e2e 一致：起 `stack preview`（带 `VITE_STACK_RUNTIME_ORIGIN` 指向 web-runner）后用 playwright 截图，视口取 e2e 惯用档位（桌面 1280×900、移动 390×844），`document.fonts.ready` 后再截防字体抖动；fixed 贴签 / 抽屉类状态用视口截图（非 fullPage）。
- 流程：推送功能分支，创建 PR，盯 CI 并汇报结果；按评审意见以新的提交追加修改。有新推送时旧的合入指示作废，需重新确认后方可合并。
- 对评审意见的回复直接内联在该条评论下，便于意见解决后逐条 resolve；不要另发 PR 级评论。回复一律使用直接回复 API：

  ```bash
  curl -X POST -H "Authorization: token $TOKEN" -H "Content-Type: application/json" \
    -d '{"body":"回复内容"}' \
    "https://gitea.idealjs.com/api/v1/repos/idealjs/stack/pulls/<PR 序号>/comments/<COMMENT_ID>/replies"
  ```
- CI 状态检查通过后方可合并，CI 未绿不得请求合入。
- 合并方式：main 禁止直推，并入一律由平台以 rebase 方式完成，禁止 `-no-ff` / 普通 merge 产生 merge commit。
- 合入许可：检查全绿不是合入许可；AI（agent）开 PR、盯 CI、汇报即止，执行 `tea pulls merge` 必须等用户显式指示（先例：PR #32 检查全绿后 AI 自行 rebase 合入，被要求回填此规）。
- 涉及视觉基线（`apps/tutorial/e2e/visual.spec.ts-snapshots/*.png`）的分支，rebase 重放后可能在每条 commit 上遇到图片冲突——逐条取任一侧即可，**并在合并完成后于 main 上整批重建基线**：
  ```bash
  cd apps/tutorial && npx playwright test e2e/visual.spec.ts --update-snapshots=all
  ```
  必须用 `all` 模式：默认 `changed` 模式受 1% 容差影响会**静默跳过**小于容差的漂移（历史上导航文案改动 ~1077px/页 曾被长期吞掉）。
