/** 组合场景＝大部分组件拿出来的真实使用，不做解释性标注：
 * 入口画像 → 课程卡与关系线 → 进度票券 → 指派块；形状散落于卡片附近空当。 */
import { Page } from '../../lib/ui'
import { ASSIGNMENT, CHAPTERS, PROFILES } from '../../lib/chapters'
import { MemphisCard } from '@stack/design-system'
import { AssignBlock, Ticket } from '@stack/design-system'
import { EntryGuide } from '@stack/design-system'
import { Scatter } from '@stack/design-system'
import { Cross, Ring, Tremble, Tri, Wave } from '@stack/design-system'

export function App() {
  return (
    <Page
      tag="<Examples />"
      title="样例 · 组合场景"
      desc="大部分组件同台真实使用：入口画像 → 课程卡与关系线 → 进度票券 → 指派块；形状散落于卡片附近空当。"
    >
      <EntryGuide chapters={CHAPTERS} profiles={PROFILES} />
      <div className="relative mt-8 h-[600px] overflow-hidden rounded-2xl bg-paper">
        <Scatter
          shapes={[
            <Tri size={26} key="tri" />,
            <Ring size={22} key="ring" />,
            <Cross size={20} key="cross1" />,
            <Cross size={18} key="cross2" />,
            <Wave size={44} key="wave" />,
            <Tremble size={20} key="tremble" />,
          ]}
        />
        <div className="absolute left-[40px] top-[110px] w-[250px]">
          <MemphisCard chapter={CHAPTERS[1]} entry={1} />
        </div>
        <div className="absolute left-[380px] top-[44px] w-[250px] -rotate-1">
          <MemphisCard chapter={CHAPTERS[2]} entry={2} />
        </div>
        <div className="absolute left-[700px] top-[44px] w-[140px]">
          <MemphisCard chapter={CHAPTERS[5]} compact />
        </div>
        <div className="absolute left-[820px] top-[320px]"><AssignBlock {...ASSIGNMENT} /></div>
        <div className="absolute left-[60px] top-[440px] flex gap-4">
          <Ticket chapter={CHAPTERS[2]} done />
          <Ticket chapter={CHAPTERS[5]} done={false} />
        </div>
      </div>
    </Page>
  )
}
