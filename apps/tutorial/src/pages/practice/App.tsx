/** 在线练习——浏览器里的 WebContainer 练习场 + 陪练 agent。
 * SSG 只渲染静态壳（任务卡 + 占位面板）；沙盒与 agent 都在浏览器端拉起。 */
import { Page } from '../../lib/ui'
import { PracticeWorkspace } from './components/PracticeWorkspace'

export function App() {
  return (
    <Page
      active="practice"
      title="在线练习"
      desc="浏览器里的 Node.js 练习场：一个真实的 vite + react 工程跑在 WebContainer 中。你指挥陪练 agent 改代码，预览实时更新——你负责提要求和验收，agent 负责过程。"
    >
      <PracticeWorkspace />
    </Page>
  )
}
