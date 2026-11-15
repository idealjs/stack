# 弹簧蓄力翻页组件 · 方案调研

> 期望交互：滚动蓄力（带阻尼/回弹），越过阈值后翻动到下一页；旧页退出与新页进入有连续动画。
> 候选：① 真跳转 + 浏览器 View Transitions；② 单页面内 CSS 控制翻动。

## 一、现状盘点（对选型有决定性影响的事实）

| 事实 | 出处 | 影响 |
|---|---|---|
| 站点是 **MPA**：每页一个 `.html`，纯 `<a href="./chX.html">` 整文档跳转，无任何 router | `stack.config.ts:19-20` glob inputs；`ChapterPage.tsx:109-136` 底部 prev/next 链接 | 方案①是「顺着现有架构加一层」，方案②是「改架构」 |
| **跨文档 View Transitions 已全站开启**：`@view-transition { navigation: auto; }` + reduced-motion 降级 | `src/design-system/styles/tokens.css:175-185` | 方案①的地基已打好，剩余工作是手势层 + 自定义关键帧 |
| 已命名元素 morph：`site-header`（导航）、`ch-N`（章节英雄区）、memphis 卡片 | `src/lib/ui.tsx:97`、`ChapterPage.tsx:19`、`MemphisCard.tsx:111` | 翻页动画可与「导航不动、英雄区换色」共存 |
| 章节页是**长文滚动**（步骤/积木清单/认知基础，远超一屏），非 100vh 一屏式 | `ChapterPage.tsx` 结构 | 「一屏一翻」与内容模型冲突，见 §二 |
| 零动画库（无 framer-motion/gsap）；React 18.3 | `apps/tutorial/package.json` | 手势层自己写，量不大 |
| e2e 跑在 `reducedMotion: 'reduce'` + `animations: 'disabled'` 下 | `playwright.config.ts` | 翻页动画在视觉基线里天然被杀，不会弄花基线；测试手势要另设计断言 |
| SSG：自研 stack 引擎预渲染 + `mount.ts` hydrate | `stack-plugins/build.ts`、`src/lib/mount.ts` | 静态跳转间隙小，可预取进一步压缩 |

## 二、先于选型的分叉：「翻页」的触发语义

章节是长文，「滚动到一定程度就翻页」有两种完全不同的解释：

- **(a) 到底蓄力**：页内正常滚动，读到底后再继续滚 → 不再下移而是蓄力（阻尼位移/进度提示），过阈值或松手释放 → 翻下一章。保留长文阅读模型。
- **(b) 一屏一翻**（fullpage 式）：整章压成一个视口，滚一下就翻。要求把每章拆/压成 100vh 的屏，是内容模型大改，且与「长文教程」定位冲突。

**默认取 (a)**。方案②的纯 CSS 形态（scroll-snap 每屏一页）只在 (b) 下成立；在 (a) 下两方案都需要同一个 JS 手势层——这直接改变了对比格局。

## 三、方案①：真跳转 + 跨文档 View Transitions（推荐）

### 机制

```
读到底部边界
  → wheel/touch 继续输入，不再滚动，改为蓄力：位移 = min(超出量×阻尼系数, 上限)，越拉越紧
  → 过阈值（或松手且过阈值，弹簧释放）→ location.href = 下一章
  → 浏览器接管：旧页快照 + 新页快照组成同一组 VT 动画
      old(root)带着蓄力位移继续滑出，new(root)从对侧滑入，linear() 弹簧曲线
      named 元素（导航、英雄区）走 morph，不随 root 滑动
```

关键点：

