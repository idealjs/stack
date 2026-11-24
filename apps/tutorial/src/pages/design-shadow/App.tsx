import * as styles from '@idealjs/stack-ui-kit/styles'
import { ShadowButton } from '@idealjs/stack-ui-kit'
import { ChapterTicket } from '@idealjs/stack-site-ui-kit'
import type { ReactNode } from 'react'
import { CHAPTERS } from '../../lib/chapters'
import { Page, Section } from '../../lib/ui'

const CLIP_TAG =
  '[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_22px),calc(100%_-_22px)_100%,0_100%)]'

function TornNote({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div
        className={`relative border-2 ${styles.borderInk} ${styles.bgClash2a} px-5 py-4 ${styles.textSmall} font-bold ${styles.textInk} ${CLIP_TAG}`}
      >
        撕角便签
        <i
          aria-hidden
          className={`absolute right-0 bottom-0 h-[22px] w-[22px] border-t-2 border-l-2 ${styles.borderInk} ${styles.bgPaperDeep}`}
        />
      </div>
    </div>
  )
}

function DoDont({
  bad = false,
  text,
  children,
}: {
  bad?: boolean
  text: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${styles.borderInk} text-[11px] font-extrabold ${
            bad ? 'bg-clash1a text-paper' : 'bg-clash1b'
          }`}
        >
          {bad ? '✗' : '✓'}
        </span>
        <span className={`${styles.textSmall} font-bold ${styles.textInk}`}>{text}</span>
      </div>
      <div
        className={`flex min-h-[96px] items-center rounded-xl border-2 border-dashed ${styles.borderInk25} bg-white p-4`}
      >
        {children}
      </div>
    </div>
  )
}

function Particle({
  title,
  code,
  host = true,
  children,
}: {
  title: string
  code: string
  host?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div className={`flex h-[110px] items-center justify-center ${host ? 'hover-host' : ''}`}>
        {children}
      </div>
      <div className={`${styles.textSmall} font-extrabold ${styles.textInk}`}>{title}</div>
      <pre className="learning-demo-code m-0 w-full overflow-x-auto px-2 py-1 text-[11px]">
        {code}
      </pre>
    </div>
  )
}

function ShapeGroup({ name, hint, children }: { name: string; hint: string; children: ReactNode }) {
  return (
    <div className={`border-t-2 ${styles.borderInk60} py-4`}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <b className={`${styles.textT3} font-extrabold ${styles.textInk}`}>{name}</b>
        <span className={`${styles.tSmallMute} font-mono`}>{hint}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  )
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className={`mt-9 mb-4 ${styles.textT3} font-extrabold ${styles.textInk}`}>{children}</h3>
  )
}

function Rule({ demo }: { demo: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{demo}</div>
}

function PaperCard({ hover = false }: { hover?: boolean }) {
  return (
    <div
      className={`w-[150px] rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} px-3.5 py-3 ${styles.shadowInk} ${hover ? 'hoverable-shadow cursor-pointer' : ''}`}
    >
      <b className={`${styles.textSmall}`}>纸卡</b>
    </div>
  )
}

function HostCard({ children }: { children: ReactNode }) {
  return (
    <div
      className={`w-fit rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} p-4 ${styles.shadowInk}`}
    >
      <b className={`${styles.textSmall}`}>第一层纸卡</b>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function App() {
  return (
    <Page
      active="design-shadow"
      title="阴影 · 硬投影"
      desc="全站只有一种影子：实心硬投影，分静置与拿起两档；影子只属于第一层——页面直排的票券/按钮/大卡与浮层，嵌套在卡内的二层交互件零投影，改用描边与底色分层。"
    >
      <Section label="四种影子">
        <ShapeGroup name="硬投影" hint="box-shadow">
          <Particle
            host={false}
            title="shadow-ink · 静置"
            code='<div className="shadow-ink">纸卡</div>'
          >
            <div
              className={`w-[132px] rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} px-3 py-2.5 text-center ${styles.shadowInk}`}
            >
              <b className={`${styles.textSmall}`}>纸卡</b>
            </div>
          </Particle>
          <Particle
            host={false}
            title="shadow-ink-lift · 拿起"
            code='<div className="shadow-ink-lift">纸卡</div>'
          >
            <div
              className={`w-[132px] rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} px-3 py-2.5 text-center ${styles.shadowInkLift}`}
            >
              <b className={`${styles.textSmall}`}>纸卡</b>
            </div>
          </Particle>
        </ShapeGroup>
        <ShapeGroup name="轮廓投影" hint="filter">
          <Particle
            host={false}
            title="drop-shadow-ink · 静置"
            code='<TornNote className="drop-shadow-ink" />'
          >
            <TornNote className={`${styles.dropShadowInk} w-fit`} />
          </Particle>
          <Particle
            host={false}
            title="drop-shadow-ink-lift · 拿起"
            code='<TornNote className="drop-shadow-ink-lift" />'
          >
            <TornNote className={`${styles.dropShadowInkLift} w-fit`} />
          </Particle>
        </ShapeGroup>
      </Section>

      <Section>
        <H3>硬投影拿起 · shadow-ink</H3>
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          <Particle
            host={false}
            title="shadow-ink · 静置参照"
            code='<div className="shadow-ink">纸卡</div>'
          >
            <PaperCard />
          </Particle>
          <Particle
            title="＋ hoverable-shadow"
            code='<div className="shadow-ink hoverable-shadow">纸卡</div>'
          >
            <PaperCard hover />
          </Particle>
        </div>
        <H3>轮廓投影拿起 · drop-shadow-ink</H3>
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          <Particle
            host={false}
            title="drop-shadow-ink · 静置参照"
            code='<div className="drop-shadow-ink">\n  <div className="[clip-path:…]">便签</div>\n</div>'
          >
            <TornNote className={`${styles.dropShadowInk} w-fit`} />
          </Particle>
          <Particle
            title="＋ hoverable-shadow"
            code='<div className="drop-shadow-ink hoverable-shadow">\n  <div className="[clip-path:…]">便签</div>\n</div>'
          >
            <TornNote
              className={`${styles.dropShadowInk} ${styles.hoverableShadow} w-fit cursor-pointer`}
            />
          </Particle>
        </div>
        <H3>Ticket 拿起</H3>
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          <Particle host={false} title="Ticket · 静置参照" code="<Ticket done />">
            <ChapterTicket chapter={CHAPTERS[1]} done />
          </Particle>
          <Particle title="＋ hover" code="<Ticket done hover />">
            <ChapterTicket chapter={CHAPTERS[1]} done hover />
          </Particle>
        </div>
      </Section>

      <Section label="规则与反例">
        <div className="space-y-8">
          <Rule
            demo={
              <>
                <DoDont bad text="模糊影子">
                  <div
                    className={`h-10 w-40 rounded-lg border-2 ${styles.borderInk} ${styles.bgClash2a} [box-shadow:10px_10px_18px_rgba(17,17,17,0.4)]`}
                  />
                </DoDont>
                <DoDont text="硬投影">
                  <div
                    className={`h-10 w-40 rounded-lg border-2 ${styles.borderInk} ${styles.bgClash2a} ${styles.shadowInk}`}
                  />
                </DoDont>
              </>
            }
          />
          <Rule
            demo={
              <>
                <DoDont bad text="两层影子">
                  <div className={`${styles.shadowInk} w-fit`}>
                    <TornNote className={`${styles.dropShadowInk}`} />
                  </div>
                </DoDont>
                <DoDont text="单层影子">
                  <TornNote className={`${styles.dropShadowInk} w-fit`} />
                </DoDont>
              </>
            }
          />
          <Rule
            demo={
              <>
                <DoDont bad text="被裁掉的影子">
                  <div
                    className={`relative ${styles.dropShadowInk} border-2 ${styles.borderInk} ${styles.bgClash2a} px-5 py-4 ${styles.textSmall} font-bold ${styles.textInk} ${CLIP_TAG}`}
                  >
                    影去哪了
                    <i
                      aria-hidden
                      className={`absolute right-0 bottom-0 h-[22px] w-[22px] border-t-2 border-l-2 ${styles.borderInk} ${styles.bgPaperDeep}`}
                    />
                  </div>
                </DoDont>
                <DoDont text="影子在外层">
                  <TornNote className={`${styles.dropShadowInk} w-fit`} />
                </DoDont>
              </>
            }
          />
        </div>
      </Section>

      <Section
        label="层级投影 · 影子只属于第一层"
        note="影子是「拿在手里」的信号：直接放在页面背景上的票券、按钮、大卡，以及覆盖页面的浮层，才有资格投影；嵌套在卡片内部的二层交互件（卡内按钮、tab、条目、印章）零投影——卡片已经把内容托在纸面上了，卡内再投影就是影中影"
      >
        <Rule
          demo={
            <>
              <DoDont bad text="卡内按钮带投影：影中影">
                <HostCard>
                  <button
                    type="button"
                    className={`cursor-pointer rounded-lg border-2 ${styles.borderInk} ${styles.bgPaper} px-3 py-1.5 ${styles.textSmall} font-bold ${styles.textInk} shadow-[3px_3px_0_var(--color-ink)]`}
                  >
                    卡内按钮
                  </button>
                </HostCard>
              </DoDont>
              <DoDont text="卡内按钮零投影：描边＋底色分层，hover 换底色">
                <HostCard>
                  <button
                    type="button"
                    className={`cursor-pointer rounded-lg border-2 ${styles.borderInk} ${styles.bgPaper} px-3 py-1.5 ${styles.textSmall} font-bold ${styles.textInk} transition-[background-color] duration-150 ${styles.hoverBgPaperDeep} active:translate-y-[1px]`}
                  >
                    卡内按钮
                  </button>
                </HostCard>
              </DoDont>
            </>
          }
        />
        <p className={`mt-4 mb-0 ${styles.textContent} ${styles.textBody}`}>
          二层交互件的完整形态：
          <b className={`${styles.tSmallStrong}`}>
            描边（2px ink）＋底色，hover 换底色或调亮度，按压位移 1px 不换影
          </b>
          。ShadowButton / Button 的
          <code
            className={`mx-1 rounded ${styles.bgPaperDeep} px-1.5 py-0.5 font-mono text-[12.5px]`}
          >
            nested
          </code>
          形态、learning 组件里的翻面钮、工位卡、印章都按此执行。
        </p>
      </Section>

      <Section
        label={`触发模型 · ${styles.hoverHost}`}
        note="位移的 :hover 挂在不动的宿主上——命中区不跟位移，底边不抖"
      >
        <Rule
          demo={
            <>
              <DoDont bad text="自 hover：命中区跟着位移，指针停底边就疯狂抖动">
                <div
                  className={`w-fit cursor-pointer rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} px-3.5 py-3 ${styles.shadowInk} transition-[translate,box-shadow] duration-150 hover:-translate-y-[3px] ${styles.hoverShadowInkLift}`}
                >
                  <b className={`${styles.textSmall}`}>纸卡</b>
                </div>
              </DoDont>
              <DoDont text={`${styles.hoverHost}：宿主承接 hover，子元素才位移`}>
                <div className={`${styles.hoverHost} w-fit`}>
                  <div
                    className={`${styles.hoverableShadow} ${styles.shadowInk} w-fit cursor-pointer rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} px-3.5 py-3`}
                  >
                    <b className={`${styles.textSmall}`}>纸卡</b>
                  </div>
                </div>
              </DoDont>
            </>
          }
        />
        <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-6">
          <Particle
            title="按钮档 · shadow-btn"
            code='<span className="hover-host inline-flex">\n  <button className="… hoverable-shadow shadow-btn" />\n</span>'
          >
            <ShadowButton size="sm">按钮</ShadowButton>
          </Particle>
          <Particle
            title="撕角档 · drop-shadow-ink"
            code='<div className="hover-host">\n  <TornNote className="drop-shadow-ink hoverable-shadow" />\n</div>'
          >
            <TornNote
              className={`${styles.dropShadowInk} ${styles.hoverableShadow} w-fit cursor-pointer`}
            />
          </Particle>
          <Particle
            title="便签档 · lift-sm"
            code='<span className="hover-host block">\n  <button className="… hoverable-shadow lift-sm" />\n</span>'
          >
            <button
              type="button"
              className={`${styles.hoverableShadow} ${styles.liftSm} flex cursor-pointer items-center gap-2 rounded-t-lg border-2 ${styles.borderInk} ${styles.bgClash2a} px-3 py-1.5 text-[12.5px] font-extrabold ${styles.textInk} shadow-[3px_3px_0_var(--color-ink)] transition-[translate] duration-150`}
            >
              便签 Tab
            </button>
          </Particle>
        </div>
      </Section>
    </Page>
  )
}
