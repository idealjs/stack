import { Page, Section } from '../../lib/ui'
import { ASSIGNMENT, CHAPTERS } from '../../lib/chapters'
import { MemphisCard } from '../../components/MemphisCard'
import { RouteLine } from '../../components/RouteLine'
import { AssignBlock, Ticket } from '../../components/Ticket'
import { EntryGuide } from '../../components/EntryGuide'

const nodes = {
  1: { id: 1, borderLeft: 40, right: 299, y: 180 },
  2: { id: 2, borderLeft: 378, right: 639, y: 108 },
  5: { id: 5, borderLeft: 699, right: 848, y: 108 },
} as const

export function App() {
  return (
    <Page tag="<Components />" title="组件 · 入口载体与关系" desc="CourseCard（入口）· RouteLine（关系）· 票券（状态）· 指派块＋脱靶标记（任务与警示）· 入口画像。">
      <Section label="CourseCard" note="卡头三件套＝靶子；hover 拿起播放 GIF，8000ms 翻转">
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-[280px]"><MemphisCard chapter={CHAPTERS[1]} entry={1} /></div>
          <div className="w-[280px]"><MemphisCard chapter={CHAPTERS[2]} entry={2} /></div>
          <div className="w-[160px]"><MemphisCard chapter={CHAPTERS[5]} compact /></div>
        </div>
      </Section>
      <Section label="RouteLine" note="实=先后 虚=相关 点=同族；站点半嵌（左贴描边、右骑黑影外缘）">
        <div className="relative h-[240px] rounded-2xl border-2 border-dashed border-[#cfcfcd] bg-[#fbfbfa] p-0">
          <RouteLine edges={[{ from: 1, to: 2, kind: 'seq' }, { from: 2, to: 5, kind: 'seq' }, { from: 2, to: 5, kind: 'family' }]} nodes={nodes} width={880} height={240} />
          <div className="absolute left-[40px] top-[72px] w-[250px]"><MemphisCard chapter={CHAPTERS[1]} /></div>
          <div className="absolute left-[380px] top-0 w-[250px]"><MemphisCard chapter={CHAPTERS[2]} /></div>
          <div className="absolute left-[700px] top-0 w-[150px]"><MemphisCard chapter={CHAPTERS[5]} compact /></div>
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
