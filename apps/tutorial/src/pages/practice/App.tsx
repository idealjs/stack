import type { NavRowGroup } from '../../design-system'
import { SiteSidebar } from '../../design-system'
import { SiteFooter } from '../../lib/site'
import { SITE_NAV } from '../../lib/ui'
import { PracticeWorkspace } from './components/PracticeWorkspace'

const PAGE_ROWS: NavRowGroup[] = [
  ...SITE_NAV.rows,
  {
    sectionKey: 'practice-page',
    label: '本页',
    items: [{ key: 'practice-sandbox', label: '代码沙箱', href: '#practice-sandbox' }],
  },
]

export function App() {
  return (
    <div className="flex min-h-dvh text-content text-body">
      <SiteSidebar brand={SITE_NAV.brand} rows={PAGE_ROWS} active="practice" />
      <main className="mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-3 py-4 max-lg:pt-16">
        <div className="mb-4">
          <h1 className="m-0 text-t1 font-extrabold text-ink">在线练习</h1>
          <p className="m-0 mt-1.5 text-content text-mute">
            沙箱写真跑：web runner 沙箱预览接构建输出，点「运行 ▶」产物送进隔离 iframe
            执行；右上角「💡 tips」拉出操作流水线，点任意一步，提示词自动填进陪练 agent
            输入框，回车即发；playground
            编辑器收在右缘侧栏，点「编辑器」签拉开写码；验收清单夹在页面右上角，点夹具拉出来逐条打勾。
          </p>
        </div>
        <PracticeWorkspace />
        <SiteFooter />
      </main>
    </div>
  )
}
