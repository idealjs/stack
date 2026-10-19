
import { Page, Section } from '../../lib/ui'


const SCALE = [
  { n: '正文 content', token: 'text-content', spec: '16px / 1.75（浏览器默认）', use: '全站基准——步骤与认知基础正文', sample: <span className="text-content text-body">把 16px 当正文，浏览器默认字号即设计基准。</span>, cls: '' },
  { n: '三级标题 t3', token: 'text-t3', spec: '18px / 1.5', use: '步骤标题、积木名', sample: <span className="text-t3 font-bold text-ink">组件是界面拼接的最小单位</span>, cls: '' },
  { n: '二级标题 t2', token: 'text-t2', spec: '22px / 1.45', use: '次级标题（区块级，预留）', sample: <span className="text-t2 font-bold text-ink">用组件拼出可增删的 todo</span>, cls: '' },
  { n: '一级标题 t1', token: 'text-t1', spec: '28px / 1.3', use: '页面主标题、章头', sample: <span className="text-t1 font-extrabold text-ink">第 1 章 · 快速开始</span>, cls: '' },
  { n: '辅助 small', token: 'text-small', spec: '12px / 1.65', use: '卡片内辅助正文（积木三句话）', sample: <span className="text-small text-body">静态文件服务：把目录里的文件原样返回的那层服务。</span>, cls: '' },
  { n: '小字 · 边缘可忽略', token: 't-small-mute', spec: '12px 灰', use: '注记、页脚——看不清也无妨', sample: <span className="t-small-mute">散落只在卡片附近空当，密度 ≤ 8/屏</span>, cls: 't-small-mute' },
  { n: '小字 · 缩小但加强', token: 't-small-strong', spec: '12px 加粗 + 字距', use: 'Section 标签、靶子三行、验收标签', sample: <span className="t-small-strong">▲ 目标：让第一个网页跑起来</span>, cls: 't-small-strong' },
  { n: '大字 · 大而弱', token: 't-display', spec: '64px @ ink 10%', use: '章头幽灵章号——存在但不抢戏', sample: <span className="t-display">05</span>, cls: 't-display' },
]

const RULES = [
  { n: '同尺寸，两种强调', why: '小字要么「边缘可忽略」（灰、常规），要么「缩小但加强」（加粗、收字距）——没有中间态；大字同理：t1 大而强是主标题，display 大而弱是背景字。强调是二选一，不是渐变。' },
  { n: '正文不小于 16', why: '16px＝浏览器默认＝正文字号。比它小的只允许承载「丢了也不影响理解」的内容（mute）或「标签式短语」（strong）；成段阅读的内容永远 ≥16。' },
  { n: '标题只用 t1–t3', why: '三级标题覆盖页面→区块→条目。不自造字号：新层级先问「能不能并进现有三级」，多数时候是内容该拆，不是字号该加。' },
]

export function App() {
  return (
    <Page
      active="design-typography"
      title="字体 · 一套字阶，两种强调"
      desc="基准＝浏览器默认 16px＝正文；向上三级标题；向下与向上的大字，强调都是二态：可忽略 / 加强，没有中间态。"
    >
      <Section label="字阶总览" note="所见即 token——示例直接用 tokens.css 的字体系统">
        <div className="space-y-3">
          {SCALE.map((s) => (
            <div key={s.n} className="flex flex-wrap items-baseline gap-x-5 gap-y-2 rounded-xl border-2 border-ink bg-paper p-3.5 shadow-ink">
              <div className="w-[150px] shrink-0">
                <div className="t-small-strong">{s.n}</div>
                <div className="t-small-mute font-mono">{s.token}</div>
              </div>
              <div className="flex min-w-[280px] flex-1 flex-wrap items-center gap-x-6">
                {s.sample}
              </div>
              <div className="t-small-mute w-[220px] shrink-0">{s.spec} · {s.use}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="规则" note="为什么这样设计">
        <div className="space-y-3">
          {RULES.map((r, i) => (
            <div key={r.n} className="rounded-xl border-2 border-ink bg-paper p-4 shadow-ink">
              <div className="flex items-baseline gap-2">
                <span className="flex h-[18px] w-[18px] shrink-0 translate-y-[2px] items-center justify-center rounded-full border-2 border-ink bg-ink text-[10px] font-extrabold text-paper">{i + 1}</span>
                <b className="text-t3">{r.n}</b>
              </div>
              <p className="m-0 mt-1.5 max-w-[760px] text-content text-body">{r.why}</p>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}
