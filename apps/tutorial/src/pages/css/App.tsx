import * as styles from '@idealjs/stack-ui-kit/styles'
import { Button } from '@idealjs/stack-ui-kit'
import { relHref } from '../../lib/pages'
import { Page, Section } from '../../lib/ui'

export function App() {
  return (
    <Page active="css" title="CSS" desc="技能熟悉 · 用选择器与布局控制样式。">
      <Section label="这一页讲什么" note="内容建设中 · 逐步补充">
        <div className="max-w-[70ch] space-y-3">
          <p className="m-0 leading-[1.75]">
            CSS 是描述页面外观的样式语言：选择器匹配元素，决定布局、颜色和字体。
            在主线教程里，它排列待办条目、为已完成的任务划上删除线，并让页面适配不同屏幕。
          </p>
          <p className={`m-0 leading-[1.75] ${styles.textBody}`}>
            专项教程将在这里逐步补充。想先动手做出点什么，直接走主线：
          </p>
        </div>
        <div className="mt-4">
          <Button href={relHref('css', 'learn')}>
            打开全栈教程 <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Section>
    </Page>
  )
}
