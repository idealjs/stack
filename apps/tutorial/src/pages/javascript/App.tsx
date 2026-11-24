import * as styles from '@idealjs/stack-ui-kit/styles'
import { Button } from '@idealjs/stack-ui-kit'
import { relHref } from '../../lib/pages'
import { Page, Section } from '../../lib/ui'

export function App() {
  return (
    <Page active="javascript" title="JavaScript" desc="技能熟悉 · 让页面响应操作、管理数据。">
      <Section label="这一页讲什么" note="内容建设中 · 逐步补充">
        <div className="max-w-[70ch] space-y-3">
          <p className="m-0 leading-[1.75]">
            JavaScript 是处理数据与交互的编程语言，DOM
            是它读取和修改页面的接口。在主线教程里，它用数组存放待办，响应添加、删除和勾选，再把变化呈现在页面上。
          </p>
          <p className={`m-0 leading-[1.75] ${styles.textBody}`}>
            专项教程将在这里逐步补充。想先动手做出点什么，直接走主线：
          </p>
        </div>
        <div className="mt-4">
          <Button href={relHref('javascript', 'learn')}>
            打开全栈教程 <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Section>
    </Page>
  )
}
