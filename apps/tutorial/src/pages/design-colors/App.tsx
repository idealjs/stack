import * as styles from '@idealjs/stack-ui-kit/styles'
import { Page, Section } from '../../lib/ui'

const PAIRS = [
  { a: '#FF6B6B', b: '#4ECDC4', name: '对 1 · coral × teal', use: '主用对：课程相框与主图形' },
  {
    a: '#FFD93D',
    b: '#A78BFA',
    name: '对 2 · mustard × violet',
    use: '辅助对：荧光标记、积木点等强调类',
  },
  { a: '#FF8FAB', b: '#5B8DEF', name: '对 3 · pink × blue', use: '点缀对：代理区与散落形状' },
]
const NEUTRALS = [
  { c: '#111111', n: 'ink', h: 'palette-black · 描边/字/硬投影' },
  { c: '#FFF9F0', n: 'paper', h: 'palette-cream · 卡面/大底' },
  { c: '#F2EAD9', n: 'paper-deep', h: 'palette-sand · 深纸/工具栏' },
  { c: '#8A7A5C', n: 'mute', h: 'palette-clay · 弱字/注释' },
  { c: '#3D3D3D', n: 'body', h: 'palette-graphite · 正文' },
]
const CHAPTERS6 = [
  { c: '#FF6B6B', n: 'ch1 快速开始' },
  { c: '#FF8FAB', n: 'ch2 React' },
  { c: '#FFD93D', n: 'ch3 更多示例' },
  { c: '#4ECDC4', n: 'ch4 更多' },
  { c: '#5B8DEF', n: 'ch5 全栈基础' },
  { c: '#A78BFA', n: 'ch6 高级教程' },
]

function Chip({ c, n, h }: { c: string; n: string; h: string }) {
  return (
    <div>
      <div
        className={`h-12 rounded-[10px] border-2 ${styles.borderInk}`}
        style={{ background: c }}
      />
      <div className={`mt-1 whitespace-nowrap ${styles.textSmall} font-bold`}>{n}</div>
      <div className={`whitespace-nowrap font-mono ${styles.tSmallMute}`}>{h}</div>
    </div>
  )
}

const RULES = [
  {
    name: '撞色定义',
    note: [
      '高饱和色块挨在一起，必须颜色差得够远；同色相邻没有对比，画面发闷。',
      '相邻色块要从不同的撞色对里取色——coral 挨 teal、mustard 挨 violet，彼此衬得更亮',
    ],
    badCap: '同色相邻失去碰撞',
    goodCap: '相邻必撞色（跨对取色）',
    badDemo: (
      <div className={`flex overflow-hidden rounded-lg border-2 ${styles.borderInk}`}>
        <div className={`h-10 w-20 ${styles.bgClash1a}`} />
        <div className={`h-10 w-20 ${styles.bgClash1a}`} />
      </div>
    ),
    goodDemo: (
      <div className={`flex overflow-hidden rounded-lg border-2 ${styles.borderInk}`}>
        <div className={`h-10 w-20 ${styles.bgClash1a}`} />
        <div className={`h-10 w-20 ${styles.bgClash1b}`} />
      </div>
    ),
  },
  {
    name: '描边定义',
    note: [
      '高饱和的颜色铺在浅色底上，会导致边缘发虚、像是摊在页面上。',
      '加 2px 黑描边和硬阴影，明确卡片的浮动效果；描边粗细全站统一，低分屏上轮廓依然清晰',
    ],
    badCap: '无描边的鲜艳摊平刺眼',
    goodCap: '一切鲜艳以 2px ink 描边为界',
    badDemo: <div className={`h-10 w-40 rounded-lg ${styles.bgClash2a}`} />,
    goodDemo: (
      <div
        className={`h-10 w-40 rounded-lg border-2 ${styles.borderInk} ${styles.bgClash2a} ${styles.shadowInk}`}
      />
    ),
  },
  {
    name: '底色定义',
    note: [
      '满屏铺鲜艳颜色会吸走用户注意力，但页面的焦点是文字。',
      '大底只用纸色，鲜艳只出现在相框、站点、散落形状这些局部（不超过一屏的 10%）',
    ],
    badCap: '大底鲜艳，字被淹没',
    goodCap: '大底纸色，鲜艳只进局部',
    badDemo: (
      <div
        className={`flex h-10 w-40 items-center justify-center rounded-lg border-2 ${styles.borderInk} ${styles.bgClash1b} text-[11px] font-bold`}
      >
        大底鲜艳
      </div>
    ),
    goodDemo: (
      <div
        className={`flex h-10 w-40 items-center justify-center rounded-lg border-2 ${styles.borderInk} ${styles.bgPaper} text-[11px] font-bold`}
      >
        纸底安放正文
      </div>
    ),
  },
]

