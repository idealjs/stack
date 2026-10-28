import { SiteFooter } from '@stack/site-kit'
import type { NavRowGroup } from '../../design-system'
import { SiteSidebar } from '../../design-system'
import { TEMPLATE_FILES } from '../../lib/templateFiles'
import { SITE_NAV } from '../../lib/ui'
import { Playground } from '../../playground'
import { PracticeWorkspace } from './components/PracticeWorkspace'

const PAGE_ROWS: NavRowGroup[] = [
  ...SITE_NAV.rows,
  {
    sectionKey: 'practice-page',
    label: '本页',
    items: [
      { key: 'practice-task', label: '任务卡', href: '#practice-task' },
      { key: 'practice-create', label: '创建项目', href: '#practice-create' },
      { key: 'practice-sandbox', label: '代码沙箱', href: '#practice-sandbox' },
    ],
  },
]

export function App() {
  return (
    <div className="flex min-h-dvh text-content text-body">
      <SiteSidebar brand={SITE_NAV.brand} rows={PAGE_ROWS} active="practice" />
      <main className="mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-6 py-8 max-lg:pt-16">
        <div className="mb-7">
          <h1 className="m-0 text-t1 font-extrabold text-ink">在线练习</h1>
          <p className="m-0 mt-2 text-content text-mute">
            任务卡、陪练 agent 与创建示例先行上线：你提要求、对照验收，agent
            负责讲解与给代码。代码执行运行时已以跨源沙箱接入——写在下面的编辑器里，送进隔离 iframe
            真写真跑。
          </p>
        </div>
        <PracticeWorkspace />
        <section id="practice-sandbox" aria-label="代码沙箱" className="mt-8 scroll-mt-4">
          <h2 className="t-small-strong m-0 mb-2.5">
            代码沙箱（跨源 iframe 隔离执行 · 预置 template 工程）
          </h2>
          <Playground initialFiles={TEMPLATE_FILES} />
        </section>
        <SiteFooter />
      </main>
    </div>
  )
}
