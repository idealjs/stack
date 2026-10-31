import { SiteSidebar } from '../../design-system'
import { SiteFooter } from '../../lib/site'
import { SITE_NAV } from '../../lib/ui'
import { PracticeWorkspace } from './components/PracticeWorkspace'

export function App() {
  return (
    <div className="flex min-h-dvh text-content text-body">
      <SiteSidebar brand={SITE_NAV.brand} rows={SITE_NAV.rows} active="practice" />
      <main className="mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-3 py-4 max-lg:pr-12 max-lg:pt-16">
        <div className="mb-4">
          <h1 className="m-0 text-t1 font-extrabold text-ink">在线练习</h1>
          <p className="m-0 mt-1.5 text-content text-mute">
            沙箱写真跑：web runner 沙箱预览与 playground
            编辑器同住右缘侧栏——点紫色的「沙箱预览」签直接看沙箱，点「编辑器」签写码；点「运行
            ▶」构建产物送进隔离 iframe
            执行，并自动切到沙箱页签；侧栏展开时页面罩上灰色蒙版，点蒙版或按 Esc 收回。右上角「💡
            tips」拉出操作流水线，点任意一步，提示词自动填进陪练 agent
            输入框，回车即发；验收清单夹在页面右上角，点夹具拉出来逐条打勾。
          </p>
        </div>
        <PracticeWorkspace />
        <SiteFooter />
      </main>
    </div>
  )
}
