import { SiteFooter } from '@stack/site-kit'
import type { NavRowGroup } from '../../design-system'
import { SiteSidebar } from '../../design-system'
import { SITE_NAV } from '../../lib/ui'
import { PracticeWorkspace } from './components/PracticeWorkspace'

const PAGE_ROWS: NavRowGroup[] = [
  ...SITE_NAV.rows,
  {
    sectionKey: 'practice-page',
    label: '本页',
    items: [
      { key: 'practice-sandbox', label: '代码沙箱', href: '#practice-sandbox' },
      { key: 'practice-brief', label: '练习任务', href: '#practice-brief' },
      { key: 'practice-flow', label: '操作流水线', href: '#practice-flow' },
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
            左边写真跑：上半是 web runner 沙箱预览，下半是 playground 编辑器，点「运行
            ▶」构建产物送进隔离 iframe
            执行；右边读任务——点「操作流水线」任意一步，提示词自动填进陪练 agent
            输入框，回车即发；验收清单夹在页面右上角，点夹具拉出来逐条打勾。
          </p>
        </div>
        <PracticeWorkspace />
        <SiteFooter />
      </main>
    </div>
  )
}
