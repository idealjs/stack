import * as styles from '@idealjs/stack-ui-kit/styles'
import { Button } from '@idealjs/stack-ui-kit'
import { MONTHS } from '../../content/blogs'
import { relHref } from '../../lib/pages'
import { Page } from '../../lib/ui'

export function App() {
  return (
    <Page active="index" title="idealjs stack" subtitle="从第一个网页，到完整的应用。">
      <div className="max-w-[72ch]">
        <p className={`m-0 ${styles.textContent}`}>
          通过全栈工程师教程，逐步学习前端、后端与工程实践；
        </p>
        <div className="mt-2.5">
          <Button tone="clash1a" href={relHref('index', 'learn')}>
            开始学习 <span aria-hidden="true">→</span>
          </Button>
        </div>
        <p className={`mb-0 mt-7 ${styles.textContent}`}>在博客中，分享开发过程中的经验与思考。</p>
        <div className="mt-2.5">
          {MONTHS[0] && (
            <Button tone="clash2a" href={relHref('index', `blog-${MONTHS[0].key}`)}>
              阅读博客 <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
        <p className={`mb-0 mt-7 ${styles.textContent}`}>
          在线练习场正在以 ESM + MCP 的形式重建；在那之前，从教程开始、在本地环境跟练。
        </p>
        <div className="mt-2.5">
          <Button tone="clash2b" href={relHref('index', 'practice')}>
            打开在线练习场
          </Button>
        </div>
      </div>
    </Page>
  )
}
