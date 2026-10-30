export interface CreateProjectExample {
  id: string

  tab: string

  title: string

  text: string

  hint: string
}

export const CREATE_PROJECT_EXAMPLES: readonly CreateProjectExample[] = [
  {
    id: 'basic',
    tab: '基础',
    title: '示例 1 · 一句话说清框架与语言',
    text: '创建一个 vite 项目，使用 React 和 TypeScript，工程名叫 demo。',
    hint: '最小可用的一句：脚手架（vite）+ 框架与语言 + 工程名，三样全给到，agent 就能开工。',
  },
  {
    id: 'counter',
    tab: '进阶',
    title: '示例 2 · 把初始内容和约束一次说全',
    text: '创建一个 vite 项目，使用 React 和 TypeScript，工程名叫 counter-lab，初始就带一个计数器组件：点按钮数字加一，旁边配一个清零按钮。不要引入 UI 库，样式全用内联写法；建完把文件结构讲给我听。',
    hint: '补上另外两个要素：初始要有什么（计数器 + 清零）、有什么约束（不引 UI 库）；末尾再派一个讲解动作，方便你验收。',
  },
  {
    id: 'compare',
    tab: '对照',
    title: '示例 3 · 换个框架，对比差异',
    text: '创建一个 vite 项目，使用 Vue 和 TypeScript，工程名叫 vue-counter，初始同样带一个点按加一的计数器，同样不要引入 UI 库；建完把文件结构和 React 版的差异讲给我听。',
    hint: '句式一个字不改，只换框架与语言——把两条都跑一遍，你会看见「需求说全」比「选哪个框架」更决定结果。',
  },
]
