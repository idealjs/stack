# design-lab · 设计系统可运行版

孟菲斯 × 拟物卡设计系统的 Vite MPA 实现。设计规格文档见 `design-refs/mockup/design-system/`（四册 PDF）。

## 结构

- 根目录每个 `*.html` 是一个入口，对应 `src/pages/<name>/main.tsx`（vite.config 自动扫描）
- `src/styles/tokens.css`：Tailwind v4 `@theme` 设计 token（撞色对 / 中性阶 / 章节色）
- `src/components/`：MemphisCard、RouteLine、Ticket、shapes、EntryGuide
- `src/lib/chapters.ts`：章节/关系/画像数据（改内容只动这里）

## 命令

```bash
yarn dev                # 本地开发
yarn build              # 构建 MPA
yarn test:e2e           # E2E：结构契约断言 + 视觉基线
yarn test:e2e:update    # 有意的设计变更后，更新截图基线并提交
```

## E2E 防画面偏差（两层）

1. **结构契约**（`e2e/pages.spec.ts`）：规格级断言——卡片 2px 描边/硬投影/纸叠三层、16:9 相框比例与内阴影、积木点实心数、站点 r6 半嵌（源骑黑影外缘/目标贴描边）、票券裁切式（overflow hidden + 头部无框 + 双打孔 + 撕线虚/实）。布局微调不误报，破坏规格必红。
2. **视觉基线**（`e2e/visual.spec.ts` + `e2e/visual.spec.ts-snapshots/`）：五页整页截图像素比对，容差 1%。**基线需随代码提交**；有意变更用 `yarn test:e2e:update` 生成新基线后一并提交。

测试在 `prefers-reduced-motion` 下运行（卡片的 8000ms 翻转与动效关闭，截图稳定）。
