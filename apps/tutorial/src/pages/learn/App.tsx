/** 开始学习——全栈学习路线：主线场景（快速开始 → React），RoutableCard 自报针脚免坐标 */
import { Page, Section } from '../../lib/ui'
import { RouteLine, RoutableScene, RoutableCard } from '@stack/design-system'
import type { LaneNode } from '@stack/design-system'
import { CHAPTERS } from '../../lib/chapters'

/* SSG 静态回退针脚（与卡片 md 定位一致；水合后实测接管） */
const nodes = {
  1: { id: 1, borderLeft: 40, right: 290, y: 180 },
  2: { id: 2, borderLeft: 380, right: 630, y: 108 },
} as const satisfies Partial<Record<number, LaneNode>>

export function App() {
  return (
    <Page
      active="learn"
      title="开始学习"
      desc="从第一个网页，到完整的应用——全栈学习路线从这里开始。"
    >
      <Section label="全栈学习路线" note="从快速开始出发，逐步学习 React、构建与前后端协作。">
        <p className="m-0 mb-3 max-w-[72ch] text-content text-body">
          每一步都有明确的目标和可检查的结果，帮助你做出应用，也理解它为什么能运行。
        </p>
        <RoutableScene className="grid justify-items-start gap-6 py-4 md:block md:h-[360px] md:py-0 [&>svg]:hidden md:[&>svg]:block">
          <RouteLine edges={[{ from: 1, to: 2, kind: 'seq' }]} nodes={nodes} width={1160} height={360} />
          <RoutableCard
            no={1}
            chapter={CHAPTERS[1]}
            href="/ch1.html"
            className="w-full max-w-[250px] md:absolute md:left-[40px] md:top-[110px]"
          />
          <RoutableCard
            no={2}
            chapter={CHAPTERS[2]}
            href="/ch2.html"
            className="w-full max-w-[250px] md:absolute md:left-[380px] md:top-[44px] md:-rotate-1"
          />
        </RoutableScene>
      </Section>
    </Page>
  )
}