function DoDont({
  bad,
  children,
  text,
}: {
  bad?: boolean
  children: React.ReactNode
  text: string
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 max-md:pb-1 md:flex-nowrap md:py-4 md:pl-4 md:pr-5">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${styles.borderInk} text-[11px] font-extrabold ${bad ? 'bg-clash1a text-paper' : 'bg-clash1b'}`}
      >
        {bad ? '✗' : '✓'}
      </span>
      {children}
      <p className={`m-0 flex-1 basis-[160px] ${styles.textSmall} leading-snug ${styles.textBody}`}>
        {text}
      </p>
    </div>
  )
}

export function App() {
  return (
    <Page
      active="design-colors"
      title="颜色 · 鲜艳与碰撞"
      desc="颜色分两层：色板描述（--palette-*，theme 换肤只切这层）与语义描述（--color-*，组件组成只消费这层）。三组撞色对轮转，黑描边收束一切鲜艳，大底永远是纸色。章节色只进相框，状态不用颜色——用形状。"
    >
      <Section label="撞色对" note="色板层——相邻的鲜艳必须来自不同对">
        <div className="grid grid-cols-3 gap-4">
          {PAIRS.map((p) => (
            <div key={p.name}>
              <div className={`flex overflow-hidden rounded-xl border-2 ${styles.borderInk}`}>
                <div className="h-11 w-[88px]" style={{ background: p.a }} />
                <div className="h-11 w-[88px]" style={{ background: p.b }} />
              </div>
              <div className="mt-1.5 text-[11px] font-bold">{p.name}</div>
              <div className={`${styles.textSmall} text-[#555]`}>{p.use}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="中性阶" note="语义层——纸的世界：字、边、投影、底">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {NEUTRALS.map((x) => (
            <Chip key={x.n} {...x} />
          ))}
        </div>
      </Section>
      <Section label="章节色" note="六章六色，只进 16:9 相框与图标瓦">
        <div className="grid grid-cols-6 gap-3">
          {CHAPTERS6.map((x) => (
            <Chip key={x.n} {...x} h={x.c} />
          ))}
        </div>
      </Section>
      <Section label="规则与反例" note="三条硬规则，✗/✓ 对照即规范">
        <div className="grid gap-4">
          {RULES.map((r, i) => (
            <div
              key={r.name}
              className={`grid gap-y-3 rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} p-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,1fr)] md:gap-y-0 md:divide-x-2 md:divide-ink/15 md:p-0`}
            >
              <div className="grid content-start gap-1.5 md:py-4 md:pr-4 md:pl-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${styles.borderInk} ${styles.bgInk} text-[10px] font-extrabold ${styles.textPaper}`}
                  >
                    {i + 1}
                  </span>
                  <b className="text-[13px]">{r.name}</b>
                </div>
                {r.note.map((para) => (
                  <p
                    key={para}
                    className={`m-0 indent-[2em] ${styles.textContent} ${styles.textBody}`}
                  >
                    {para}
                  </p>
                ))}
              </div>
              <DoDont bad text={r.badCap}>
                {r.badDemo}
              </DoDont>
              <DoDont text={r.goodCap}>{r.goodDemo}</DoDont>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}
