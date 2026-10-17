/** 练习任务库：每个任务 = 任务卡（位置/预期/场景 + 验收清单）+ 开场提示词。
 * 任务卡同时驱动两处：SSG 首屏的静态说明、agent 的 system prompt 与 TASK.md——单一数据源。
 * v1 只有 react-starter 一个任务；后续按 ch1-ch6 扩充，导航行由本表生成。 */

export interface PracticeTask {
  id: string
  /** 导航/任务卡上的短名 */
  label: string
  title: string
  /** 场景：给用户的开场说明（任务卡正文） */
  scene: string
  /** 预期：给 agent 与用户共同的目标描述 */
  expectation: string
  /** 验收清单：完成后用户逐条对照 */
  acceptance: string[]
  /** 开场提示词：把这段话发给陪练 agent 就能开工（便签「发给陪练」一键直发）。
   * 与 scene/expectation/acceptance 同源分叉出「用户话术版」，不是第二份任务描述。 */
  opener: string
}

/* 模板工程（vite + react 起手文件）随运行时移除，归档于 exp/vivari-playground 分支；
 * ESM + MCP 方案确定工程载体后在此恢复。 */

export const TASKS: PracticeTask[] = [
  {
    id: 'react-starter',
    label: 'react-starter',
    title: '我的自我介绍卡',
    scene:
      '这是一个 vite + react + ts 的最小工程（工程文件会随后续运行时接入提供）。这是你第一次「指挥 agent」：你负责提要求和验收，agent 负责讲解思路、给出代码——当前先在对话里把需求说清楚。',
    expectation:
      '把 src/App.tsx 改成一张「自我介绍卡」：大标题显示一个名字（真实或虚构均可），配 3 行介绍（来自哪里 / 正在学什么 / 想做什么项目）。只用最基础的 JSX 与内联样式，不引入新依赖。',
    acceptance: [
      '预览页大标题显示名字',
      '介绍恰好 3 行',
      '只改了 src/App.tsx（可以让 agent 展示改动内容）',
    ],
    opener:
      '请把 src/App.tsx 改成一张「自我介绍卡」：大标题显示我的名字，下面正好 3 行介绍（来自哪里 / 正在学什么 / 想做什么项目）。' +
      '只用最基础的 JSX 与内联样式，不引入新依赖；改完把改动内容展示给我，我去看预览并逐条对照验收清单。',
  },
]

/** 由任务卡生成 TASK.md（注入模板工程，agent 的任务说明与其 UI 展示同源） */
export function taskMarkdown(task: PracticeTask): string {
  return [
    `# 练习任务 · ${task.title}`,
    '',
    '## 位置',
    task.scene,
    '',
    '## 预期',
    task.expectation,
    '',
    '## 验收清单',
    ...task.acceptance.map((a) => `- [ ] ${a}`),
    '',
  ].join('\n')
}

/** 从 ?task= 选任务；SSG/水合差异可接受（React 客户端渲染接管） */
export function taskFromLocation(): PracticeTask {
  if (typeof window === 'undefined') return TASKS[0]
  const id = new URLSearchParams(window.location.search).get('task')
  return TASKS.find((t) => t.id === id) ?? TASKS[0]
}
