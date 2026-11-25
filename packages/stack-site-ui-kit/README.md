# @idealjs/stack-site-ui-kit

教程站业务组件层：带业务语义（章节／课程图谱／站点壳／拟物学习套件），多组件组合、不提供使用方自定义样式，只随 theme 换肤。依赖 `@idealjs/stack-ui-kit` 的基础件与 token。

## 组成

- `src/types.ts`：课程域类型（`ChapterId`／`Target`／`Chapter`／`Edge`／`Profile`）
- 章节与图谱：`ChapterTicket`、`EntryGuide`、`MemphisCard`（含 `BrickDots`／`EntryBadge`）、`RoutableCard`／`RoutableScene`、`RouteLine`
- 站点壳：`SiteNavbar`、`SitePage`（含 `SiteFooter`）、`SiteSidebar`——本版仍以 tailwind 工具类书写，靠 app 桥接层消费 token，后续逐步 ve 化
- 翻页：`PageFlipZone`（滚轮／键盘蓄力翻页，约定 `html[data-vt]`／sessionStorage `vt`／`data-scroll-root`）
- 拟物学习套件 `learning/`：ClipboardChecklist、FolderTabs、StickyNote、Bookmark、FlashCard、ExperimentFrame、OutputReceipt、TaskEnvelope、Stamp、BrickToolbox、DeliveryManifest、ComparisonBoard、DataFlowBoard；交互骨架（Tabs／FlipCard／ToggleButton）来自 ui-kit，本包做皮与业务文案薄封装，DOM 与类名不变
- `examples/LearningKitGallery.tsx`：12 件标本画廊

## 样式

- `styles/learning.css`：学习套件组件样式（按 `--color-*` 原名变量消费 token，`--learning-accent` 由 `toneStyle` 注入）
- `styles/page-flip.css`：`@view-transition` 与 `html[data-vt]` 翻页动画（`--page-flip-spring` 由 ui-kit 的 `src/tokens/site.css.ts` 提供——theme 相关 token 统一收在 `@idealjs/stack-ui-kit`）
- `src/components/*.css.ts`：token 一律 `import { theme } from '@idealjs/stack-ui-kit/tokens'`（纯 TS 常量，按原名 `var(--color-*)` 引用）；不得 import ui-kit 的 `.css.ts` token 模块，否则它会被编译进第二个变量作用域，引用全部悬空

app html 以包说明符引入：`<link rel="stylesheet" href="@idealjs/stack-site-ui-kit/styles/learning.css">`，构建期解析并落位 `__shared/`。

## 已知后续

- `SiteNavbar`／`SiteSidebar`／`MemphisCard` 等剩余 tailwind 类逐步迁 vanilla-extract
- `StickyNote`／`ComparisonBoard`（零业务词）整件下沉 ui-kit，样式段随迁
