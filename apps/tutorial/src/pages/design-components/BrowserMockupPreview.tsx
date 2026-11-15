import { BrowserMockup, Mark, ShadowButton } from '../../design-system'

export function BrowserMockupPreview() {
  return (
    <div data-testid="browser-mockup-preview" className="flex flex-wrap items-start gap-8">
      <div className="w-[min(380px,100%)]">
        <BrowserMockup url="https://stack.dev/design/components">
          <div className="flex h-56 flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="text-t3 font-extrabold">你好，取景框</div>
            <p className="m-0 text-small text-[#555]">
              纸面拟物 chrome：三圆点、放大镜地址栏、白底视口，内容即插槽。
            </p>
          </div>
        </BrowserMockup>
        <div className="mt-1 text-[13px] font-extrabold">1 · 基础取景框 · 定宽</div>
        <div className="text-small text-[#555]">
          360px 定宽，视口高度由内容撑起，URL 超长省略号截断
        </div>
      </div>
      <div className="min-w-[380px] flex-1">
        <BrowserMockup url="https://stack.dev/learn" className="w-full">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-ink/10 bg-paper-deep px-4 py-2.5">
              <span className="text-[12px] font-extrabold">stack 迷你站</span>
              <span aria-hidden className="flex gap-1.5">
                <i className="size-2 rounded-full bg-clash1a" />
                <i className="size-2 rounded-full bg-clash2a" />
                <i className="size-2 rounded-full bg-clash1b" />
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <h4 className="m-0 text-t2 font-extrabold">在取景框里排你的页面</h4>
              <p className="m-0 text-small text-[#555]">
                设计系统组件可以直接放进视口，比如这句里的<Mark>荧光标记</Mark>。
              </p>
              <ShadowButton>进入教程</ShadowButton>
            </div>
          </div>
        </BrowserMockup>
        <div className="mt-1 text-[13px] font-extrabold">2 · 宽幅 · w-full</div>
        <div className="text-small text-[#555]">
          外壳随容器铺满，视口内自由组合设计系统件（Mark、ShadowButton）
        </div>
      </div>
    </div>
  )
}
