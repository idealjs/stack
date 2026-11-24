# @idealjs/stack-ui-kit

设计系统的 token 层与基础组件层：token（颜色／字体大小／阴影）在此唯一定义，组件只控制基础行为与人机交互，视觉全部吃 token，可组合出不同观感。

## token：vanilla-extract 最小用法（globalStyle + vars）

颜色分两层（`design/colors` 规范的机器可执行形式），全部以 `globalStyle(':root', { vars })` 定义，不用 createTheme/createGlobalTheme 机制：

- **颜色描述层（primitive，`src/tokens/palette.css.ts`）**——`--palette-coral/teal/mustard/violet/pink/blue/green/black/cream/sand/clay/graphite`，描述「这是什么颜色」，是色值的唯一事实源。**theme switch 只切这层**：换一套 palette 映射（撞色对轮转、暗色纸等），全站观感随动。
- **语义描述层（semantic，`src/tokens/theme.css.ts`）**——`--color-clash1a…3b`（撞色对槽位：对 1 a＝coral、对 1 b＝teal……）、`--color-ink/paper/paper-deep/mute/body`（中性角色：描边墨／纸面／深纸／弱字／正文）、`--shadow-ink(-lift)`、`--drop-shadow-ink(-lift)`、`--text-content/t3/t2/t1/small`（含 `--line-height` 伴生）。描述「这个颜色在系统里干什么」，**组件组成只准消费这层**，值全部 `var(--palette-*)` 引用。业务站主题（`src/tokens/site.css.ts`）同构：章节色 `--color-ch1..7` 映射 palette 槽位，`--page-flip-spring` 翻页动效曲线。

semantic 层以**原名**输出：learning.css、app 手写 css 与全部 inline `var()` 都按 `--color-*` 原名消费——改名即断，动前先全库 grep。组件 css.ts 消费的 `theme` 对象是纯 TS 常量（值为 `var(--color-*)` 字符串），非 ve theme 机制。

app 侧继续用 tailwind 工具类的场景，由 app 的桥接入口（`apps/tutorial/src/styles/tailwind.css`）以 `@theme inline` 引用这些原名变量生成 utility，app 代码零改动。

## 组件

| 组件 | 职责 |
| --- | --- |
| `Button`／`ShadowButton`／`ShadowCard`／`Ticket` | 按钮与硬投影卡片、打孔票券壳 |
| `BrowserMockup` | 浏览器取景框（纯展示） |
| `shapes`（`Tri`／`BrickDot`／`Ring`／`Wave`／`Mark`） | SVG 视觉原子，配色走 token 变量 |
| `Scatter` | 装饰形状散布引擎（`[data-comp]` 避让采样） |
| `Dropdown`／`DockSheet`／`DockModal` | 浮层三件（受控开关、Esc／外点关闭） |
| `Tabs`／`FlipCard`／`ToggleButton` | 行为骨架：tablist roving、双面翻卡、aria-pressed 切换；类名全量注入，皮由业务封装提供 |
| `useControllableState` | 受控／非受控双模态 hook（骨架共用） |

组件样式全部为 vanilla-extract `style()`；`shadowButtonClasses()` 等类名常量 API 保留，值换成 ve 类名。

## 效果类机制（globalStyle）

`src/components/effects.css.ts` 以 `globalStyle` 输出跨元素组合器规则：`.hover-host:hover .hoverable-shadow`（shadow-ink／shadow-btn／shadow-btn-ring／lift-sm 档位）与 `.ticket-*`／`.pk-arc` 打孔机制。`shadow-ink` 等类名在组件里仅作**效果档位标记**，基础值由 ve 类给出。该文件未被任何模块 import 也会编译——stack 插件按包全量收集 `.css.ts`。

## 构建接入（stack-plugin）

`@idealjs/stack-ui-kit/stack-plugin` 导出 `vanillaExtract({ roots })`：

- `load`：`config.load` 里对 `.css.ts` 返回编译产物（纯静态类名导出），发生在 import 解析前，依赖图干净；
- `hooks`：`WatchHook` 监听 `default` 产出，向每个 html `</head>` 前注入 `__shared/ui-kit.css`，并以超集重发；下游插件（tailwind 编译、ssg）依次 `watch` 上游产出名接力。

缓存按 `.css.ts` 内容指纹；roots 传包根（filescope 需要最近的 package.json name）。
