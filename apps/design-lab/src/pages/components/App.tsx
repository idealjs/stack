import { Page, Section } from '../../lib/ui'
import { ASSIGNMENT, CHAPTERS, EDGES, PROFILES } from '../../lib/chapters'
import { RouteLine } from '@stack/design-system'
import { MemphisCard } from '@stack/design-system'
import { AssignBlock, ChapterTicket } from '@stack/design-system'
import { TicketPreview } from '../../components/TicketPreview'
import { EntryGuide } from '@stack/design-system'
import { Mark } from '@stack/design-system'

/* RouteLine 演示坐标（节点＝卡描边真实边缘） */
const nodes = {
  1: { id: 1, borderLeft: 40, right: 290, y: 180 },
  2: { id: 2, borderLeft: 380, right: 630, y: 108 },
  5: { id: 5, borderLeft: 700, right: 840, y: 108 },
} as const

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

      <Section label="RouteLine" note="实=先后 虚=相关 点=同族；hover 卡片，线与站点自动跟随（组件自带）">
        <div className="relative h-[600px] overflow-hidden rounded-2xl bg-paper">
          <RouteLine edges={EDGES} nodes={nodes} width={1160} height={600} />
          <div className="absolute left-[40px] top-[110px] w-[250px]"><MemphisCard chapter={CHAPTERS[1]} /></div>
          <div className="absolute left-[380px] top-[44px] w-[250px] -rotate-1"><MemphisCard chapter={CHAPTERS[2]} /></div>
          <div className="absolute left-[700px] top-[44px] w-[140px]"><MemphisCard chapter={CHAPTERS[5]} compact /></div>
        </div>
      </Section>
      <Section label="票券 ＆ 指派学习块" note="票=完成状态；块=位置/预期/场景＋脱靶标记">
        <div className="flex flex-wrap items-start gap-8">
          <ChapterTicket chapter={CHAPTERS[1]} done />
          <ChapterTicket chapter={CHAPTERS[5]} done={false} />
          <AssignBlock {...ASSIGNMENT} />
        </div>
      </Section>
      <Section label="Ticket · 可配置票券" note="孔位支持 px、百分比与 calc()；孔径单位 px；hover 浮起 3px，阴影 5→8px">
        <TicketPreview />
      </Section>
      <Section label="入口梳理" note="推荐不是强制——无锁">
        <EntryGuide chapters={CHAPTERS} profiles={PROFILES} />
      </Section>
    </Page>
  )
}
