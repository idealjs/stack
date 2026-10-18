import { Page, Section } from '../../lib/ui'
import { ChapterTicket, Stamp, Ring, Wave, Cross, BrickDot } from '@stack/design-system'
import { CHAPTERS } from '../../lib/chapters'
import type { ReactNode } from 'react'

/* 撕角 22px 的裁形（StickyNote 折角的同款语言，尺寸与折角方块对齐） */
const CLIP_TAG = '[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_22px),calc(100%_-_22px)_100%,0_100%)]'
/* 尖底书签的裁形（Bookmark 尖底的简化版） */
const TAG_CLIP = '[clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%_-_14px),0_100%)]'

/** 撕角便签：clip-path 裁形的元素会自成堆叠上下文——轮廓影必须由外层承担
 * （filter 先画影、clip 后裁形的机制顺序），className（drop-shadow-ink 等）落在外壳上 */
function TornNote({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className={`relative border-2 border-ink bg-clash2a px-5 py-4 text-small font-bold text-ink ${CLIP_TAG}`}>
        撕角便签
        <i aria-hidden className="absolute right-0 bottom-0 h-[22px] w-[22px] border-t-2 border-l-2 border-ink bg-paper-deep" />
      </div>
    </div>
  )
}

/** ✗/✓ 对照（对齐颜色册的规则反例版式） */
function DoDont({ bad = false, text, children }: { bad?: boolean; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink text-[11px] font-extrabold ${
            bad ? 'bg-clash1a text-paper' : 'bg-clash1b'
          }`}
        >
          {bad ? '✗' : '✓'}
        </span>
        <span className="text-small font-bold text-ink">{text}</span>
      </div>
      <div className="flex min-h-[96px] items-center rounded-xl border-2 border-dashed border-ink/25 bg-white p-4">{children}</div>
    </div>
  )
}

function Specimen({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div>
      {children}
      <div className="mt-1 text-small font-extrabold text-ink">{title}</div>
      {note && <div className="t-small-mute">{note}</div>}
    </div>
  )
}

/** 小节标题：t3 标题级（对齐字体册）——小节之间靠标题与留白分段，不靠小字 */
function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-9 mb-4 text-t3 font-extrabold text-ink">{children}</h3>
}

/** 粒子：实物＋一行标题＋各自的代码片段 */
function Particle({ title, code, children }: { title: string; code: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div className="hover-host flex h-[110px] items-center justify-center">{children}</div>
      <div className="text-small font-extrabold text-ink">{title}</div>
      <pre className="learning-demo-code m-0 w-full overflow-x-auto px-2 py-1 text-[11px]">{code}</pre>
    </div>
  )
}

export function App() {
  return (
    <Page
      active="design-shadow"
      title="阴影 · 硬投影与拿起"
      desc="一份投影配方的两个形态：矩形盒 shadow-ink、异形轮廓 drop-shadow-ink；拿起动效 hoverable-shadow 只叠不换底。"
    >
      {/* ① 基础单个应用 */}
      <Section label="基础单个应用" note="shadow-ink 管矩形盒、drop-shadow-ink 管异形轮廓——一个元素一次只用一份影">
        <H3>shadow-ink · 盒影</H3>
        <p className="m-0 mb-5 max-w-[720px] text-content leading-relaxed text-body">
          唯一配方 --shadow-ink: 5px 5px 0 ink。深影档 --shadow-ink-lift: 8px 8px 0 ink
          供需要强调的静态场景手动使用；hover 拿起不换档——影不参与动画。
        </p>
        <div className="flex flex-wrap items-start gap-10">
          <Specimen title="shadow-ink" note="静置档：实底纸卡与按钮用">
            <div className="w-[190px] rounded-xl border-2 border-ink bg-paper px-4 py-5 shadow-ink">
              <b className="text-small">纸卡 · 静置</b>
              <p className="m-0 t-small-mute">box-shadow 跟盒框走</p>
            </div>
          </Specimen>
          <Specimen title="shadow-ink-lift" note="深影档：静态场景手动使用">
            <div className="w-[190px] rounded-xl border-2 border-ink bg-paper px-4 py-5 shadow-ink-lift">
              <b className="text-small">纸卡 · 深影</b>
              <p className="m-0 t-small-mute">需要强调时手动换用</p>
            </div>
          </Specimen>
          <Specimen title="组件同款 · Stamp" note="rotate(-2°) 不换配方">
            <div className="flex h-[96px] items-center">
              <Stamp>已核对</Stamp>
            </div>
          </Specimen>
        </div>
        <pre className="learning-demo-code mt-5 max-w-[560px]">{`<div className="rounded-xl border-2 border-ink bg-paper shadow-ink">
  静置纸卡
</div>`}</pre>
        <H3>drop-shadow-ink · 轮廓影</H3>
        <p className="m-0 mb-5 max-w-[720px] text-content leading-relaxed text-body">
          filter 形态同值——影随轮廓走，不认盒框。clip-path 会自成堆叠上下文、把影裁掉，
          所以形状在内层、影在外壳，两层缺一不可（矩形和圆角盒不受影响，直接用 shadow-ink）。
        </p>
        <div className="flex flex-wrap items-start gap-10">
          <Specimen title="撕角便签 · 裸工具类" note="外壳拿 filter，内层拿 clip-path">
            <TornNote className="drop-shadow-ink w-fit" />
          </Specimen>
          <Specimen title="组件同款 · Ticket" note="影在 .ticket-shadow 外壳——撕线孔洞也跟着投影">
            <ChapterTicket chapter={CHAPTERS[1]} done />
          </Specimen>
        </div>
        <pre className="learning-demo-code mt-5 max-w-[620px]">{`{/* 外壳拿影，内层拿形 */}
<div className="drop-shadow-ink w-fit">
  <div className="… [clip-path:polygon(…)]">撕角便签</div>
</div>`}</pre>
      </Section>

      {/* ② 复合应用 */}
      <Section label="复合应用" note="hoverable-shadow 叠上去：只负责浮起 3px——影不参与动画，也就没有闪烁">
        <p className="m-0 mb-5 max-w-[720px] text-content leading-relaxed text-body">
          浮起用 translate 属性而非 transform：与既有 transform 动效（RouteLine 跟随、翻面、盖印）可组合、互不覆盖。
          注意 Button 等组件自写 hover 拿起，不要重复叠加。
        </p>
        <div className="flex flex-wrap items-start gap-10">
          <Specimen title="shadow-ink ＋ hoverable-shadow" note="矩形拿起">
            <div className="hover-host w-fit">
              <div className="shadow-ink hoverable-shadow w-[190px] cursor-pointer rounded-xl border-2 border-ink bg-paper px-4 py-5">
                <b className="text-small">矩形拿起</b>
                <p className="m-0 t-small-mute">hover：浮 3px</p>
              </div>
            </div>
          </Specimen>
          <Specimen title="drop-shadow-ink ＋ hoverable-shadow" note="异形拿起">
            <div className="hover-host w-fit">
              <TornNote className="drop-shadow-ink hoverable-shadow w-fit cursor-pointer" />
            </div>
          </Specimen>
        </div>
        <pre className="learning-demo-code mt-5 max-w-[620px]">{`<div className="shadow-ink hoverable-shadow …">矩形拿起</div>

<div className="drop-shadow-ink hoverable-shadow">
  <div className="… [clip-path:…]">异形拿起</div>
</div>`}</pre>
      </Section>

      {/* ③ 丰富样式组合粒子 */}
      <Section
        label="丰富样式组合粒子"
        note="同组两枚元素完全一致，只差 hoverable-shadow——全部可 hover，对照拿起前后的影距变化"
      >
        <H3>shadow-ink · 盒影粒子</H3>
        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle title="shadow-ink" code='<div className="shadow-ink">纸卡</div>'>
            <div className="w-[110px] rounded-xl border-2 border-ink bg-paper px-3 py-3 shadow-ink">
              <div className="flex items-center gap-1.5">
                <BrickDot on />
                <BrickDot />
                <Cross size={12} />
              </div>
              <p className="m-0 mt-1.5 text-[12px] font-bold text-ink">纸卡</p>
            </div>
          </Particle>
          <Particle title="＋ hoverable-shadow" code='<div className="shadow-ink hoverable-shadow">纸卡</div>'>
            <div className="shadow-ink hoverable-shadow w-[110px] cursor-pointer rounded-xl border-2 border-ink bg-paper px-3 py-3">
              <div className="flex items-center gap-1.5">
                <BrickDot on />
                <BrickDot />
                <Cross size={12} />
              </div>
              <p className="m-0 mt-1.5 text-[12px] font-bold text-ink">纸卡</p>
            </div>
          </Particle>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle title="shadow-ink · 圆牌" code='<div className="rounded-full shadow-ink">○</div>'>
            <div className="flex size-20 items-center justify-center rounded-full border-2 border-ink bg-clash2a shadow-ink">
              <Ring size={30} />
            </div>
          </Particle>
          <Particle title="＋ hoverable-shadow" code='<div className="rounded-full shadow-ink hoverable-shadow">○</div>'>
            <div className="shadow-ink hoverable-shadow flex size-20 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-clash2a">
              <Ring size={30} />
            </div>
          </Particle>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle title="shadow-ink · 色块（rotate）" code='<div className="-rotate-2 shadow-ink">色块</div>'>
            <div className="-rotate-2 rounded-lg border-2 border-ink bg-clash1a px-3 py-2 text-[12px] font-extrabold text-ink shadow-ink">
              <Wave size={22} />
              <div>色块</div>
            </div>
          </Particle>
          <Particle title="＋ hoverable-shadow" code='<div className="-rotate-2 shadow-ink hoverable-shadow">色块</div>'>
            <div className="-rotate-2 shadow-ink hoverable-shadow cursor-pointer rounded-lg border-2 border-ink bg-clash1a px-3 py-2 text-[12px] font-extrabold text-ink">
              <Wave size={22} />
              <div>色块</div>
            </div>
          </Particle>
        </div>

        <H3>drop-shadow-ink · 轮廓影粒子</H3>
        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle
            title="drop-shadow-ink · 撕角便签"
            code={`<div className="drop-shadow-ink">\n  <div className="[clip-path:…]">便签</div>\n</div>`}
          >
            <TornNote className="drop-shadow-ink w-fit" />
          </Particle>
          <Particle
            title="＋ hoverable-shadow"
            code={`<div className="drop-shadow-ink hoverable-shadow">\n  <div className="[clip-path:…]">便签</div>\n</div>`}
          >
            <TornNote className="drop-shadow-ink hoverable-shadow w-fit cursor-pointer" />
          </Particle>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle title="drop-shadow-ink · 尖底书签" code='<div className="drop-shadow-ink">标记</div>'>
            <div className="drop-shadow-ink w-fit">
              <div className={`px-4 pb-6 pt-3 text-[12px] font-extrabold text-ink bg-clash1b ${TAG_CLIP}`}>标记</div>
            </div>
          </Particle>
          <Particle title="＋ hoverable-shadow" code='<div className="drop-shadow-ink hoverable-shadow">标记</div>'>
            <div className="drop-shadow-ink hoverable-shadow w-fit cursor-pointer">
              <div className={`px-4 pb-6 pt-3 text-[12px] font-extrabold text-ink bg-clash1b ${TAG_CLIP}`}>标记</div>
            </div>
          </Particle>
          <Particle title="drop-shadow 系 · 票券（组件同款）" code='<Ticket className="drop-shadow-ink" hover />'>
            <ChapterTicket chapter={CHAPTERS[1]} done hover />
          </Particle>
        </div>

        {/* 现有组件归位一览（选影的参照表） */}
        <div className="mt-10">
          <b className="text-[13px]">现有组件归位一览</b>
          <p className="m-0 mt-1 mb-3 max-w-[760px] text-content leading-relaxed text-body">
            矩形盒影是默认，异形才动 filter——新组件按此选影。
          </p>
          <table className="w-full border-collapse text-small text-body">
            <thead>
              <tr className="border-b-2 border-[#d5d5d3] text-left text-ink">
                <th className="w-40 py-1 pr-2">影系</th>
                <th className="w-[400px] py-1 pr-2">组件</th>
                <th className="py-1 pr-2">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#ececea]">
                <td className="py-1.5 pr-2 align-top font-extrabold text-ink">
                  shadow-ink
                  <br />
                  <span className="t-small-mute font-normal">box-shadow</span>
                </td>
                <td className="py-1.5 pr-2 align-top">
                  Button · MemphisCard · RoutableCard · ShadowCard · ShadowButton · Stamp · ClipboardChecklist · FlashCard · ExperimentFrame ·
                  TaskEnvelope · DeliveryManifest · ComparisonBoard · BrickToolbox
                </td>
                <td className="py-1.5 pr-2 align-top">
                  实底矩形盒。Button / MemphisCard / RoutableCard / ShadowCard / ShadowButton 自写 hover 浮起（-3px，影不生长）；Stamp
                  rotate(-2°) 静置盖章、无动效。
                </td>
              </tr>
              <tr className="border-b border-[#ececea]">
                <td className="py-1.5 pr-2 align-top font-extrabold text-ink">
                  drop-shadow-ink
                  <br />
                  <span className="t-small-mute font-normal">filter</span>
                </td>
                <td className="py-1.5 pr-2 align-top">Ticket · ChapterTicket · StickyNote · Bookmark · FolderTabs · OutputReceipt</td>
                <td className="py-1.5 pr-2 align-top">
                  异形轮廓（打孔票、撕角、尖底书签、索引标签、回执）。影都在外壳层（.ticket-shadow / .learning-note /
                  .learning-bookmark-shell 等），形状在内层；Ticket hover 外壳整体浮 3px。
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 align-top font-extrabold text-ink">
                  自写小档
                  <br />
                  <span className="t-small-mute font-normal">3px → 5px</span>
                </td>
                <td className="py-1.5 pr-2 align-top">learning-action（各标本动作按钮）· 工位卡（DataFlowBoard）· 积木（BrickToolbox）</td>
                <td className="py-1.5 pr-2 align-top">学习工作台的按压语言（hover -2px），比主档低一级；未接 hoverable-shadow。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ④ 反例拆法对比 */}
      <Section label="反例拆法对比" note="两份影、被裁掉的影——都是层级放错，不是配方错">
        <div className="space-y-6">
          <div>
            <H3>反例一 · filter 与 clip-path 同元素——影子被一起裁掉</H3>
            <p className="m-0 mt-1 mb-2 max-w-[760px] text-content leading-relaxed text-body">
              filter 先画影、clip-path 后裁形：同一个元素上，影子刚画出来就被裁形剪掉。拆法＝外壳
              filter、内层裁形（Ticket 的 mask 与 .ticket-shadow、Bookmark 的外壳与尖底，都是这个分层）。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <DoDont bad text="影没了：clip 把 filter 的成果一起剪走">
                <div className={`relative drop-shadow-ink border-2 border-ink bg-clash2a px-5 py-4 text-small font-bold text-ink ${CLIP_TAG}`}>
                  影去哪了
                  <i aria-hidden className="absolute right-0 bottom-0 h-[22px] w-[22px] border-t-2 border-l-2 border-ink bg-paper-deep" />
                </div>
              </DoDont>
              <DoDont text="拆两层：外壳 filter，内层 clip-path">
                <TornNote className="drop-shadow-ink w-fit" />
              </DoDont>
            </div>
          </div>
          <div>
            <H3>反例二 · box-shadow 与 drop-shadow 叠出双影</H3>
            <p className="m-0 mt-1 mb-2 max-w-[760px] text-content leading-relaxed text-body">
              box-shadow 认盒框、不认轮廓：异形元素再留一份盒影，矩形影就从轮廓影后面探出来（普通矩形上两影恰好重合、看似无事，形状一异形立刻分家）。拆法＝一个元素只留一份影：形状影交给内层
              wrapper（Ticket 的 .ticket-shadow 包裹法），外壳最多保留 hover 的 translate。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <DoDont bad text="双影：外壳盒影＋内层轮廓影">
                <div className="shadow-ink w-fit">
                  <TornNote className="drop-shadow-ink" />
                </div>
              </DoDont>
              <DoDont text="只留一份：异形影归内层 wrapper">
                <TornNote className="drop-shadow-ink w-fit" />
              </DoDont>
            </div>
          </div>
        </div>
      </Section>
    </Page>
  )
}
