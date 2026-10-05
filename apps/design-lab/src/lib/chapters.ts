import type { Assignment, Chapter, ChapterId, Edge, Profile } from './types'

export const CHAPTERS: Record<ChapterId, Chapter> = {
  1: {
    id: 1,
    title: '快速开始',
    emoji: '🌐',
    color: 'var(--color-ch1)',
    target: {
      goal: '本地跑起一个可交互的页面',
      expectation: '改一处代码，浏览器里立刻看到变化',
      bricks: [
        { name: '页面骨架', learned: true },
        { name: '请求与渲染', learned: true },
        { name: '环境咬合', learned: true },
        { name: '部署预览', learned: false },
      ],
    },
  },
  2: {
    id: 2,
    title: 'React',
    emoji: '⚛️',
    color: 'var(--color-ch2)',
    target: {
      goal: '用组件拼出一个可维护的界面',
      expectation: '新增一种卡片类型不需要改动旧卡片',
      bricks: [
        { name: '组件拼接', learned: true },
        { name: '状态与副作用', learned: true },
        { name: '受控数据流', learned: false },
        { name: '性能边界', learned: false },
      ],
    },
  },
  3: {
    id: 3,
    title: '更多示例',
    emoji: '🧱',
    color: 'var(--color-ch3)',
    target: {
      goal: '照着积木清单拼出三个小作品',
      expectation: '每个作品都能对照预期结果自检',
      bricks: [
        { name: '表单页', learned: false },
        { name: '列表页', learned: false },
      ],
    },
  },
  4: {
    id: 4,
    title: '更多',
    emoji: '📦',
    color: 'var(--color-ch4)',
    target: {
      goal: '把示例扩展成自己的第一个完整小站',
      expectation: '有导航、有数据、能部署',
      bricks: [{ name: '路由', learned: false }],
    },
  },
  5: {
    id: 5,
    title: '全栈基础',
    emoji: '🔗',
    color: 'var(--color-ch5)',
    target: {
      goal: '把前端连上真实服务并部署上线',
      expectation: '别人能通过公网地址访问你的页面',
      bricks: [{ name: 'HTTP 与接口', learned: false }],
    },
  },
  6: {
    id: 6,
    title: '高级教程',
    emoji: '🧠',
    color: 'var(--color-ch6)',
    target: {
      goal: '指挥 agent 完成整栈项目',
      expectation: '你负责靶子与验收，agent 负责过程',
      bricks: [{ name: '识别力', learned: false }],
    },
  },
}

/** 关系边：seq 实线先后 / rel 虚线相关 / family 点线同族 */
export const EDGES: Edge[] = [
  { from: 1, to: 2, kind: 'seq' },
  { from: 2, to: 5, kind: 'seq' },
  { from: 2, to: 5, kind: 'family' },
]

export const PROFILES: Profile[] = [
  {
    icon: '🌱',
    name: '零基础入门',
    entry: 1,
    path: [1, 2, 3, 5],
    note: '完整链按序走；每步先核对预期再前进。',
  },
  {
    icon: '⚡',
    name: '写过页面的人',
    entry: 2,
    path: [2, 3, 6],
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

export const ASSIGNMENT: Assignment = {
  title: '指派学习 · npm',
  pos: '包管理家族——npm 的坐标与邻居',
  expect: '能说清 lockfile 锁住了什么',
  scenes: ['加一个依赖', '换源重装'],
  miss: {
    how: '装了但没跑',
    looks: '命令成功、页面空白——缺「真机验收」这块积木',
  },
}
