/** 练习任务库：每个任务 = 一份注入 WebContainer 的模板工程 + 任务卡（位置/预期/场景 + 验收清单）。
 * 任务卡同时驱动两处：SSG 首屏的静态说明、agent 的 system prompt 与 TASK.md——单一数据源。
 * v1 只有 react-starter 一个任务；后续按 ch1-ch6 扩充，导航行由本表生成。 */
import type { FileSystemTree } from '@webcontainer/api'

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
  /** 注入 WebContainer 的模板工程 */
  files: FileSystemTree
}

/* 模板工程文件（内联字符串，mount 进 WebContainer） */
const starterAppTsx = `export function App() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 560,
        margin: '80px auto',
        padding: '24px 28px',
        border: '2px solid #111',
        borderRadius: 16,
        boxShadow: '8px 8px 0 #111',
      }}
    >
      <h1 style={{ marginTop: 0 }}>你好，练习场</h1>
      <p>这是一个 vite + react 工程，正跑在浏览器的 WebContainer 里。</p>
      <p>打开右侧对话，让 agent 把它改成你的作品。</p>
    </main>
  )
}
`

const starterMainTsx = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

const starterFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'practice-react-starter',
          private: true,
          version: '0.0.0',
          type: 'module',
          scripts: { dev: 'vite' },
          dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
          devDependencies: {
            '@types/react': '^18.3.12',
            '@types/react-dom': '^18.3.1',
            '@vitejs/plugin-react': '^4.3.4',
            typescript: '~5.6.2',
            vite: '^6.0.0',
          },
        },
        null,
        2,
      ),
    },
  },
  'vite.config.ts': {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
    },
  },
  'tsconfig.json': {
    file: {
      contents: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            noEmit: true,
          },
          include: ['src'],
        },
        null,
        2,
      ),
    },
  },
  'index.html': {
    file: {
      contents: `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Practice</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
  },
  src: {
    directory: {
      'main.tsx': { file: { contents: starterMainTsx } },
      'App.tsx': { file: { contents: starterAppTsx } },
    },
  },
}

export const TASKS: PracticeTask[] = [
  {
    id: 'react-starter',
    label: 'react-starter',
    title: '我的自我介绍卡',
    scene:
      '这是一个 vite + react + ts 的最小工程，已经跑在浏览器的 WebContainer 里。这是你第一次「指挥 agent」：你负责提要求和验收，agent 负责写代码。',
    expectation:
      '把 src/App.tsx 改成一张「自我介绍卡」：大标题显示一个名字（真实或虚构均可），配 3 行介绍（来自哪里 / 正在学什么 / 想做什么项目）。只用最基础的 JSX 与内联样式，不引入新依赖。',
    acceptance: [
      '预览页大标题显示名字',
      '介绍恰好 3 行',
      '只改了 src/App.tsx（可以让 agent 展示改动内容）',
    ],
    files: starterFiles,
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
