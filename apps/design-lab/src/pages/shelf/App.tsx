/** 组合场景＝大部分组件拿出来的真实使用，不做解释性标注：
 * 入口画像 → 课程卡与关系线 → 进度票券 → 指派块；形状散落于卡片附近空当。 */
import { Page } from '../../lib/ui'
import { ASSIGNMENT, CHAPTERS, EDGES } from '../../lib/chapters'
import { MemphisCard } from '../../components/MemphisCard'
import { RouteLine } from '../../components/RouteLine'
import { AssignBlock, Ticket } from '../../components/Ticket'
import { EntryGuide } from '../../components/EntryGuide'
import { Scatter } from '../../components/Scatter'
import { Bar, Cross, Ring, Tremble, Tri, Wave } from '../../components/shapes'

/* 场景坐标（复刻已验收组合）：卡1(40,110,250) 卡2(380,44,250,rot) 卡3(700,44,140) */
const nodes = {
  1: { id: 1, borderLeft: 40, right: 299, y: 180 },
  2: { id: 2, borderLeft: 378, right: 639, y: 108 },
  5: { id: 5, borderLeft: 698, right: 848, y: 108 },
} as const

export function App() {
  return (
    <Page
      tag="<Examples />"
      title="样例 · 组合场景"
      desc="大部分组件同台真实使用：入口画像 → 课程卡与关系线 → 进度票券 → 指派块；形状散落于卡片附近空当。"
    >
      <EntryGuide />
      <div className="relative mt-8 h-[600px] overflow-hidden rounded-2xl bg-paper">
        <Scatter
          shapes={[
            <Tri size={26} key="tri" />,
            <Ring size={22} key="ring" />,
            <Cross size={20} key="cross1" />,
            <Cross size={18} key="cross2" />,
            <Wave size={44} key="wave" />,
            <Bar size={30} key="bar" />,
            <Tremble size={20} key="tremble" />,
          ]}
        />
        <RouteLine edges={EDGES} nodes={nodes} width={1160} height={600} />
        <div className="absolute left-[40px] top-[110px] w-[250px]"><MemphisCard chapter={CHAPTERS[1]} entry={1} /></div>
        <div className="absolute left-[380px] top-[44px] w-[250px] -rotate-1"><MemphisCard chapter={CHAPTERS[2]} entry={2} /></div>
        <div className="absolute left-[700px] top-[44px] w-[140px]"><MemphisCard chapter={CHAPTERS[5]} compact /></div>
        <div className="absolute left-[860px] top-[320px]"><AssignBlock {...ASSIGNMENT} /></div>
        <div className="absolute left-[60px] top-[440px] flex gap-4">
          <Ticket chapter={CHAPTERS[2]} done />
          <Ticket chapter={CHAPTERS[5]} done={false} />
        </div>
      </div>
    </Page>
  )
}