- **蓄力→翻页是连续的**：VT 拍的是「当前渲染」的快照，蓄力阶段的位移天然作为 old(root) 动画的起始状态；新页在 `pagereveal` 里读回方向/偏移，让 new(root) 从对侧进入。
- **方向控制**：`pageswap`（旧页卸载前）/ `pagereveal`（新页揭示时）事件里设 `event.viewTransition.types`，CSS 侧 `:root:active-view-transition-type(next)` / `(prev)` 切换两套关键帧。
- **弹簧手感**：蓄力段 JS 阻尼；释放段 CSS `linear()` 生成弹簧曲线（欠阻尼回弹一格即可），三引擎全支持。
- **降级零成本**：Firefox（跨文档 VT 未发）与旧浏览器 = 现状普通跳转，页面本来就靠 `<a>` 完整可用；`prefers-reduced-motion` 已有杀开关。
- **跳转间隙**：SSG 纯静态，加 `<link rel="prefetch">` 或 Speculation Rules 预取下一章后基本无感；new(root) 的滑入动画本身也掩盖加载。

### 支持矩阵（2025-10 口径）

| 能力 | Chrome/Edge | Safari | Firefox |
|---|---|---|---|
| 同文档 VT | 111+ | 18.0+ | ✅（Baseline Newly Available, 2025-10） |
| 跨文档 VT + pageswap/pagereveal | 126+ | 18.2+ | ❌ 未发 → 降级为普通跳转 |
| `linear()` 弹簧曲线 | 113+ | 17.2+ | ✅ |

覆盖约 85% 用户有完整动画，其余无缝降级为现状。

### 改动面（增量，不动架构/URL/SSG）

```
apps/tutorial/src/
├── design-system/
│   ├── components/
│   │   └── PageFlipZone.tsx      ← 手势容器：边界检测、阻尼蓄力、阈值释放→导航、蓄力进度回调
│   └── styles/tokens.css         ← + ::view-transition-old/new(root) 方向关键帧、linear() 弹簧、types
├── lib/
│   ├── page-flip.ts              ← pageswap/pagereveal 方向登记（无 React 依赖，进出页共享）
│   └── chapters.ts               ← prev/next 已有（ChapterPage 内 ALL 序列），翻章目标由手势层复用
```

### 风险

- 触屏：iOS 文档底部原生橡皮筋会先吃掉 overscroll，自定义蓄力需在边界接管 `touchmove`（passive:false），手感调校成本高于桌面 wheel；P1 可先桌面/键盘，触屏后补。
- e2e：`reducedMotion: reduce` 下 VT 被杀，手势用例断言落在 URL 与落点状态，不截图动画中间帧。

## 四、方案②：单页面内 CSS 翻动

两个子形态，代价不同：

- **②a scroll-snap 每屏一页**（纯 CSS）：所有「页」堆进一个文档、`scroll-snap-type: y mandatory`。只在语义 (b) 下成立 → 要把 7 章长文重排成一屏屏，动内容模型；7 章并一页，首屏体积/SEO/分享链接（章节 URL 变成滚动位置）全受损；弹簧「蓄力」感 scroll-snap 原生给不了（它只有贴合，没有阻尼蓄力），要蓄力还得回 JS 劫持 wheel——fullpage 式劫持的动量误触、嵌套滚动、无障碍是成堆的已知坑。
- **②b 同文档换内容**：一章一文档不变，翻页时 pushState + 手动 swap 内容 + 同文档 `startViewTransition`。等于自造 mini-router（React 18 无 `<ViewTransition>` 组件，全手写），打破 SSG「一页一 html」的简单性；而手势层与方案①一字不差，省不掉。
- 进入/离开动画若走 scroll-driven animations（`animation-timeline: view()`）：Chrome 115+ / Safari 26+，Firefox 未发——支持面比「VT + linear()」还窄。

结论：**手势层两案同价，方案②额外付架构改造税，动画上限（跨页连续 morph）反而更低**。

## 五、对比总结

| 维度 | ① 真跳转 + VT | ② 单页 CSS |
|---|---|---|
| 退出/进入动画连续性 | ✅ 旧新快照同组动画 + named 元素 morph | ②b 可平手；②a 无真动画（滚动即动画） |
| 蓄力弹簧手感 | ✅（手势层提供） | 同价（②a 纯 CSS 给不了） |
| 架构/URL/SSG/SEO | ✅ 零改动 | ②a 大改；②b 自造 router |
| 浏览器降级 | Firefox→现状普通跳转，零成本 | ②a 全平台有基本盘但手感差；②b 同 VT 依赖 |
| 跳转加载间隙 | 有，预取可压到无感 | 无 |
| 触屏成本 | 高（P1 再做） | 同价 |
| 与视觉基线 e2e | 无冲突（reducedMotion 已杀动画） | ②a 需重写全部 e2e |

