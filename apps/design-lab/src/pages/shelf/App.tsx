import { Page } from '../../lib/ui'
import { ASSIGNMENT, CHAPTERS, EDGES } from '../../lib/chapters'
import { MemphisCard } from '../../components/MemphisCard'
import { RouteLine } from '../../components/RouteLine'
import { AssignBlock } from '../../components/Ticket'
import { Bar, Cross, MissMark, Ring, Tremble, Tri, Wave } from '../../components/shapes'

/* 场景坐标（复刻已验收组合）：卡1(40,110,250) 卡2(380,44,250,rot) 卡3(700,44,140) */
const nodes = {
  1: { id: 1, borderLeft: 40, right: 299, y: 180 },
  2: { id: 2, borderLeft: 378, right: 639, y: 108 },
  4: { id: 4, borderLeft: 698, right: 848, y: 108 },
} as const

const SCATTER = [
  { el: <Tri size={26} />, x: 470, y: 14 },
  { el: <Ring size={22} />, x: 830, y: 150 },
  { el: <Cross size={20} />, x: 640, y: 440 },
  { el: <Cross size={18} />, x: 828, y: 218 },
  { el: <Wave size={44} />, x: 40, y: 316 },
  { el: <Bar size={30} />, x: 262, y: 548 },
  { el: <Tremble size={20} />, x: 96, y: 496 },
]

export function App() {
  return (
    <Page tag="<Examples />" title="样例 · 组合场景" desc="全系统同台：拟物卡＋三种关系线＋指派块与脱靶标记＋散落语义形状——实现验收的对照图。">
      <div className="relative h-[620px] overflow-hidden rounded-2xl bg-paper">
        <RouteLine edges={EDGES} nodes={nodes} width={1160} height={620} />
        {SCATTER.map((s, i) => (
          <div key={i} className="absolute" style={{ left: s.x, top: s.y }}>{s.el}</div>
        ))}
        <div className="absolute left-[40px] top-[110px] w-[250px]"><MemphisCard chapter={CHAPTERS[1]} entry={1} /></div>
        <div className="absolute left-[380px] top-[44px] w-[250px] -rotate-1"><MemphisCard chapter={CHAPTERS[2]} entry={2} /></div>
        <div className="absolute left-[700px] top-[44px] w-[140px]"><MemphisCard chapter={CHAPTERS[5]} compact /></div>
        <div className="absolute left-[380px] top-[300px]"><AssignBlock {...ASSIGNMENT} /></div>
        <div className="absolute left-[60px] top-[420px] w-[280px]">
          <div className="mb-2"><Wave size={40} /></div>
          <p className="m-0 text-[11px] text-body"><b>代理区</b>：安装交给 agent，只验收产物</p>
          <div className="mt-3 flex items-center gap-2"><Bar size={30} /><span className="text-[11px] text-body"><b>价值区</b>：过程就地写清</span></div>
          <div className="mt-6"><MissMark how="装了但没跑" looks={ASSIGNMENT.miss.looks} /></div>
        </div>
        <p className="absolute bottom-4 left-[40px] m-0 text-[10.5px] text-mute">
          形状散落于空白，每个都有含义：▲ 靶子 · ● 积木 · ○ 预期 · ～ 代理区 · ▬ 价值区 · ⌇ 脱靶 · ＋ 指派；线：实＝先后 · 虚＝相关 · 点＝同族
        </p>
      </div>
    </Page>
  )
}
