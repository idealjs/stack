# AGENTS.md

给 AI agent 与协作者的仓库约定。

## Git：main 禁止直推，并入一律 PR ＋ rebase

- **main 受保护，不能直接 push**，本地 main 只用于同步远端；一切改动通过 PR 并入，保持线性历史：
  1. 功能分支上先 `git rebase main`（冲突在分支侧解决）；
  2. push 分支并开 PR（`tea pulls create -b main -t <标题> -d <说明>`），由平台以 rebase 方式并入。
- **禁止 `-no-ff` / 普通 merge 产生 merge commit**。
- **PR 合入必须等用户显式指示**：AI 开 PR、盯 CI、汇报结果即止——检查全绿也不是合入许可；用户明确说合入后才执行 `tea pulls merge`（先例：PR #32 检查全绿后 AI 自行 rebase 合入，被要求回填此规则）。
- 涉及视觉基线（`apps/tutorial/e2e/visual.spec.ts-snapshots/*.png`）的分支，rebase 重放后可能在每条 commit 上遇到图片冲突——逐条取任一侧即可，**并在合并完成后于 main 上整批重建基线**：
  ```bash
  cd apps/tutorial && npx playwright test e2e/visual.spec.ts --update-snapshots=all
  ```
  必须用 `all` 模式：默认 `changed` 模式受 1% 容差影响会**静默跳过**小于容差的漂移（历史上导航文案改动 ~1077px/页 曾被长期吞掉）。

## PR：描述必须带图

- 涉及页面 / 组件视觉效果的 PR，**描述里必须带截图**，改动前后对照（before / after）；纯 docs、ci、依赖类改动可免。
- **截图以附件直贴 PR，不进仓库**。两种贴法：
  - web 粘贴：编辑 PR 描述时直接 `Ctrl+V` 粘贴剪贴板里的截图，Gitea 自动上传为附件并插入 `/attachments/<uuid>` 链接；
  - API 上传（AI 顺手用）：`POST /repos/<owner>/<repo>/issues/<index>/assets`，multipart 字段 `attachment` 带文件，token 取 `~/.config/tea/config.yml`，返回的 `browser_download_url` 内嵌进描述：
    ```bash
    T=$(awk '/token:/{print $2}' ~/.config/tea/config.yml | head -1)
    curl -X POST "https://gitea.idealjs.com/api/v1/repos/idealjs/stack/issues/<PR 序号>/assets" \
      -H "Authorization: token $T" -F "attachment=@<截图>.png"
    ```
  不用分支 raw 链接指向仓库内文件——分支合入删除即死链（先例：PR #32 贴图被迫三换其链）。
- 出图口径与 e2e 一致：起 `stack preview`（带 `VITE_STACK_RUNTIME_ORIGIN` 指向 web-runner）后用 playwright 截图，视口取 e2e 惯用档位（桌面 1280×900、移动 390×844），`document.fonts.ready` 后再截防字体抖动；fixed 贴签 / 抽屉类状态用视口截图（非 fullPage）。

## 代码零注释：唯一例外 biome 指令

- 源码（`ts` / `tsx` / `js` / `jsx` / `mjs` / `css`）中**禁止一切注释**。唯一允许的是工具指令：
  - biome：`// biome-ignore <规则>: <原因>` / `/* biome-ignore … */`
  - TS 三斜线编译器指令：`/// <reference types="vite/client" />`
- 机制说明、设计取舍、「为什么这么写」一律**不进代码**——写进对应的设计册页面（design-*）、markdown 文档或 commit message。宁可让代码自解释，也不留注释。
- 改完代码跑一遍 `node scripts/strip-comments.mjs` 保持零注释：脚本全量清除存量注释（ts/tsx 走 TypeScript AST，字符串与 JSX 文本安全；css 走状态机），biome 指令与三斜线指令保留。
