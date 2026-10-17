import { Page, Section } from '../../lib/ui'
import { ChapterTicket, Stamp, Tri, Ring, Wave, Cross, BrickDot } from '@stack/design-system'
import { CHAPTERS } from '../../lib/chapters'
import type { ReactNode } from 'react'

/* 撕角 22px 的裁形（StickyNote 折角的同款语言，尺寸与折角方块对齐）。
 * 本页标本零新增 CSS：全部由既有 token 生成的工具类拼出。 */
const CLIP_TAG = '[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_22px),calc(100%_-_22px)_100%,0_100%)]'
/* 尖底书签的裁形（Bookmark 尖底的简化版） */
const TAG_CLIP = '[clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%_-_14px),0_100%)]'

/** 撕角便签：裁形归内层、影归外壳——className（drop-shadow-hard 等）落在外壳上 */
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

function Specimen({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div>
      {children}
      <div className="mt-1 text-[13px] font-extrabold">{title}</div>
      <div className="text-small text-[#555]">{note}</div>
    </div>
  )
}

/** 粒子墙的单格：实物居中＋一行小注 */
function Particle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div className="flex h-[120px] items-center justify-center">{children}</div>
      <div className="text-center text-[12px] font-bold leading-snug text-ink">{title}</div>
    </div>
  )
}

