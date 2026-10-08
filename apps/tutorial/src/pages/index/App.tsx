/** 课程书架——教程首页：入口画像 → 六章卡片 → 关系与进度
 * 主线场景：hover 卡片时线与站点跟随浮起（状态提升到场景层） */
import { useState } from 'react'
import { Page, Section } from '../../lib/ui'
import { CHAPTERS } from '../../lib/chapters'
import { MemphisCard } from '../../components/MemphisCard'
import { EntryGuide } from '../../components/EntryGuide'
import { RouteLine } from '../../components/RouteLine'
import { Ticket } from '../../components/Ticket'
import type { ChapterId } from '../../lib/types'

/* 场景坐标（节点＝卡描边真实边缘）：卡1(40,110,250) 卡2(380,44,250,rot) 卡5(700,44,140) */
const nodes = {
  1: { id: 1, borderLeft: 40, right: 290, y: 180 },
  2: { id: 2, borderLeft: 380, right: 630, y: 108 },
  5: { id: 5, borderLeft: 700, right: 840, y: 108 },
} as const

const GRID: { id: ChapterId; entry?: 1 | 2 | 3 }[] = [
  { id: 1, entry: 1 },
  { id: 2, entry: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6, entry: 3 },
]

export function App() {
  const [hovered, setHovered] = useState<ChapterId | null>(null)
  return (
    <Page
      active="index"
      title="全栈工程师教程 · 书架"
      desc="靶子先行：每章先给目标、预期结果、积木清单，步骤只写「产出什么＋核对什么」；过程有没有学习价值，每步先分类。"
    >
      <Section label="入口画像" note="推荐不是强制——无锁">
        <EntryGuide />
      </Section>
      <Section label="六章" note="卡片是入口；点相框进入章节">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GRID.map(({ id, entry }) => (
            <MemphisCard key={id} chapter={CHAPTERS[id]} entry={entry} />
          ))}
        </div>
      </Section>
      <Section label="主线与进度" note="实线＝先后；点线＝同族；票券＝完成状态；hover 卡片，线与站点跟随浮起">
        <div className="relative h-[520px] overflow-hidden rounded-2xl bg-paper">
          <RouteLine
            edges={[
              { from: 1, to: 2, kind: 'seq' },
              { from: 2, to: 5, kind: 'seq' },
              { from: 2, to: 5, kind: 'family' },
            ]}
            nodes={nodes}
            width={1160}
            height={520}
            hovered={hovered}
          />
          <div
            className="absolute left-[40px] top-[110px] w-[250px]"
            onMouseEnter={() => setHovered(1)}
            onMouseLeave={() => setHovered(null)}
          >
            <MemphisCard chapter={CHAPTERS[1]} />
          </div>
          <div
            className="absolute left-[380px] top-[44px] w-[250px] -rotate-1"
            onMouseEnter={() => setHovered(2)}
            onMouseLeave={() => setHovered(null)}
          >
            <MemphisCard chapter={CHAPTERS[2]} />
          </div>
          <div
            className="absolute left-[700px] top-[44px] w-[140px]"
            onMouseEnter={() => setHovered(5)}
            onMouseLeave={() => setHovered(null)}
          >
            <MemphisCard chapter={CHAPTERS[5]} compact />
          </div>
          <div className="absolute left-[60px] top-[380px] flex gap-4">
            <Ticket chapter={CHAPTERS[1]} done />
            <Ticket chapter={CHAPTERS[5]} done={false} />
          </div>
        </div>
      </Section>
    </Page>
  )
}
