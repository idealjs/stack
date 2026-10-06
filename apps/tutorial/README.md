# @stack/tutorial —— 全栈教程站（AI 时代版）

大纲见 [OUTLINE.md](./OUTLINE.md)（依据 ai-era-tutorial skill：靶子先行、步骤＝目标＋验收、代理区/价值区分类、指派三样、脱靶提醒、认知基础就地露出）。

- **Vite MPA**：根目录每 `*.html` 一个入口 → `src/pages/<name>/main.tsx`（与 design-lab 同构）
- **页面**：`index.html` 课程书架（入口画像 / 六章卡 / 主线与进度）；`ch1–ch6.html` 章节页（章头靶子 → 步骤 → 积木 → 认知基础 → 指派）
- **View Transitions**：`@view-transition { navigation: auto }` 跨文档交叉淡入（MPA 不闪白）；书架相框 ↔ 章节页章头同名 `view-transition-name: ch-<id>` 共享元素变形；站头 `site-header` 常驻；`prefers-reduced-motion` 下禁用
- **设计系统**：组件与 tokens 复制自 `apps/design-lab`（孟菲斯 × 拟物卡）
- **内容**：`src/lib/chapters.ts`（六章的靶子/步骤/积木/指派数据），改内容只动这一个文件

```bash
yarn workspace @stack/tutorial dev      # 开发
yarn workspace @stack/tutorial build    # 构建
yarn workspace @stack/tutorial preview  # 预览
```