## 六、推荐与实施步骤

**推荐方案①**，两步走：

1. **P0（桌面全量）**：`PageFlipZone` 手势层（wheel + 键盘，到底蓄力/释放判定）+ `tokens.css` 方向关键帧（`linear()` 弹簧、next/prev types、named 元素白名单）+ `page-flip.ts` 方向登记。Firefox/旧浏览器自动降级为现状。
2. **P1（打磨）**：下一章 prefetch、触屏 overscroll 蓄力。（已落地：蓄力符号层——底缘进度条＋继续滚动文案＋上/下章英雄卡探头；e2e 手势用例）

### 方向机制重构（2026-11）

参考 `idealjs/packages/home/page-one.html` 的做法，方向登记从 JS types 机制换成 sessionStorage 握手＋CSS 属性选择器，进场动画完全交给浏览器：

- **写**：翻页意图产生时落 `sessionStorage['vt']`——页底 `data-dir` 链接由 ch1–ch7.html head 内联脚本的全局 click 监听写入；手势/键盘/气泡点击统一在 `PageFlipZone` 的 `flip()` 里写。
- **读**：ch1–ch7.html head 内联经典脚本（解析阻塞，早于首帧）读出并写到 `<html data-vt>`，**读后即清**（consume-once，不设默认方向）。
- **选**：`tokens.css` 用 `html[data-vt="next"]::view-transition-new(root)`（rise-in）/ `[data-vt="prev"]`（drop-in）/ `html[data-vt]::view-transition-old(root)`（recede）选关键帧，`:active-view-transition-type()` 与 `page-flip.ts` 的 pageswap/pagereveal URL 章号比较整体废弃。
- **读后即清的红利**：浏览器返回、抽屉跳章、刷新等非翻页导航读不到方向，走浏览器默认 crossfade，无残留状态、不会拿旧方向误判返回动画。
- **蓄力符号层收敛**：只留「气泡（章色胶囊按钮）＋进度条」，探头卡 FlipPeekCard（章标题预览）删除；英雄区 `ch-N` 命名与 `--vt-hero-name` 抑制机制一并移除，标题随整页滑动（`data-vt` 是常驻属性，morph 抑制无法只作用于过渡窗口）。`site-header` morph 保留。
- `scrollRestoration = 'manual'` 移入内联脚本（原模块脚本晚于首帧，时机不可靠）。

落地后机制说明按仓库约定补进 design-* 册，PR 附 before/after 实拍（`docs/assets/page-flip/`）。

### 框架布局与动画调优（2026-11）

翻页动画上线后三个体验问题与对策：

