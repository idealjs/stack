/** idealjs stack 首页：教程、博客与浏览器练习场入口。 */
import { Page } from '../../lib/ui'
import { Button } from '@stack/design-system'
import { MONTHS } from '../../content/blogs'

export function App() {
  return (
    <Page active="index" title="idealjs stack" subtitle="从第一个网页，到完整的应用。">
      <div className="max-w-[72ch]">
        <p className="m-0 text-content">通过全栈工程师教程，逐步学习前端、后端与工程实践；</p>
        <div className="mt-2.5">
          <Button tone="clash1a" href="/learn.html">
            开始学习 <span aria-hidden="true">→</span>
          </Button>
        </div>
        <p className="mb-0 mt-7 text-content">在博客中，分享开发过程中的经验与思考。</p>
        <div className="mt-2.5">
          {MONTHS[0] && (
            <Button tone="clash2a" href={`/blog-${MONTHS[0].key}.html`}>
              阅读博客 <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
        <p className="mb-0 mt-7 text-content">
          在浏览器练习场中，通过 WebContainer 运行工程，与 Agent 一起编写、运行和改进代码。
        </p>
        <div className="mt-2.5">
          <Button tone="clash2b" href="/practice.html">打开在线练习场</Button>
        </div>
      </div>
    </Page>
  )
}