export function App() {
  return (
    <Page
      active="design-shadow"
      title="阴影 · 硬投影与拿起"
      desc="一份投影配方的两个形态：矩形盒 shadow-hard、异形轮廓 drop-shadow-hard；拿起动效 hoverable-shadow 只叠不换底。"
    >
      {/* ① 基础单个应用：两种影各自的单发用法 */}
      <Section label="基础单个应用" note="shadow-hard 管矩形盒、drop-shadow-hard 管异形轮廓——一个元素一次只用一份影">
        <div className="mb-6">
          <b className="text-[13px]">shadow-hard · 矩形盒影</b>
          <p className="m-0 mt-1 mb-3 max-w-[760px] text-content leading-relaxed text-body">
            唯一配方 --shadow-hard: 5px 5px 0 ink；拿起档 --shadow-hard-lift: 8px 8px 0 ink——静置不用，hover 拿起时才换入。
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <Specimen title="shadow-hard" note="静置档：实底纸卡与按钮用">
              <div className="w-[190px] rounded-xl border-2 border-ink bg-paper px-4 py-5 shadow-hard">
                <b className="text-small">纸卡 · 静置</b>
                <p className="m-0 t-small-mute">box-shadow 跟盒框走</p>
              </div>
            </Specimen>
            <Specimen title="shadow-hard-lift" note="拿起档：只作为 hover 终态出现">
              <div className="w-[190px] rounded-xl border-2 border-ink bg-paper px-4 py-5 shadow-hard-lift">
                <b className="text-small">纸卡 · 拿起档</b>
                <p className="m-0 t-small-mute">经 hoverable-shadow 换入</p>
              </div>
            </Specimen>
            <Specimen title="组件同款 · Stamp" note="矩形章也压 shadow-hard，rotate(-2°) 不换配方">
              <div className="flex h-[96px] items-center">
                <Stamp>已核对</Stamp>
              </div>
            </Specimen>
          </div>
          <pre className="learning-demo-code mt-4 max-w-[560px]">{`<div className="rounded-xl border-2 border-ink bg-paper shadow-hard">
  静置纸卡
</div>`}</pre>
        </div>

        <div>
          <b className="text-[13px]">drop-shadow-hard · 跟随轮廓的投影</b>
          <p className="m-0 mt-1 mb-3 max-w-[760px] text-content leading-relaxed text-body">
            filter 形态同值（5px 5px 0 ink）——影子跟轮廓走，不认盒框。裁形归内层、影归外壳，两层缺一不可。
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <Specimen title="撕角便签 · 裸工具类" note="外壳拿 filter，内层拿 clip-path">
              <TornNote className="drop-shadow-hard w-fit" />
            </Specimen>
            <Specimen title="组件同款 · Ticket" note="影在 .ticket-shadow 外壳——撕线孔洞也跟着投影">
              <ChapterTicket chapter={CHAPTERS[1]} done />
            </Specimen>
          </div>
          <pre className="learning-demo-code mt-4 max-w-[620px]">{`{/* 外壳拿影，内层拿形：filter 先画影、clip-path 后裁形，
    同元素叠会连影一起裁掉（见反例拆法） */}
<div className="drop-shadow-hard w-fit">
  <div className="… [clip-path:polygon(…)]">撕角便签</div>
</div>`}</pre>
        </div>
      </Section>

      {/* ② 复合应用：hoverable-shadow 叠在基础影上 */}
      <Section
        label="复合应用"
        note="hoverable-shadow 叠上去：动效层认名字不认顺序，浮 3px＋按同元素的基础类换 lift 档；translate 属性动效，与 transform 互不打架"
      >
        <p className="m-0 mb-3 max-w-[760px] text-content leading-relaxed text-body">
          组合规则一条：<b>动效层认名字，不认顺序</b>——同元素叠了 shadow-hard 就换盒影档，叠了
          drop-shadow-hard 就换滤镜档，一个都不叠就只浮起。类名先后不影响行为，但建议基础类在前、动效层在后，读作「一张什么影的卡＋会拿起」。
        </p>
        <div className="flex flex-wrap items-start gap-8">
          <Specimen title="shadow-hard ＋ hoverable-shadow" note="矩形拿起：Button / MemphisCard 的既有拿起规格">
            <div className="shadow-hard hoverable-shadow w-[190px] cursor-pointer rounded-xl border-2 border-ink bg-paper px-4 py-5">
              <b className="text-small">矩形拿起</b>
              <p className="m-0 t-small-mute">hover：浮 3px，影 5→8</p>
            </div>
          </Specimen>
          <Specimen title="drop-shadow-hard ＋ hoverable-shadow" note="异形拿起：影换 lift 档的轮廓（8px）">
            <TornNote className="drop-shadow-hard hoverable-shadow w-fit cursor-pointer" />
          </Specimen>
          <Specimen title="hoverable-shadow 单独用" note="换档只认 shadow-hard / drop-shadow-hard 两个名字，自写影不换">
            <div className="shadow-[3px_3px_0_var(--color-ink)] hoverable-shadow w-[190px] cursor-pointer rounded-xl border-2 border-ink bg-paper px-4 py-5">
              <b className="text-small">自写小档</b>
              <p className="m-0 t-small-mute">hover：只浮起，影不换</p>
            </div>
          </Specimen>
        </div>
        <pre className="learning-demo-code mt-4 max-w-[620px]">{`<div className="shadow-hard hoverable-shadow …">矩形拿起</div>

<div className="drop-shadow-hard hoverable-shadow">
  <div className="… [clip-path:…]">异形拿起</div>
</div>

{/* 自写影只浮不换：动效层只服务两个既有名字 */}
<div className="shadow-[3px_3px_0_var(--color-ink)] hoverable-shadow …">…</div>`}</pre>
        <p className="m-0 mt-3 max-w-[760px] text-small leading-relaxed text-body">
          注意：Button 等组件内部已自写 hover 拿起（transition＋hover:* 工具类），不要再叠
          hoverable-shadow——拿起动效一处只写一份，两份 transition 会互相覆盖。
        </p>
      </Section>

      {/* ③ 丰富样式组合粒子：三种 classname 撒进形状与真实组件 */}
      <Section
        label="丰富样式组合粒子"
        note="把三种 classname 撒进形状与组件里——全部可 hover，感受矩形影/轮廓影与拿起动效的组合差异；末表为现有组件的归位一览"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-4 gap-y-8">
          <Particle title="shadow-hard · 纸卡">
            <div className="w-[120px] rounded-xl border-2 border-ink bg-paper px-3 py-3 shadow-hard">
              <div className="flex items-center gap-1.5">
                <BrickDot on />
                <BrickDot />
                <Cross size={12} />
              </div>
              <p className="m-0 mt-1.5 text-[12px] font-bold text-ink">纸卡</p>
            </div>
          </Particle>
          <Particle title="＋hoverable · 拿起">
            <div className="shadow-hard hoverable-shadow w-[120px] cursor-pointer rounded-xl border-2 border-ink bg-paper px-3 py-3">
              <div className="flex items-center gap-1.5">
                <BrickDot on />
                <BrickDot />
                <Cross size={12} />
              </div>
              <p className="m-0 mt-1.5 text-[12px] font-bold text-ink">纸卡</p>
            </div>
          </Particle>
          <Particle title="shadow-hard · 圆牌">
            <div className="flex size-20 items-center justify-center rounded-full border-2 border-ink bg-clash2a shadow-hard">
              <Ring size={30} />
            </div>
          </Particle>
          <Particle title="＋hoverable · 圆牌拿起">
            <div className="shadow-hard hoverable-shadow flex size-20 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-clash2a">
              <Tri size={26} />
            </div>
          </Particle>
          <Particle title="drop-shadow · 色块">
            <div className="-rotate-2 rounded-lg border-2 border-ink bg-clash1a px-3 py-2 text-[12px] font-extrabold text-ink drop-shadow-hard">
              <Wave size={22} />
              <div>色块</div>
            </div>
          </Particle>
          <Particle title="＋hoverable · 色块拿起">
            <div className="drop-shadow-hard hoverable-shadow rotate-2 cursor-pointer rounded-lg border-2 border-ink bg-clash3a px-3 py-2 text-[12px] font-extrabold text-ink">
              <Wave size={22} />
              <div>色块</div>
            </div>
          </Particle>
          <Particle title="drop-shadow · 尖底书签">
            <div className="drop-shadow-hard w-fit">
              <div className={`px-4 pb-6 pt-3 text-[12px] font-extrabold text-ink bg-clash1b ${TAG_CLIP}`}>标记</div>
            </div>
          </Particle>
          <Particle title="＋hoverable · 书签拿起">
            <div className="drop-shadow-hard hoverable-shadow w-fit cursor-pointer">
              <div className={`px-4 pb-6 pt-3 text-[12px] font-extrabold text-ink bg-clash1b ${TAG_CLIP}`}>标记</div>
            </div>
          </Particle>
          <Particle title="shadow-hard · 印章（rotate）">
            <Stamp>已核对</Stamp>
          </Particle>
          <Particle title="drop-shadow 系 · 票券（组件）">
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
                  shadow-hard
                  <br />
                  <span className="t-small-mute font-normal">box-shadow</span>
                </td>
                <td className="py-1.5 pr-2 align-top">
                  Button · MemphisCard · RoutableCard · ShadowCard · ShadowButton · Stamp · ClipboardChecklist · FlashCard · ExperimentFrame ·
                  TaskEnvelope · DeliveryManifest · ComparisonBoard · BrickToolbox
                </td>
                <td className="py-1.5 pr-2 align-top">
                  实底矩形盒。Button / MemphisCard / RoutableCard / ShadowCard / ShadowButton 自写 hover 拿起（-3px＋5→8，与 hoverable-shadow
                  同规格）；Stamp rotate(-2°) 静置盖章、无动效。
                </td>
              </tr>
              <tr className="border-b border-[#ececea]">
                <td className="py-1.5 pr-2 align-top font-extrabold text-ink">
                  drop-shadow-hard
                  <br />
                  <span className="t-small-mute font-normal">filter</span>
                </td>
                <td className="py-1.5 pr-2 align-top">Ticket · ChapterTicket · StickyNote · Bookmark · FolderTabs · OutputReceipt</td>
                <td className="py-1.5 pr-2 align-top">
                  异形轮廓（打孔票、撕角、尖底书签、索引标签、回执）。影都在外壳层（.ticket-shadow / .learning-note /
                  .learning-bookmark-shell 等），形状在内层；Ticket hover 连外壳 translate 一起换 lift 档。
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
            <b className="text-[13px]">反例一 · filter 与 clip-path 同元素——影子被一起裁掉</b>
            <p className="m-0 mt-1 mb-2 max-w-[760px] text-content leading-relaxed text-body">
              filter 先画影、clip-path 后裁形：同一个元素上，影子刚画出来就被裁形剪掉。拆法＝外壳
              filter、内层裁形（Ticket 的 mask 与 .ticket-shadow、Bookmark 的外壳与尖底，都是这个分层）。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <DoDont bad text="影没了：clip 把 filter 的成果一起剪走">
                <div className={`relative drop-shadow-hard border-2 border-ink bg-clash2a px-5 py-4 text-small font-bold text-ink ${CLIP_TAG}`}>
                  影去哪了
                  <i aria-hidden className="absolute right-0 bottom-0 h-[22px] w-[22px] border-t-2 border-l-2 border-ink bg-paper-deep" />
                </div>
              </DoDont>
              <DoDont text="拆两层：外壳 filter，内层 clip-path">
                <TornNote className="drop-shadow-hard w-fit" />
              </DoDont>
            </div>
          </div>
          <div>
            <b className="text-[13px]">反例二 · box-shadow 与 drop-shadow 叠出双影</b>
            <p className="m-0 mt-1 mb-2 max-w-[760px] text-content leading-relaxed text-body">
              box-shadow 认盒框、不认轮廓：异形元素再留一份盒影，矩形影就从轮廓影后面探出来（普通矩形上两影恰好重合、看似无事，形状一异形立刻分家）。拆法＝一个元素只留一份影：形状影交给内层
              wrapper（Ticket 的 .ticket-shadow 包裹法），外壳最多保留 hover 的 translate。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <DoDont bad text="双影：外壳盒影＋内层轮廓影">
                <div className="shadow-hard w-fit">
                  <TornNote className="drop-shadow-hard" />
                </div>
              </DoDont>
              <DoDont text="只留一份：异形影归内层 wrapper">
                <TornNote className="drop-shadow-hard w-fit" />
              </DoDont>
            </div>
          </div>
        </div>
      </Section>
    </Page>
  )
}
