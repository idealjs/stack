# 提交规范

提交信息遵循 Conventional Commits，格式为 type(scope): subject。

- type 取值：feat、fix、docs、chore、refactor、perf、test、ci。
- scope 可选，使用小写。
- subject 使用祈使句，结尾不加句号。
- 正文说明 what 和 why，减少非文字字符。
- 破坏性变更在 subject 末尾加感叹号，或在正文脚注 BREAKING CHANGE 及说明。
- 一次提交只做一件事，不混入无关的格式化或重构。
- 已推送的提交视为不可变，仅对自己未合入的功能分支允许 force push。

## Agent 身份与签名

每个 Agent 使用 Agent 身份 `arnold.cui-agent <arnold.cui-agent@idealjs.com>` 提交，签名钥 `D8D43C57BEA48F3F9731B058A4DAD71E60C748B4`。本仓库仓库级 git config 配的是本人身份，禁止改写它；commit、rebase 等一切写出提交的命令逐次带 `-c` 覆盖，否则提交会落成本人身份且无签名：

```bash
git -c user.name=arnold.cui-agent -c user.email=arnold.cui-agent@idealjs.com \
  -c user.signingkey=D8D43C57BEA48F3F9731B058A4DAD71E60C748B4 -c commit.gpgsign=true \
  commit -m "docs: ..."
```

提交后核对作者与签名，`git log -1 --format='%an <%ae> %G?'` 应为 `arnold.cui-agent <arnold.cui-agent@idealjs.com> G`。
