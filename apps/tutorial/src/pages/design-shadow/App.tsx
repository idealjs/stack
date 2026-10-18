/** 设计系统 · 阴影册——一份投影配方的 token 总表、拿起动效层与组件归位。
 * 全部样张直接用 tokens.css 的影 token（所见即 token）。 */
import { Page, Section } from '../../lib/ui'
import { ChapterTicket } from '@stack/design-system'
import { CHAPTERS } from '../../lib/chapters'
import type { ReactNode } from 'react'

/* 撕角 22px 的裁形（StickyNote 折角的同款语言，尺寸与折角方块对齐） */
const CLIP_TAG = '[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_22px),calc(100%_-_22px)_100%,0_100%)]'

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

/** 粒子：实物＋一行标题＋各自的代码片段。左右两枚完全一致，只差 hoverable-shadow。
 * 参照枚（静置）不接命中宿主——它不是交互物，页面首个 hover-host 必须是拿起枚（e2e 契约）。 */
function Particle({ title, code, host = true, children }: { title: string; code: string; host?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div className={`flex h-[110px] items-center justify-center ${host ? 'hover-host' : ''}`}>{children}</div>
      <div className="text-small font-extrabold text-ink">{title}</div>
      <pre className="learning-demo-code m-0 w-full overflow-x-auto px-2 py-1 text-[11px]">{code}</pre>
    </div>
  )
}

/** 影阶总览的格子：活样（自带 token 影）＋ token 名＋值＋用途 */
function TokenCell({ token, value, use, children }: { token: string; value: string; use: string; children: ReactNode }) {
  return (
    <td className="p-4 pr-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex h-[76px] min-w-[150px] items-center justify-center pb-1.5 pr-2">{children}</div>
        <div className="min-w-[220px] flex-1">
          <div className="font-mono text-[12px] font-extrabold text-ink">{token}</div>
          <div className="t-small-mute font-mono">{value}</div>
          <div className="mt-0.5 text-small text-body">{use}</div>
        </div>
      </div>
    </td>
  )
}

/** 小节标题：t3 标题级（对齐字体册）——小节之间靠标题与留白分段，不靠小字 */
function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-9 mb-4 text-t3 font-extrabold text-ink">{children}</h3>
}

/** 规则条目：编号圆＋名称＋为什么（对齐字体册/颜色册）＋可选 ✗/✓ 活样 */
function Rule({ n, name, why, demo }: { n: number; name: string; why: string; demo?: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="flex h-[18px] w-[18px] shrink-0 translate-y-[2px] items-center justify-center rounded-full border-2 border-ink bg-ink text-[10px] font-extrabold text-paper">{n}</span>
        <b className="text-t3">{name}</b>
      </div>
      <p className="m-0 mt-1.5 max-w-[760px] text-content leading-relaxed text-body">{why}</p>
      {demo && <div className="mt-3 grid grid-cols-2 gap-4">{demo}</div>}
    </div>
  )
}

/** 活样纸卡（盒影的对照物，两枚完全一致） */
function PaperCard({ hover = false }: { hover?: boolean }) {
  return (
    <div
      className={`w-[150px] rounded-xl border-2 border-ink bg-paper px-3.5 py-3 shadow-ink ${hover ? 'hoverable-shadow cursor-pointer' : ''}`}
    >
      <b className="text-small">纸卡</b>
      <p className="m-0 t-small-mute">hover 右枚对照</p>
    </div>
  )
}

