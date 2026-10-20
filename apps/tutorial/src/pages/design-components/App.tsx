import { Page, Section } from '../../lib/ui'
import { CHAPTERS, PROFILES } from '../../lib/chapters'
import { RouteLine } from '../../design-system'
import { MemphisCard } from '../../design-system'
import { ChapterTicket } from '../../design-system'
import { ShadowCard } from '../../design-system'
import { EntryGuide } from '../../design-system'
import { Mark } from '../../design-system'
import { Button } from '../../design-system'
import { ShadowButton } from '../../design-system'
import { RoutableScene, RoutableCard } from '../../design-system'
import { LearningKitGallery } from '../../design-system/examples/LearningKitGallery'
import { TicketPreview } from './TicketPreview'

const nodes = {
  1: { id: 1, borderLeft: 60, right: 240, y: 134 },
  2: { id: 2, borderLeft: 420, right: 600, y: 94 },
  5: { id: 5, borderLeft: 780, right: 960, y: 94 },
} as const

const LINES = [
  {
    d: 'M 8 34 H 60 A 8 8 0 0 0 68 26 V 18 A 8 8 0 0 1 76 10 H 180',
    w: 2.5,
    dash: '',
    cap: 'butt' as const,
    st: true,
    n: '实线 ＝ 先后',
    m: '推荐顺序 · 主线，唯一带站点',
  },
  {
    d: 'M 8 23 H 180',
    w: 2,
    dash: '4 2',
    cap: 'butt' as const,
    st: false,
    n: '虚线 ＝ 相关',
    m: '内容互参 · 无顺序，无站点',
  },
  {
    d: 'M 8 23 H 180',
    w: 2.4,
    dash: '0.1 6',
    cap: 'round' as const,
    st: false,
    n: '点线 ＝ 同族',
    m: '同一积木家族（教一块带一族）',
  },
]

