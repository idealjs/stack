import { Page, Section } from '../../lib/ui'

const PAIRS = [
  { a: '#FF6B6B', b: '#4ECDC4', name: '对 1 · coral × teal', use: '主用对：课程相框与主图形' },
  { a: '#FFD93D', b: '#A78BFA', name: '对 2 · mustard × violet', use: '辅助对：指派与脱靶等警示类' },
  { a: '#FF8FAB', b: '#5B8DEF', name: '对 3 · pink × blue', use: '点缀对：代理区与散落形状' },
]
const NEUTRALS = [
  { c: '#111111', n: 'ink', h: '#111111 · 描边/字/硬投影' },
  { c: '#FFF9F0', n: 'paper', h: '#FFF9F0 · 卡面/大底' },
  { c: '#FFFFFF', n: 'stack-1', h: '#FFFFFF · 纸叠亮边' },
  { c: '#EADFC4', n: 'stack-2', h: '#EADFC4 · 纸叠暗层' },
]
const CHAPTERS6 = [
  { c: '#FF6B6B', n: 'ch1 快速开始' }, { c: '#FF8FAB', n: 'ch2 React' }, { c: '#FFD93D', n: 'ch3 更多示例' },
  { c: '#4ECDC4', n: 'ch4 更多' }, { c: '#5B8DEF', n: 'ch5 全栈基础' }, { c: '#A78BFA', n: 'ch6 高级教程' },
]

function Chip({ c, n, h }: { c: string; n: string; h: string }) {
  return (
    <div>
      <div className="h-12 rounded-[10px] border-2 border-ink" style={{ background: c }} />
      <div className="mt-1 whitespace-nowrap text-[10.5px] font-bold">{n}</div>
      <div className="whitespace-nowrap font-mono text-[9px] text-[#6b6b6b]">{h}</div>
    </div>
  )
}

function DoDont({ bad, children, text }: { bad?: boolean; children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink text-[11px] font-extrabold ${bad ? 'bg-clash1a text-paper' : 'bg-clash1b'}`}>
        {bad ? '✗' : '✓'}
      </span>
      {children}
      <p className="m-0 flex-1 text-[11.5px] leading-snug text-body">{text}</p>
    </div>
  )
}

export function App() {
  return (
    <Page tag="<Colors />" title="颜色 · 鲜艳与碰撞" desc="三组撞色对轮转，黑描边收束一切鲜艳，大底永远是纸色。章节色只进相框，状态不用颜色——用形状。">
      <Section label="撞色对" note="相邻的鲜艳必须来自不同对">
        <div className="grid grid-cols-3 gap-4">
          {PAIRS.map((p) => (
            <div key={p.name}>
              <div className="flex overflow-hidden rounded-xl border-2 border-ink">
                <div className="h-11 w-[88px]" style={{ background: p.a }} />
                <div className="h-11 w-[88px]" style={{ background: p.b }} />
              </div>
              <div className="mt-1.5 text-[11px] font-bold">{p.name}</div>
              <div className="text-[10px] text-[#555]">{p.use}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="中性阶" note="纸的世界——字、边、投影、底">
        <div className="grid grid-cols-4 gap-3">{NEUTRALS.map((x) => <Chip key={x.n} {...x} />)}</div>
      </Section>
      <Section label="章节色" note="六章六色，只进 16:9 相框与图标瓦">
        <div className="grid grid-cols-6 gap-3">{CHAPTERS6.map((x) => <Chip key={x.n} {...x} h={x.c} />)}</div>
      </Section>
      <Section label="规则与反例" note="✗ 禁止 vs ✓ 正确">
        <div className="space-y-4">
          <DoDont bad text="同色相邻失去碰撞">
            <div className="flex overflow-hidden rounded-lg border-2 border-ink"><div className="h-10 w-20 bg-clash1a" /><div className="h-10 w-20 bg-clash1a" /></div>
          </DoDont>
          <DoDont text="相邻必撞色（跨对取色）">
            <div className="flex overflow-hidden rounded-lg border-2 border-ink"><div className="h-10 w-20 bg-clash1a" /><div className="h-10 w-20 bg-clash1b" /></div>
          </DoDont>
          <DoDont bad text="无描边的鲜艳漂浮刺眼">
            <div className="h-10 w-40 rounded-lg bg-clash2a" />
          </DoDont>
          <DoDont text="一切鲜艳以 2px ink 描边为界">
            <div className="h-10 w-40 rounded-lg border-2 border-ink bg-clash2a shadow-[4px_4px_0_var(--color-ink)]" />
          </DoDont>
          <DoDont bad text="大底鲜艳，字被淹没">
            <div className="flex h-10 w-40 items-center justify-center rounded-lg border-2 border-ink bg-clash1b text-[11px] font-bold">大底鲜艳</div>
          </DoDont>
          <DoDont text="大底纸色，鲜艳只进局部">
            <div className="flex h-10 w-40 items-center justify-center rounded-lg border-2 border-ink bg-paper text-[11px] font-bold">纸底安放正文</div>
          </DoDont>
        </div>
      </Section>
    </Page>
  )
}
