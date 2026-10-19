
import type { Chapter, ChapterId, Profile } from '@stack/design-system'

export const CHAPTERS: Record<ChapterId, Chapter> = {
  1: {
    id: 1,
    title: '快速开始',
    emoji: '🚀',
    color: 'var(--color-ch1)',
    target: {
      goal: '让第一个网页从你的服务器跑起来——不是双击打开的文件',
      expectation: '地址栏是 http://localhost:端口，Network 面板有一次 200',
      bricks: [
        { name: 'HTTP 请求/响应', learned: true },
        { name: '静态文件服务', learned: true },
        { name: 'HTML 骨架', learned: true },
      ],
    },
  },
  2: {
    id: 2,
    title: 'React',
    emoji: '⚛️',
    color: 'var(--color-ch2)',
    target: {
      goal: '用组件拼出可增删的 todo',
      expectation: '增删待办界面即时变化，全程不手改 DOM',
      bricks: [
        { name: '组件', learned: true },
        { name: 'props', learned: true },
        { name: 'state', learned: false },
        { name: 'Vite 工程', learned: false },
      ],
    },
  },
  3: {
    id: 3,
    title: '更多示例',
    emoji: '🧪',
    color: 'var(--color-ch3)',
    target: {
      goal: '遇到布局/效果问题，知道缺哪块积木',
      expectation: '同一张卡片用三种布局（文档流/flex/grid）各摆一遍',
      bricks: [
        { name: '文档流', learned: false },
        { name: 'flex', learned: false },
        { name: 'grid', learned: false },
      ],
    },
  },
  4: {
    id: 4,
    title: '更多 · 构建',
    emoji: '📦',
    color: 'var(--color-ch4)',
    target: {
      goal: '看懂源码怎么变成产物',
      expectation: '能指出 dist 里每个文件对应源码哪部分，说清 dev 与 prod 的差别',
      bricks: [
        { name: '打包', learned: false },
        { name: '静态产物', learned: false },
      ],
    },
  },
  5: {
    id: 5,
    title: '全栈基础',
    emoji: '🌐',
    color: 'var(--color-ch5)',
    target: {
      goal: '给 todo 接上数据库与 API——数据存下来',
      expectation: '刷新页面数据还在；API 返回 JSON；数据落在 SQLite 文件',
      bricks: [
        { name: 'REST 路由', learned: false },
        { name: 'ORM（Prisma）', learned: false },
        { name: '联调（CORS）', learned: false },
      ],
    },
  },
  6: {
    id: 6,
    title: '高级教程',
    emoji: '🧠',
    color: 'var(--color-ch6)',
    target: {
      goal: '读得懂 agent 给的代码，错的你看得出来',
      expectation: '拿一段 agent 生成的代码，能指出数据流向与不纯之处',
      bricks: [
        { name: '数据流', learned: false },
        { name: '纯函数', learned: false },
        { name: '协作流程', learned: false },
      ],
    },
  },
}

export const PROFILES: Profile[] = [
  {
    icon: '🌱',
    name: '零基础入门',
    entry: 1,
    path: [1, 2, 3, 4, 5],
    note: '完整链按序走；每步先核对预期再前进。',
  },
  {
    icon: '⚡',
    name: '写过页面的人',
    entry: 2,
    path: [2, 5, 6],
    note: '跳过装环境；从组件拼接进入。',
  },
  {
    icon: '🧠',
    name: '重度 AI 依赖',
    entry: 6,
    path: [6, 5],
    note: '从指挥 agent 做整件事切入，回头补认知基础。',
  },
]




export interface Step {
  title: string
  kind: 'value' | 'agent' 
  what: string 
  accept: string 
}


export interface Brick3 {
  name: string
  what: string
  why: string
  family: string
}

export interface ChapterContent {
  steps: Step[]
  bricks: Brick3[]
  
  base?: string
}

