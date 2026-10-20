# @stack/tutorial —— 全栈教程站（AI 时代版）

大纲见 [OUTLINE.md](./OUTLINE.md)（依据 ai-era-tutorial skill：靶子先行、步骤＝目标＋验收、代理区/价值区分类、指派三样、脱靶提醒、认知基础就地露出）。

- **Vite MPA**：根目录每 `*.html` 一个入口 → `src/pages/<name>/main.tsx`
- **页面**：`index.html` 课程书架（入口画像 / 六章卡 / 主线与进度）；`ch1–ch6.html` 章节页（章头靶子 → 步骤 → 积木 → 认知基础 → 指派）
- **View Transitions**：`@view-transition { navigation: auto }` 跨文档交叉淡入（MPA 不闪白）；书架相框 ↔ 章节页章头同名 `view-transition-name: ch-<id>` 共享元素变形；站头 `site-header` 常驻；`prefers-reduced-motion` 下禁用
- **设计系统**：组件与 tokens 唯一定义于 `src/design-system`（孟菲斯 × 拟物卡）
- **内容**：`src/lib/chapters.ts`（六章的靶子/步骤/积木/指派数据），改内容只动这一个文件
- **E2E 防画面偏差**（两层，针对设计系统四册页）：
  1. **结构契约**（`e2e/pages.spec.ts` + `e2e/learning-kit.spec.ts`）：规格级断言——卡片 2px 描边/硬投影/纸叠三层、16:9 相框比例与内阴影、积木点实心数、站点 r6 半嵌（源骑黑影外缘/目标贴描边）、票券裁切式（overflow hidden + 头部无框 + 双打孔 + 撕线虚/实）、拟物学习组件交互。布局微调不误报，破坏规格必红。
  2. **视觉基线**（`e2e/visual.spec.ts` + `e2e/visual.spec.ts-snapshots/`）：设计四册整页截图像素比对，容差 1%。**基线需随代码提交**；有意变更用 `yarn test:e2e:update` 生成新基线后一并提交。

  测试在 `prefers-reduced-motion` 下运行（卡片的 8000ms 翻转与动效关闭，截图稳定）；跑前先 `yarn build`（webServer 走 `vite preview`）。

```bash
yarn workspace @stack/tutorial dev            # 开发
yarn workspace @stack/tutorial build          # 构建
yarn workspace @stack/tutorial preview        # 预览
yarn workspace @stack/tutorial test:e2e       # E2E：结构契约断言 + 视觉基线
yarn workspace @stack/tutorial test:e2e:update  # 有意的设计变更后，更新截图基线并提交
```
