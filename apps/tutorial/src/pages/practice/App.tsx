
import { Page } from '../../lib/ui'
import { PracticeWorkspace } from './components/PracticeWorkspace'

export function App() {
  return (
    <Page
      active="practice"
      title="在线练习"
      desc="任务卡、陪练 agent 与创建示例先行上线：你提要求、对照验收，agent 负责讲解与给代码。代码执行运行时正在以 ESM + MCP 的形式重建，接入后就能在这里真写真跑。"
    >
      <PracticeWorkspace />
    </Page>
  )
}
