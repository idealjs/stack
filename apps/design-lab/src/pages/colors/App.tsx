import { Page, Section } from '../../lib/ui'

const PAIRS = [
  { a: '#FF6B6B', b: '#4ECDC4', name: '对 1 · coral × teal', use: '主用对：课程相框与主图形' },
  { a: '#FFD93D', b: '#A78BFA', name: '对 2 · mustard × violet', use: '辅助对：指派与脱靶等警示类' },
  { a: '#FF8FAB', b: '#5B8DEF', name: '对 3 · pink × blue', use: '点缀对：代理区与散落形状' },
]
const NEUTRALS = [
  { c: '#111111', n: 'ink', h: '#111111 · 描边/字/硬投影' },
  { c: '#FFF9F0', n: 'paper', h: '#FFF9F0 · 卡面/大底' },
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

/* 三条规则的「为什么」：鲜艳如何成立、如何被收束、注意力如何分配 */
const RULES = [
  {
    name: '相邻必撞色（跨对取色）',
    why: '孟菲斯的鲜艳靠碰撞成立：两个高饱和色块相邻时，只有色相拉开距离，视觉才读得出「两个声音」。同色相邻只是一个声音变大——画面发平发闷，鲜艳互相抵消；跨对取色（coral 挨 teal、mustard 挨 violet）反而把彼此衬得更亮。拿到相邻色块时问一句「它俩是不是同一对」，是，就换掉一个。',
    badCap: '同色相邻失去碰撞',
    goodCap: '相邻必撞色（跨对取色）',
    badDemo: <div className="flex overflow-hidden rounded-lg border-2 border-ink"><div className="h-10 w-20 bg-clash1a" /><div className="h-10 w-20 bg-clash1a" /></div>,
    goodDemo: <div className="flex overflow-hidden rounded-lg border-2 border-ink"><div className="h-10 w-20 bg-clash1a" /><div className="h-10 w-20 bg-clash1b" /></div>,
  },
  {
    name: '黑描边收束鲜艳',
    why: '高饱和色放在浅纸上会「振动」：边缘发虚、像悬浮在页面上。2px ink 描边给每块鲜艳一道明确的边界，把颜色关进形状里——这也是拟物卡世界的基础：卡片、形状、站点共用同一粗细的墨线，颜色再艳也是「零件」而不是「光」，缩放与低分屏上轮廓依然清晰。去掉描边，鲜艳就是没裁过的布料。',
    badCap: '无描边的鲜艳漂浮刺眼',
    goodCap: '一切鲜艳以 2px ink 描边为界',
    badDemo: <div className="h-10 w-40 rounded-lg bg-clash2a" />,
    goodDemo: <div className="h-10 w-40 rounded-lg border-2 border-ink bg-clash2a shadow-hard" />,
  },
  {
    name: '大底纸色，鲜艳只进局部',
    why: '鲜艳是注意力，铺满屏幕等于没有注意力。大底永远是 paper，鲜艳只进相框、站点、散落形状这些局部（≤10%/屏），视线才有落点、正文才永远可读；大底一旦鲜艳，字被淹没，卡片也失去「纸上的物」的载体感。记住层级：大底是世界，卡片是物，鲜艳是物上的标记。',
    badCap: '大底鲜艳，字被淹没',
    goodCap: '大底纸色，鲜艳只进局部',
    badDemo: <div className="flex h-10 w-40 items-center justify-center rounded-lg border-2 border-ink bg-clash1b text-[11px] font-bold">大底鲜艳</div>,
    goodDemo: <div className="flex h-10 w-40 items-center justify-center rounded-lg border-2 border-ink bg-paper text-[11px] font-bold">纸底安放正文</div>,
  },
]

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
        <div className="grid grid-cols-2 gap-3">{NEUTRALS.map((x) => <Chip key={x.n} {...x} />)}</div>
      </Section>
      <Section label="章节色" note="六章六色，只进 16:9 相框与图标瓦">
        <div className="grid grid-cols-6 gap-3">{CHAPTERS6.map((x) => <Chip key={x.n} {...x} h={x.c} />)}</div>
      </Section>
      <Section label="规则与反例" note="先讲为什么这样设计，再看 ✗/✓ 对照">
        <div className="space-y-5">
          {RULES.map((r, i) => (
            <div key={r.name}>
              <div className="flex items-baseline gap-2">
                <span className="flex h-[18px] w-[18px] shrink-0 translate-y-[2px] items-center justify-center rounded-full border-2 border-ink bg-ink text-[10px] font-extrabold text-paper">{i + 1}</span>
                <b className="text-[13px]">{r.name}</b>
              </div>
              <p className="m-0 mt-1.5 mb-2 max-w-[760px] text-[11.5px] leading-relaxed text-body">{r.why}</p>
              <div className="grid grid-cols-2 gap-3">
                <DoDont bad text={r.badCap}>{r.badDemo}</DoDont>
                <DoDont text={r.goodCap}>{r.goodDemo}</DoDont>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}
