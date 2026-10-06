import { Page, Section } from '../../lib/ui'
import { ASSIGNMENT, CHAPTERS } from '../../lib/chapters'
import { MemphisCard } from '../../components/MemphisCard'
import { AssignBlock, Ticket } from '../../components/Ticket'
import { EntryGuide } from '../../components/EntryGuide'
import { Mark } from '../../components/shapes'

export function App() {
  return (
    <Page
      tag="<Components />"
      title="组件 · 入口载体与状态"
      desc="CourseCard（入口）· 票券（状态）· 指派块＋脱靶标记（任务与警示）· 入口画像。线条的形式规格见 02 符号形状，与卡片的实际组合见 04 样例。"
    >
      <Section label="CourseCard" note="卡头三件套＝靶子；hover 拿起播放 GIF，8000ms 翻转；末张＝价值区标记用法">
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-[280px]"><MemphisCard chapter={CHAPTERS[1]} entry={1} /></div>
          <div className="w-[280px]"><MemphisCard chapter={CHAPTERS[2]} entry={2} /></div>
          <div className="w-[160px]"><MemphisCard chapter={CHAPTERS[5]} compact /></div>
          <div className="w-[280px]">
            <MemphisCard
              chapter={CHAPTERS[4]}
              zoneText={<>这一步过程就地写清：<Mark>环境与依赖如何咬合</Mark></>}
            />
          </div>
        </div>
      </Section>
      <Section label="票券 ＆ 指派学习块" note="票=完成状态；块=位置/预期/场景＋脱靶标记">
        <div className="flex flex-wrap items-start gap-8">
          <Ticket chapter={CHAPTERS[1]} done />
          <Ticket chapter={CHAPTERS[5]} done={false} />
          <AssignBlock {...ASSIGNMENT} />
        </div>
      </Section>
      <Section label="入口梳理" note="推荐不是强制——无锁">
        <EntryGuide />
      </Section>
    </Page>
  )
}