export function App() {
  return (
    <Page
      active="design-components"
      title="组件 · 入口载体与学习工作台"
      desc="纸张、文具与学习工作台：12 种拟物学习组件，加上课程卡、关系线、票券与行动按钮。"
    >
      <Section label="拟物学习组件" note="点击、勾选、翻面和展开，试试纸张与文具的交互。">
        <LearningKitGallery />
      </Section>
      <Section
        label="CourseCard"
        note="卡头三件套＝靶子；hover 拿起播放 GIF，8000ms 翻转；末张＝价值区标记用法"
      >
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-[280px]">
            <MemphisCard chapter={CHAPTERS[1]} entry={1} />
          </div>
          <div className="w-[280px]">
            <MemphisCard chapter={CHAPTERS[2]} entry={2} />
          </div>
          <div className="w-[160px]">
            <MemphisCard chapter={CHAPTERS[5]} compact />
          </div>
          <div className="w-[280px]">
            <MemphisCard
              chapter={CHAPTERS[4]}
              zoneText={
                <>
                  这一步过程就地写清：<Mark>环境与依赖如何咬合</Mark>
                </>
              }
            />
          </div>
        </div>
      </Section>

      <Section
        label="RouteLine"
        note="实=先后（唯一带站点） 虚=相关 点=同族；横平竖直＋R8；并行不合并 4px；RoutableCard 自报针脚与卡片号，RouteLine 免 nodes；hover 卡片，线与站点自动跟随"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {LINES.map((l) => (
            <div key={l.n} className="rounded-xl border-2 border-ink bg-white p-3">
              <svg className="h-auto w-full" viewBox="0 0 188 44">
                <path
                  d={l.d}
                  stroke="var(--color-ink)"
                  strokeWidth={l.w}
                  fill="none"
                  strokeDasharray={l.dash}
                  strokeLinecap={l.cap}
                />
                {l.st && (
                  <>
                    <circle
                      cx="8"
                      cy="34"
                      r="5.5"
                      fill="var(--color-clash2a)"
                      stroke="var(--color-ink)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="181"
                      cy="10"
                      r="5.5"
                      fill="var(--color-clash1b)"
                      stroke="var(--color-ink)"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
              <div className="mt-1 text-[13px] font-extrabold">{l.n}</div>
              <div className="text-small text-[#555]">{l.m}</div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-ink bg-white p-3">
            <svg className="h-auto w-full" viewBox="0 0 188 44">
              <path
                d="M12 22 q10 -22 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
                stroke="var(--color-clash3b)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div className="mt-1 text-[13px] font-extrabold">波浪带 ＝ 代理交接</div>
            <div className="text-small text-[#555]">agent 边界 · 区域标记，不连线</div>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <RoutableScene height={340} className="min-w-[980px]">
            <RouteLine
              edges={[
                { from: 1, to: 2, kind: 'seq' },
                { from: 2, to: 5, kind: 'seq' },
                { from: 2, to: 5, kind: 'family' },
              ]}
              nodes={nodes}
              width={1160}
              height={340}
            />
            <RoutableCard
              no={1}
              title="快速开始"
              href="/ch1.html"
              className="absolute left-[60px] top-[110px] w-[180px]"
            />
            <RoutableCard
              no={2}
              title="React"
              href="/ch2.html"
              className="absolute left-[420px] top-[70px] w-[180px] -rotate-1"
            />
            <RoutableCard
              no={5}
              title="全栈基础"
              href="/ch5.html"
              className="absolute left-[780px] top-[70px] w-[180px]"
            />
          </RoutableScene>
        </div>
      </Section>
      <Section
        label="ShadowCard · 四部曲"
        note="基础阴影卡 → hover 拿起 → 撕线打孔 → 打孔 hover 拿起；硬阴影偏移 5px / 拿起 8px，票面先 mask 打孔，外层 drop-shadow 跟随打孔轮廓生成阴影"
      >
        <div className="flex flex-wrap items-start gap-8">
          <div>
            <ShadowCard className="h-[80px]" />
            <div className="mt-1 text-[13px] font-extrabold">1 · 基础 shadow-card</div>
            <div className="text-small text-[#555]">border-ink＋paper＋shadow-ink，内容空</div>
          </div>
          <div>
            <ShadowCard hover className="h-[80px]" />
            <div className="mt-1 text-[13px] font-extrabold">2 · hover 拿起</div>
            <div className="text-small text-[#555]">浮 3px＋阴影 5→8（同 Button 规格）</div>
          </div>
          <div>
            <ShadowCard ticket className="h-[80px]" />
            <div className="mt-1 text-[13px] font-extrabold">3 · ticket 打孔</div>
            <div className="text-small text-[#555]">同一张卡＋撕线＋咬边孔</div>
          </div>
          <div>
            <ShadowCard ticket hover className="h-[80px]" />
            <div className="mt-1 text-[13px] font-extrabold">4 · 打孔 hover 拿起</div>
            <div className="text-small text-[#555]">
              浮 3px＋阴影 5→8 跟随打孔轮廓（虚线撕线不动）
            </div>
          </div>
        </div>
      </Section>
      <Section label="票券" note="票=完成状态">
        <div className="flex flex-wrap items-start gap-8">
          <ChapterTicket chapter={CHAPTERS[1]} done />
          <ChapterTicket chapter={CHAPTERS[5]} done={false} />
        </div>
      </Section>
      <Section
        label="Ticket · 可配置票券"
        note="孔位支持 px、百分比与 calc()；孔径单位 px；hover 浮起 3px，阴影 5→8px"
      >
        <TicketPreview />
      </Section>
      <Section
        label="Button"
        note="tone＝clash 六色实底；有 href＝链接，无 href＝动作按钮；hover 上层浮起 3px、下层硬阴影 5px→8px 位移；disabled＝虚线占位，不动不起"
      >
        <div className="flex flex-wrap gap-3">
          <Button tone="clash1a">按钮</Button>
          <Button tone="clash1b">按钮</Button>
          <Button tone="clash2a">按钮</Button>
          <Button tone="clash2b">按钮</Button>
          <Button tone="clash3a">按钮</Button>
          <Button tone="clash3b">按钮</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button>动作按钮 · 无 href</Button>
          <Button disabled>占位 · 敬请期待</Button>
        </div>
      </Section>
      <Section
        label="ShadowButton · 按压三部曲"
        note="静置投影 3px → hover 浮 2px、投影涨到 5px → 按下压进 translate(2px,2px)、投影收 1px（同 learning-action 按压语言，比卡片 5px 小一号）；有 href＝链接 a、无 href＝动作按钮；站头导航与汉堡/× 同源换装"
      >
        <div className="flex flex-wrap items-center gap-4">
          <ShadowButton>默认 · paper</ShadowButton>
          <ShadowButton href="/learn.html">链接 · href 渲染 a</ShadowButton>
          <ShadowButton tone="clash1b">tone · clash1b</ShadowButton>
          <ShadowButton size="sm">紧凑 · sm</ShadowButton>
          <ShadowButton disabled>占位 · 虚线</ShadowButton>
        </div>
        <div className="mt-3 text-small text-[#555]">
          试着按下：鼠标按住不松，按钮朝阴影方向压进、投影收到 1px。
        </div>
      </Section>
      <Section label="入口梳理" note="推荐不是强制——无锁">
        <EntryGuide chapters={CHAPTERS} profiles={PROFILES} />
      </Section>
    </Page>
  )
}
