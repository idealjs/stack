# AGENTS.md

给 AI agent 与协作者的仓库约定。本文件只做路由：全局红线列在下面，其余规范按主题拆分在 docs/contributing/ 下，执行对应操作前先读对应文档。

## 路由表

| 场景 | 文档 |
|------|------|
| 切分支、分支命名、同步 main | docs/contributing/branches.md |
| 编写提交信息（含 Agent 身份与签名的操作方式） | docs/contributing/commits.md |
| 创建 PR、贴截图、评审回复、合并 | docs/contributing/pr.md |

## 全局红线

以下约束贯穿一切操作：

- 所有提交必须 GPG 签名，禁止以任何方式绕过签名。
- 每个 Agent 使用 Agent 身份提交，提交前确认 git config 的 user.name 和 user.email 正确；本仓库的操作方式见 docs/contributing/commits.md。
- main 受分支保护，禁止直推，禁止 force push，一切变更通过 PR 合入。
- 未收到明确的记录文档指令时，禁止将文档（markdown 等叙述性记录）新增、提交或推送到本仓库；教程正文、包 README、设计册（design-*）与 docs/contributing 规范属于仓库内容，随对应改动维护，不在此列。

## Git：main 禁止直推，并入一律 PR ＋ rebase

- **main 受保护，不能直接 push**，本地 main 只用于同步远端；一切改动通过 PR 并入，保持线性历史：
  1. 功能分支上先 `git rebase main`（冲突在分支侧解决）；
  2. push 分支并开 PR，由平台以 rebase 方式并入。
- **禁止 `-no-ff` / 普通 merge 产生 merge commit**。
- **PR 合入必须等用户显式指示**：AI 开 PR、盯 CI、汇报结果即止——检查全绿也不是合入许可；用户明确说合入后才执行 `tea pulls merge`（先例：PR #32 检查全绿后 AI 自行 rebase 合入，被要求回填此规则）。
- 视觉基线分支的 rebase 冲突处理与合并后基线重建规则见 docs/contributing/pr.md。

## PR：规范见 docs/contributing/pr.md，执行 PR 相关操作前先读它

- 本节只留红线，两段描述结构、前后截图与附件贴法、出图口径、评审回复与合并细则都在文档中维护。
- 红线：PR 描述固定三段（背景／变更内容／自测结果）；视觉类 PR 必须在「自测结果」带前后截图；截图附件直贴不进仓库，不用分支 raw 链接（分支合入删除即死链）。

## 代码零注释：唯一例外 biome 指令

- 源码（`ts` / `tsx` / `js` / `jsx` / `mjs` / `css`）中**禁止一切注释**。唯一允许的是工具指令：
  - biome：`// biome-ignore <规则>: <原因>` / `/* biome-ignore … */`
  - TS 三斜线编译器指令：`/// <reference types="vite/client" />`
- 机制说明、设计取舍、「为什么这么写」一律**不进代码**——写进对应的设计册页面（design-*）、markdown 文档或 commit message。宁可让代码自解释，也不留注释。
- 改完代码跑一遍 `node scripts/strip-comments.mjs` 保持零注释：脚本全量清除存量注释（ts/tsx 走 TypeScript AST，字符串与 JSX 文本安全；css 走状态机），biome 指令与三斜线指令保留。
