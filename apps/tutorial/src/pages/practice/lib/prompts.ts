/** 「创建项目」板块的静态文案与示例提示词——板块文案的单一数据源（纯常量，SSG 安全：无 window 访问）。
 * 三条示例同守「创建一个 vite 项目，使用 …」句式，由浅入深演示把需求说全的四要素：
 * 用什么脚手架、什么框架与语言、初始要有什么、有什么约束。 */

export interface CreateProjectExample {
  /** 页签与 testid 后缀 */
  id: string
  /** FolderTabs 页签名 */
  tab: string
  /** strip 标题：序号 + 这条在示范什么 */
  title: string
  /** 示例句终稿（复制 / 发给陪练都以它为准） */
  text: string
  /** 一句话点评：这条把四要素补到了哪一步 */
  hint: string
}

/** 板块标题旁的一句 note */
export const CREATE_PROJECT_NOTE = '下一步——让 agent 从零建一个工程'

/** 板块教学文案：字符串片段与加粗词（四要素）交错，渲染处只负责排版不做文案创作 */
export const CREATE_PROJECT_INTRO: readonly (string | { b: string })[] = [
  '真实工作里，接手的第一件事往往就是建个新项目。它也最考验你把需求说全：用哪个',
  { b: '脚手架' },
  '、什么',
  { b: '框架与语言' },
  '、初始要',
  { b: '有什么' },
  '、有哪些',
  { b: '约束' },
  '。下面三条示例从一句话起步，逐步把这四要素补齐——点「发给陪练」就能在右下角便签里直接试。',
]

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
