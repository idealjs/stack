# @stack/design-system

孟菲斯 × 拟物卡设计系统的唯一定义处：组件（MemphisCard/RouteLine/Ticket/ChapterTicket/AssignBlock/EntryGuide/Scatter/shapes）、tokens（颜色/字体/投影/票券打孔）、类型。

`apps/tutorial`（教程站）引用本包——特性只改这里，站点同步获得；结构契约与视觉基线的 E2E 在 `apps/tutorial/e2e/`。消费方式：workspace 依赖 + 源码直出（vite 编译 TS，无需构建步骤）。

`Ticket` 是独立的通用票券，内容通过 `children` 传入。票面先用 mask 打孔，内层 `.ticket-shadow` 包裹用 `filter: drop-shadow()` 根据挖空轮廓生成阴影；孔缘描边留在包裹之外，不参与投影（filter 不能放在被 mask 的票面上——同元素上 mask 在 filter 之后应用，会把孔位处的阴影一起裁掉）。上下孔的圆心使用同一个横坐标，位置相对于票面左侧计算。

```tsx
import { Ticket, ChapterTicket } from '@stack/design-system'

<Ticket holePosition="50%" holeSize={20} className="h-20 w-60 p-4">
  自定义票券内容
</Ticket>

<Ticket holePosition={72} holeSize={16} hover={false} className="h-20 w-60" />

<ChapterTicket chapter={chapter} done />
```

| Prop | 含义 | 默认值 |
| --- | --- | --- |
| `holePosition` | 上下孔圆心的横坐标；数字为 px，字符串支持 `%`、`px`、`calc()` | 票根撕线位置，距右侧 39.25px |
| `holeSize` | 孔径，单位 px；孔缘描边随尺寸调整，`0` 表示无孔 | `12` |
| `punched` | 是否打孔 | `true` |
| `hover` | 浮起 3px，阴影由 5px 平滑过渡到 8px | `true` |
| `className` | 票面的尺寸和内容布局 | 无 |
| `wrapperClassName` | 外层布局类名 | 无 |

`style`、事件与其他 div 属性传给外层。`ChapterTicket` 负责章节内容与完成状态，复用 `Ticket`，同样接受 `holePosition`、`holeSize`、`hover`。`TicketProps` 与 `ChapterTicketProps` 从包入口导出。

## 拟物学习组件

12 种组件均从 `@stack/design-system` 导出，props 与条目类型也从同一入口导出。样式复用纸色、撞色、2px 描边与 5px 硬投影；动效尊重 `prefers-reduced-motion`。每个组件都接受 `className`，内容由调用方提供。

| 组件 | 用途 | 内容与交互 |
| --- | --- | --- |
| `ClipboardChecklist` | 夹板验收清单 | `title`、`description`、`items`；逐项勾选，全部完成后显示印章 |
| `FolderTabs` | 文件夹索引 | `label`、`tabs`（id / label / content）；点击或方向键、Home / End 切换 |
| `StickyNote` | 折角便签 | `title`、`children`、`tone` |
| `Bookmark` | 复习书签 | `label`、`tone`；按钮切换标记，提供 `aria-pressed` |
| `FlashCard` | 双面知识卡 | `question`、`answer`、`label`、`tone`；显式翻面，不自动播放 |
| `ExperimentFrame` | 实验结果预览 | `title`、`address`、`status`、`caption`、`children` |
| `OutputReceipt` | 打印输出回执 | `title`、`command`、`output`、`defaultExpanded`；原生 details 折叠 |
| `TaskEnvelope` | Agent 任务信封 | `title`、`summary`、`recipient`、`children`、`defaultOpen`；原生 details 展开 |
| `Stamp` | 验收印章 | `status`：done / review / pending；`children` 可覆盖印章文案 |
| `BrickToolbox` | 概念工具盒 | `title`、`bricks`（id / name / what / why / family / learned）；每块独立展开 |
| `DeliveryManifest` | 交付装箱单 | `title`、`reference`、`items`（id / label / detail / href / ready） |
| `ComparisonBoard` | 双纸页对照 | `title`、`left` / `right`（label / content）、`caption`；窄屏自动上下排列 |

`LearningTone` 支持 coral / teal / yellow / violet / pink / blue，分别对应现有六个撞色 token。

清单、标签、书签与知识卡可独立操作，也支持由调用方持有状态：

| 组件 | 受控属性 | 初始值 | 回调 |
| --- | --- | --- | --- |
| `ClipboardChecklist` | `checkedIds` | `defaultCheckedIds` | `onCheckedChange` |
| `FolderTabs` | `selectedId` | `defaultSelectedId` | `onSelect` |
| `Bookmark` | `saved` | `defaultSaved` | `onSavedChange` |
| `FlashCard` | `flipped` | `defaultFlipped` | `onFlip` |

```tsx
import { ClipboardChecklist, TaskEnvelope } from '@stack/design-system'

<ClipboardChecklist
  title="核对第一个页面"
  items={[
    { id: 'page', label: 'localhost 显示页面' },
    { id: 'network', label: 'Network 返回 200' },
  ]}
  checkedIds={checkedIds}
  onCheckedChange={setCheckedIds}
/>

<TaskEnvelope title="搭好工程" summary="准备环境，交付可运行的页面。">
  <p>目标、约束、交付物与验收条件。</p>
</TaskEnvelope>
```

教程站 `design-components.html` 引用 `LearningKitGallery` 标本，从 `@stack/design-system/examples/learning-kit` 导入。标本的交互状态仅保留在当前页面，不写入真实学习进度。
