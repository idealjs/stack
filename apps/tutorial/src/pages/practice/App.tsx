import { Playground } from '@stack/playground'
import { Page } from '../../lib/ui'
import { TEMPLATE_FILES } from '../../lib/templateFiles'
import { PracticeWorkspace } from './components/PracticeWorkspace'

export function App() {
  return (
    <Page
      active="practice"
      title="在线练习"
      desc="任务卡、陪练 agent 与创建示例先行上线：你提要求、对照验收，agent 负责讲解与给代码。代码执行运行时已以跨源沙箱接入——写在下面的编辑器里，送进隔离 iframe 真写真跑。"
    >
      <PracticeWorkspace />
      <section aria-label="代码沙箱" className="mt-8">
        <h2 className="t-small-strong m-0 mb-2.5">
          代码沙箱（跨源 iframe 隔离执行 · 预置 template 工程）
        </h2>
        <Playground initialFiles={TEMPLATE_FILES} />
      </section>
    </Page>
  )
}
