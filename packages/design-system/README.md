# @stack/design-system

孟菲斯 × 拟物卡设计系统的唯一定义处：组件（MemphisCard/RouteLine/Ticket/ChapterTicket/AssignBlock/EntryGuide/Scatter/shapes）、tokens（颜色/字体/投影/票券打孔）、类型。

`apps/design-lab`（规格实验场）与 `apps/tutorial`（教程站）共同引用本包——特性只改这里，双端同步获得。消费方式：workspace 依赖 + 源码直出（vite 编译 TS，无需构建步骤）。

`Ticket` 是独立的通用票券，内容通过 `children` 传入。票面先用 mask 打孔，外层 `filter: drop-shadow()` 根据轮廓生成阴影。上下孔的圆心使用同一个横坐标，位置相对于票面左侧计算。

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