export const CONTENT: Record<ChapterId, ChapterContent> = {
  1: {
    steps: [
      {
        title: '写第一个页面',
        kind: 'value',
        what: '一个浏览器能渲染的 HTML 文件：标题 + 一句话。',
        accept: '浏览器打开，看到标题与一句话。',
      },
      {
        title: '起最简服务器',
        kind: 'value',
        what: '一个小服务：把你的文件按地址返回给浏览器。',
        accept: '地址栏是 http://localhost:端口，Network 面板有一次 200。',
      },
      {
        title: '环境安装（node / 编辑器）',
        kind: 'agent',
        what: '交给 agent 完成；教程不给安装过程。',
        accept: '真机验收：node -v 有版本号、服务器能启动——跑必须真跑。',
      },
    ],
    bricks: [
      {
        name: 'HTTP 请求/响应',
        what: '浏览器问一句、服务器答一句的一来一回',
        why: '页面是服务器「答」出来的，不是文件自己会显示',
        family: '同族还有 WebSocket（长连着说）；要「拉一次数据」用 HTTP，要「持续推」用 WebSocket',
      },
      {
        name: '静态文件服务',
        what: '把目录里的文件原样返回的那层服务',
        why: '第一个页面只需要它，不需要数据库与逻辑',
        family: '同族是反向代理/CDN；自己玩用静态服务，上量了前面加代理',
      },
      {
        name: 'HTML 骨架',
        what: '页面内容的最小可渲染结构',
        why: '靶子的「长相」由它定义',
        family: '同族有 Markdown/JSX；给浏览器看的是 HTML，写起来顺手的是后两者',
      },
    ],
    base: '终端、node、编辑器不是积木，是脚下的地——第一次用到就在这里露出：终端是你指挥机器的嘴，node 是让 JavaScript 在机器上跑的运行时，编辑器是看代码的眼睛。',
  },
  2: {
    steps: [
      {
        title: '建 Vite 工程',
        kind: 'agent',
        what: '交给 agent 完成；脚手架过程无学习价值。',
        accept: 'dev 服务器起来，改一行代码浏览器立刻变化。',
      },
      {
        title: '组件拆分',
        kind: 'value',
        what: '输入框 / 列表 / 按钮三个组件，各司其职。',
        accept: '删掉列表组件，输入框与按钮不塌。',
      },
      {
        title: 'state 驱动界面',
        kind: 'value',
        what: '待办数据放在 state，界面是数据的影子。',
        accept: '增删待办后不碰 DOM，界面也更新。',
      },
    ],
    bricks: [
      {
        name: '组件',
        what: '把一块界面连同它的行为打包成零件',
        why: 'todo 由零件拼成，新零件不碰旧零件',
        family: '同族是函数组件/类组件；新项目一律函数组件',
      },
      {
        name: 'props / state',
        what: 'props 是外面递进来的，state 是自己肚里的',
        why: '增删待办 = 改 state；父传子用 props',
        family: '同族是 context/store；两层传参用 props，跨层共享再上 store',
      },
      {
        name: 'Vite 工程',
        what: '让你写源码、浏览器收成品的开发机',
        why: '「改一行立刻见」由它提供',
        family: '同族 webpack/Rsbuild；判断特征是 dev 速度与生态，新手期不换',
      },
    ],
    base: 'node_modules / package.json 不是积木，是认知基础：node_modules 是这台机器的零件仓库，package.json 是购物清单——平台会替你装，但你要知道「装了什么、装到哪」。',
  },
  3: {
    steps: [
      {
        title: '三种布局各摆一遍',
        kind: 'value',
        what: '同一张卡片，分别用文档流、flex、grid 摆出来。',
        accept: '三种摆法结果一致，且能说出各自适合的场景。',
      },
    ],
    bricks: [
      {
        name: '文档流',
        what: '元素从上往下、从左往右的默认排法',
        why: '它是底座，flex/grid 都是在改写它',
        family: '布局一族的基础款；先看懂它再学另外两个',
      },
      {
        name: 'flex',
        what: '一条轴上的排布（横或纵）',
        why: '侧栏、工具条这类一维排列的首选',
        family: '一维用 flex，二维用 grid',
      },
      {
        name: 'grid',
        what: '行与列的网格排布',
        why: '等宽多列、整体骨架的首选',
        family: '二维用 grid；「区域划分」感强时优先它',
      },
    ],
  },
  4: {
    steps: [
      {
        title: '构建并解剖产物',
        kind: 'value',
        what: '跑一次构建，把 dist 里的文件逐个对回源码。',
        accept: '每个产物文件能指出对应源码哪部分。',
      },
      {
        title: '部署脚本',
        kind: 'agent',
        what: '交给 agent 完成。',
        accept: '产物在静态服务器上可访问。',
      },
    ],
    bricks: [
      {
        name: '打包',
        what: '把源码合并、压缩、改名成浏览器吃得下的文件',
        why: '浏览器只认产物，不认你的源码工程',
        family: '同族是 tree-shaking/分包；产物里找不到的代码就是没打进去',
      },
      {
        name: '静态产物',
        what: '一堆不需要服务端运算的文件',
        why: '部署＝把这堆文件放到能被访问的地方',
        family: '同族是 SSR 产物；纯静态放哪都能跑，SSR 要算力',
      },
    ],
    base: 'dev server 与构建产物是两回事：dev 是「现做现吃」，prod 是「做好装盒」——就地露出，别混。',
  },
  5: {
    steps: [
      {
        title: '设计 API',
        kind: 'value',
        what: 'GET /todos、POST /todos、DELETE /todos/:id 三条路由。',
        accept: 'curl 三条全通，返回都是 JSON。',
      },
      {
        title: '建 Prisma 工程',
        kind: 'agent',
        what: '交给 agent 完成。',
        accept: 'migration 生成、SQLite 库文件出现。',
      },
      {
        title: '前后端联调',
        kind: 'value',
        what: '前端的读写改走 API，跨端口的门是 CORS。',
        accept: 'Network 面板能看到 todos 请求，刷新页面数据还在。',
      },
    ],
    bricks: [
      {
        name: 'REST 路由',
        what: '「地址 + 动词」对应一件事的约定',
        why: '前后端只靠这份约定说话',
        family: '同族 GraphQL/RPC；资源型增删改查用 REST 起步最省',
      },
      {
        name: 'ORM（Prisma）',
        what: '用代码对象读写数据库的那层',
        why: 'todo 存下来靠它，不写裸 SQL 也能起步',
        family: '同族 TypeORM/Drizzle/裸 SQL；要类型提示与迁移流水线时用它',
      },
      {
        name: '联调（CORS）',
        what: '浏览器跨端口拿数据时要带的通行证头',
        why: '前端 5173、后端 3000，不配就互相不认',
        family: '同族是代理转发；开发期用 CORS 头或代理都行，别两头乱配',
      },
    ],
    base: 'SQLite 是一个文件当数据库——零安装、看得见摸得着（库文件就在目录里），是认知基础里最直观的一块地。',
  },
  6: {
    steps: [
      {
        title: '读一段 agent 生成的代码',
        kind: 'value',
        what: '拿 agent 写的 todo 数据流，画出状态从哪来、到哪去。',
        accept: '图能画全，且能指出一处可纯化的计算。',
      },
      {
        title: '纯函数改造',
        kind: 'value',
        what: '把一处带副作用的计算改成纯函数。',
        accept: '同输入同输出，搬家到任何文件行为不变。',
      },
    ],
    bricks: [
      {
        name: '数据流',
        what: '状态沿着「事件 → 改状态 → 重渲染」的流动路径',
        why: '读代码就是读它的数据流',
        family: '同族是单向数据流/响应式；判断特征：状态只有一个真源吗',
      },
      {
        name: '纯函数',
        what: '同输入必同输出、不碰外界的函数',
        why: '值得信赖的计算块，agent 代码里的定海针',
        family: '同族是副作用隔离；IO 推到边角，核心保持纯',
      },
      {
        name: '协作流程',
        what: '与人/agent 分工的边界与交接物',
        why: '识别力就是「分工时分得清谁干了什么」',
        family: '同族是 code review 流；验收产物越清楚，协作越轻',
      },
    ],
  },
}
