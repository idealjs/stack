export interface PracticeTask {
  id: string

  label: string
  title: string

  scene: string

  expectation: string

  acceptance: string[]

  opener: string
}

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

export function taskFromLocation(): PracticeTask {
  if (typeof window === 'undefined') return TASKS[0]
  const id = new URLSearchParams(window.location.search).get('task')
  return TASKS.find((t) => t.id === id) ?? TASKS[0]
}