- **滚动条位置**：原 window 级滚动条贯穿视口全高、压过 navbar/footer 区域。`SitePage` 重构为框架布局：`main` 变 `h-dvh flex-col`，navbar 层（flex-none）与 footer 层（flex-none）常驻视口，中间 `[data-scroll-root]` 容器独立滚动——滚动条天然只出现在 navbar 与 footer 之间。
- **内容滑过 navbar 的违和**：原 root 快照整页 `translateY(100%)` 滑入，堆叠在 `site-header` 组之上，观感是「正文压过导航」。对策：footer 也命名（`site-footer`）常驻 morph，`html[data-vt]` 下给 `site-header`/`site-footer` 组 `z-index: 10` 置于 root 之上，内容从常驻框架后面进出；新页进场从整幅滑入改为 `translateY(±40px)` 小位移淡入（380ms，弹簧曲线保留），`root` 组补 paper 底色防淡入白闪。
- **navbar 收起**：文档流 navbar 滚走后不可达。框架下 navbar 常驻，初版为「下滚收起、上滚展开」的方向感知；后改为**默认收起＋toggle 手动开合**——桌面紧凑条（brand＋当前章 label＋▼/▲ 按钮）上 `site-nav-expand` checkbox（命名 peer 纯 CSS，同移动抽屉先例）控制分组网格以 `absolute top-full` **遮挡式浮层**展开（不占布局流、不挤压滚动区，透明遮罩点外收起）；移动端维持 `site-nav-toggle` 汉堡→抽屉 sidebar。滚动驱动版曾出现「收起动画 clamp scrollTop 被误判上滚 → 收起⇄展开震荡 → 蓄力被 arrivalGesture 拦截」的反馈循环，toggle 化后布局高度恒定，此类几何干扰整体消失。
- `scrollRestoration = 'manual'` 随框架布局删除：window 恒不滚动，新文档/刷新后容器天然回顶。
- 手势层同步适配：`PageFlipZone` 边界检测与 scroll 监听从 window 改为 `[data-scroll-root]`（scroll 不冒泡，监听必须挂容器；wheel/keydown 仍挂 window 靠冒泡到达）。

### 全站翻页链（2026-11）

html 按 navbar 板块入夹（`tutorial/` `skills/` `blog/` `design/` `practice/`，枢纽页用 `index.html`，根 `index.html` 不动），翻页链从 ch1–ch7 扩到全部页面并成环：

- **页面注册表即链**：`src/lib/pages.ts` 的 `PAGES` 有序数组就是链序——index → learn → ch1…ch7 → html/css/javascript → blog（月升序，每月：月页→文章按日期升序，从 `content/blogs.ts` 的 MONTHS/POSTS 派生）→ design → 颜色/字体/符号/组件/阴影 → practice → 回到 index。`neighborsOf()` 环形取邻居，`relHref(from, to)` 按路径深度算相对链接（`./` vs `../`，兼容 `--base` 代理），`flipTargetsOf()` 产出 `PageFlipZone` 的 prev/next。导航 `siteNavFor(from)` 也由注册表生成，站点路径只在这一处定义。
- **装配上移**：`PageFlipZone` 从 `ChapterPage` 上移到 `lib/ui.tsx` 的 `Page`——所有走 `Page` 的页面自动入链；practice 不走 `Page`，在 App 里手动包。`FlipTarget.chapter: Chapter` 泛化为 `meta: { title, color }`（非章节页从 clash 色板取色），气泡文案随目标动态化（「▼ 继续滚动 · 下一页：{title}」）。
- **页底翻页条**：新 `components/PageTurnBar`（← 上一页 / 返回首页 / 下一页 →，`data-dir` 带方向握手），`Page` 统一追加在内容尾部；ChapterPage 原私有页底条删除，措辞不丢（注册表 title 本身含「第 N 章 · …」）。博客文章页的「返回月份」行保留在其上。
- **vt 握手脚本全站化**：所有 html head 都带 sessionStorage 握手内联脚本（原 ch1–ch7 独有），跨文档方向动画对全部页面生效。
- **配套设施**：`stack.config.ts` 递归扫描入夹 html（input name = 相对路径，如 `blog/gorzil`）；`stack-plugins/ssg.ts` 预渲染临时文件名把 `/` 展平为 `__`；`packages/stack` dev server 对无斜杠目录 URL（如 `/blog`）在 `blog/index.html` 存在时 308 到 `/blog/`，防止相对链接错位解析。

## 参考

- [Chrome: Cross-document view transitions for MPAs](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Piccalilli: View transitions fallback patterns](https://piccalil.li/blog/a-view-transitions-fallback-domcontentloaded-requestanimationframe)
- [bram.us: Keeping the page interactive during view transitions](https://www.bram.us/2025/01/29/view-transitions-page-interactivity)
- [fullPage.js](https://github.com/alvarotrigo/fullpage.js)（wheel 劫持坑位参考）
- [CSS-Tricks: CSS Scroll Snap](https://css-tricks.com)