export function App() {
  return (
    <Page
      active="design-shadow"
      title="阴影 · 一份配方，两档两形"
      desc="唯一投影配方 5px 5px 0 ink，派生四枚 token：两档（静置/拿起）× 两形（盒影/轮廓影）；拿起动效 hoverable-shadow 只叠不换底。"
    >
      {/* ① 影阶总览：两档 × 两形＝四枚 token */}
      <Section label="影阶总览" note="唯一配方 5px 5px 0 ink——两档 × 两形＝四枚 token，样张所见即 token">
        <p className="m-0 mb-5 max-w-[760px] text-content leading-relaxed text-body">
          全站只有一份投影配方：硬投影 5px 5px 0 var(--color-ink)——0 模糊、单一 ink、偏移即海拔。它按档位与绘制方式派生四枚 token：
          静置 5px、拿起 8px 两档；盒影（box-shadow，跟盒框走）与轮廓影（filter，跟轮廓走）两形。
          拿起不另设配方，只是静置→拿起换档。
        </p>
        <table className="w-full border-collapse text-small text-body">
          <thead>
            <tr className="border-b-2 border-[#d5d5d3] text-left text-ink">
              <th className="w-[130px] py-1 pr-2"><span className="t-small-strong">形 ＼ 档</span></th>
              <th className="py-1 pr-2"><span className="t-small-strong">静置档 · 5px 5px 0</span></th>
              <th className="py-1 pr-2"><span className="t-small-strong">拿起档 · 8px 8px 0</span></th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#ececea]">
              <th className="py-4 pr-2 text-left align-top">
                <b className="text-ink">盒影</b>
                <div className="t-small-mute">box-shadow<br />跟盒框走</div>
              </th>
              <TokenCell token="--shadow-ink" value="5px 5px 0 var(--color-ink)" use="实底矩形盒的默认——纸卡与卡片的静置档">
                <div className="w-[132px] rounded-xl border-2 border-ink bg-paper px-3 py-2.5 text-center shadow-ink">
                  <b className="text-small">纸卡</b>
                </div>
              </TokenCell>
              <TokenCell token="--shadow-ink-lift" value="8px 8px 0 var(--color-ink)" use="拿起档：hover 换档用；静态强调手动换用">
                <div className="w-[132px] rounded-xl border-2 border-ink bg-paper px-3 py-2.5 text-center shadow-ink-lift">
                  <b className="text-small">纸卡</b>
                </div>
              </TokenCell>
            </tr>
            <tr>
              <th className="py-4 pr-2 text-left align-top">
                <b className="text-ink">轮廓影</b>
                <div className="t-small-mute">filter<br />跟轮廓走</div>
              </th>
              <TokenCell token="--drop-shadow-ink" value="5px 5px 0 var(--color-ink)" use="异形轮廓的静置档——撕角、打孔票、尖底书签">
                <TornNote className="drop-shadow-ink w-fit" />
              </TokenCell>
              <TokenCell token="--drop-shadow-ink-lift" value="8px 8px 0 var(--color-ink)" use="异形的拿起档：hover 换档用">
                <TornNote className="drop-shadow-ink-lift w-fit" />
              </TokenCell>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ② 拿起 · hoverable-shadow：叠加层机制与活样对照 */}
      <Section label="拿起 · hoverable-shadow" note="叠加层：只管拿起，影的长相由同元素基础类决定——永远作为第二个类叠加">
        <p className="m-0 mb-2 max-w-[760px] text-content leading-relaxed text-body">
          拿起不是新配方：hoverable-shadow 只负责「拿起」——浮起 translate 0 -3px，并把同元素基础类的影换到 lift 档（5→8）。
          触发挂在命中宿主 .hover-host 上：位移作用于内部元素、命中区不动，光标不会被浮起甩出去（无宿主时退化为元素自身的
          hover 触发，仅兜底）。translate 是独立属性，与既有 transform 动效（翻面、盖印、路线跟随）可组合、互不覆盖。
        </p>
        <H3>盒影拿起 · shadow-ink</H3>
        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle host={false} title="shadow-ink · 静置参照" code='<div className="shadow-ink">纸卡</div>'>
            <PaperCard />
          </Particle>
          <Particle title="＋ hoverable-shadow" code='<div className="shadow-ink hoverable-shadow">纸卡</div>'>
            <PaperCard hover />
          </Particle>
        </div>
        <H3>轮廓影拿起 · drop-shadow-ink</H3>
        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <Particle
            host={false}
            title="drop-shadow-ink · 静置参照"
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
          <Particle host={false} title="组件同款 · 静置参照" code="<Ticket done />">
            <ChapterTicket chapter={CHAPTERS[1]} done />
          </Particle>
          <Particle title="＋ hover prop ＝ 内置拿起" code="<Ticket done hover />">
            <ChapterTicket chapter={CHAPTERS[1]} done hover />
          </Particle>
        </div>
        <div className="mt-8 max-w-[760px] rounded-xl border-2 border-dashed border-ink/25 bg-white p-4 text-content leading-relaxed text-body">
          <b className="text-small text-ink">第三形态与一条禁手</b>
          <p className="m-0 mt-1.5">
            都不叠基础类：只写 hoverable-shadow＝只浮起、影不换档——基础影由组件自写时用。
            拿起动效只写一处：Button / MemphisCard / RoutableCard / ShadowCard / Ticket 已自写拿起，勿再叠 hoverable-shadow。
          </p>
        </div>
      </Section>

      {/* ③ 组件归位：选影参照表 */}
      <Section label="组件归位" note="矩形盒影是默认，异形才动 filter——新组件按此选影">
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
                <span className="t-small-mute font-normal">box-shadow · 静置档</span>
              </td>
              <td className="py-1.5 pr-2 align-top">
                Button · MemphisCard · RoutableCard · ShadowCard · SiteNavbar · EntryGuide · AssignBlock · Stamp · ClipboardChecklist ·
                FlashCard · ExperimentFrame · TaskEnvelope · DeliveryManifest · ComparisonBoard · BrickToolbox（板面）
              </td>
              <td className="py-1.5 pr-2 align-top">
                实底矩形盒。Button / MemphisCard / RoutableCard / ShadowCard 自写 hover 拿起——浮 3px、影 5→8 换 lift 档；Stamp
                rotate(-2°) 静置盖章、无动效。
              </td>
            </tr>
            <tr className="border-b border-[#ececea]">
              <td className="py-1.5 pr-2 align-top font-extrabold text-ink">
                drop-shadow-ink
                <br />
                <span className="t-small-mute font-normal">filter</span>
              </td>
              <td className="py-1.5 pr-2 align-top">
                Ticket · ChapterTicket · ShadowCard（票券分支）· StickyNote · Bookmark · FolderTabs · OutputReceipt
              </td>
              <td className="py-1.5 pr-2 align-top">
                异形轮廓（打孔票、撕角、尖底书签、索引标签、回执）。影都在外壳层（.ticket-shadow / .learning-note /
                .learning-bookmark-shell 等），形状在内层；Ticket hover 外壳整体浮 3px、影换 lift 档。
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pr-2 align-top font-extrabold text-ink">
                自写小档
                <br />
                <span className="t-small-mute font-normal">3px 按压语言</span>
              </td>
              <td className="py-1.5 pr-2 align-top">
                ShadowButton · learning-action（标本动作按钮）· learning-flow-step（工位卡）· learning-brick（积木）
              </td>
              <td className="py-1.5 pr-2 align-top">
                比主档低一级的按钮体量：静置 3px → hover 浮 2px／影 5px → active 压进 translate(2px,2px)／影收 1px；未接
                hoverable-shadow。
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ④ 规则与反例：为什么这样设计 */}
      <Section label="规则与反例" note="先讲为什么，再看 ✗/✓ 对照——放错的是层级，不是配方">
        <div className="space-y-8">
          <Rule
            n={1}
            name="硬投影：无模糊、单色 ink"
            why="影是纸的厚度，不是光照——0 blur、纯 ink、偏移即海拔（静置 5px、拿起 8px）。模糊会把「纸叠纸」读成悬浮光斑；描边与投影同为 ink，缩放与低分屏上轮廓依然清晰。"
            demo={
              <>
                <DoDont bad text="blur：悬浮光斑，不是纸">
                  <div className="h-10 w-40 rounded-lg border-2 border-ink bg-clash2a [box-shadow:10px_10px_18px_rgba(17,17,17,0.4)]" />
                </DoDont>
                <DoDont text="硬投影：偏移即海拔">
                  <div className="h-10 w-40 rounded-lg border-2 border-ink bg-clash2a shadow-ink" />
                </DoDont>
              </>
            }
          />
          <Rule
            n={2}
            name="一个元素一份影"
            why="box-shadow 认盒框、drop-shadow 认轮廓，同元素留两份影就是两份成果——普通矩形上恰好重合、看似无事，形状一异形立刻分家。拆法＝异形影归内层 wrapper，外壳最多保留 hover 的 translate。"
            demo={
              <>
                <DoDont bad text="双影：外壳盒影＋内层轮廓影">
                  <div className="shadow-ink w-fit">
                    <TornNote className="drop-shadow-ink" />
                  </div>
                </DoDont>
                <DoDont text="只留一份：异形影归内层 wrapper">
                  <TornNote className="drop-shadow-ink w-fit" />
                </DoDont>
              </>
            }
          />
          <Rule
            n={3}
            name="影随形走：外壳拿影、内层裁形"
            why="filter 先画影、clip-path 后裁形：同一个元素上，影子刚画出来就被裁形剪掉。clip-path／mask 自成堆叠上下文，影必须挪到不裁形的外壳层（Ticket 的 .ticket-shadow 与 mask、Bookmark 的尖底外壳，都是这个分层）。"
            demo={
              <>
                <DoDont bad text="影没了：clip 把 filter 的成果一起剪走">
                  <div className={`relative drop-shadow-ink border-2 border-ink bg-clash2a px-5 py-4 text-small font-bold text-ink ${CLIP_TAG}`}>
                    影去哪了
                    <i aria-hidden className="absolute right-0 bottom-0 h-[22px] w-[22px] border-t-2 border-l-2 border-ink bg-paper-deep" />
                  </div>
                </DoDont>
                <DoDont text="拆两层：外壳 filter，内层 clip-path">
                  <TornNote className="drop-shadow-ink w-fit" />
                </DoDont>
              </>
            }
          />
          <Rule
            n={4}
            name="影不参与动画"
            why="拿起＝translate 位移，影只在静置／拿起两档间切换、没有生长过程；translate 与既有 transform 动效（翻面、盖印、路线跟随）互不覆盖。拿起动效只写一处——hoverable-shadow 或组件自写，不重复叠加。"
          />
        </div>
      </Section>
    </Page>
  )
}
