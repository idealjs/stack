import { Page, Section } from '../../lib/ui'
import { Bar, BrickDot, Cross, Ring, Tremble, Tri, Wave } from '../../components/shapes'
import { CHAPTERS } from '../../lib/chapters'
import { Ticket } from '../../components/Ticket'

const SHAPES = [
  { el: <Tri size={28} />, n: '▲ 靶子', m: '目标，卡头打头', s: '靶子先行' },
  { el: <span className="flex"><BrickDot on /><BrickDot /></span>, n: '● 积木', m: '清单点列，实=已学', s: '积木清单' },
  { el: <Ring size={28} />, n: '○ 预期', m: '可核对的结果', s: '预期结果' },
  { el: <Wave size={36} />, n: '～ 代理区', m: '交给 agent', s: '每步先分类' },
  { el: <Bar size={30} />, n: '▬ 价值区', m: '就地写过程', s: '每步先分类' },
  { el: <Tremble size={22} />, n: '⌇ 脱靶', m: '图形入口：追随图形进入阅读', s: '脱靶提醒' },
  { el: <Cross size={22} />, n: '＋ 指派', m: '位置/预期/场景', s: '指派学习' },
]

const VOCAB: { p: string; rows: [string, string][] }[] = [
  { p: '靶子', rows: [['▲ 目标', '做什么'], ['○ 预期结果', '做成长什么样、怎么核对'], ['● 积木清单', '要用到的零件——只列用到的；说零件不说知识']] },
  { p: '步骤分类', rows: [['～ 代理区', '无学习价值——交给 agent'], ['▬ 价值区', '有学习价值——就地写清']] },
  { p: '指派学习', rows: [['＋ 三样（图形入口）', '教材只留三样，讲解交给 agent'], ['└ 位置', '知识体系中的坐标'], ['└ 预期', '实践结果应长什么样——当尺子'], ['└ 场景', '带回 agent 再做的练习——管巩固']] },
  { p: '脱靶提醒', rows: [['⌇ 图形标记', '不人为挖坑；跟在指派后'], ['└ 可能性 / 长相', '怎么脱靶＋脱靶什么样——撞上认出缺哪块']] },
  { p: '认知基础', rows: [['底座纹·真机验收章', 'env/库/运行环境——脚下的地，不是积木']] },
]

const LINES = [
  { d: 'M 8 34 H 60 A 8 8 0 0 0 68 26 V 18 A 8 8 0 0 1 76 10 H 180', w: 2.5, dash: '', cap: 'butt' as const, st: true, n: '实线 ＝ 先后', m: '推荐顺序 · 主线，唯一带站点' },
  { d: 'M 8 23 H 180', w: 2, dash: '4 2', cap: 'butt' as const, st: false, n: '虚线 ＝ 相关', m: '内容互参 · 无顺序，无站点' },
  { d: 'M 8 23 H 180', w: 2.4, dash: '0.1 6', cap: 'round' as const, st: false, n: '点线 ＝ 同族', m: '同一积木家族（教一块带一族）' },
]

export function App() {
  return (
    <Page tag="<Symbols />" title="符号、形状 · 装饰即语义" desc="形状对内容下定义、散落于空白；线条形式承载关系含义；票券只表达完成状态。">
      <Section label="语义形状 ×7" note="散落只在空白，密度 ≤ 8/屏">
        <div className="grid grid-cols-4 gap-3.5 md:grid-cols-7">
          {SHAPES.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-xl border-2 border-ink bg-white">{s.el}</div>
              <div className="mt-1.5 text-[11px] font-bold">{s.n}</div>
              <div className="text-[9.5px] leading-tight text-[#6b6b6b]">{s.m}</div>
              <div className="mt-0.5 text-[9px] text-[#8a8a8a]">{s.s}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="词汇表 · 父子层级" note="与 ai-era-tutorial 词汇表对齐">
        <table className="w-full border-collapse text-[11.5px] text-body">
          <thead>
            <tr className="border-b-2 border-[#d5d5d3] text-left text-ink">
              <th className="w-24 py-1 pr-2">父词</th>
              <th className="w-44 py-1 pr-2">图形 · 子词</th>
              <th className="py-1 pr-2">释义（skill 口径）</th>
            </tr>
          </thead>
          <tbody>
            {VOCAB.map((g) =>
              g.rows.map(([sub, def], i) => (
                <tr key={g.p + i} className="border-b border-[#ececea]">
                  {i === 0 && <td rowSpan={g.rows.length} className="py-1 pr-2 align-top font-extrabold text-ink">{g.p}</td>}
                  <td className="py-1 pr-2">{sub}</td>
                  <td className="py-1 pr-2">{def}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </Section>
      <Section label="线条形式 ×4" note="形式即含义；横平竖直＋R8 全形式通用">
        <div className="grid grid-cols-2 gap-3">
          {LINES.map((l) => (
            <div key={l.n} className="rounded-xl border-2 border-ink bg-white p-3">
              <svg width="188" height="44" viewBox="0 0 188 44">
                <path d={l.d} stroke="var(--color-ink)" strokeWidth={l.w} fill="none" strokeDasharray={l.dash} strokeLinecap={l.cap || 'butt'} />
                {l.st && <>
                  <circle cx="8" cy="34" r="5.5" fill="var(--color-clash2a)" stroke="var(--color-ink)" strokeWidth="2" />
                  <circle cx="181" cy="10" r="5.5" fill="var(--color-clash1b)" stroke="var(--color-ink)" strokeWidth="2" />
                </>}
              </svg>
              <div className="mt-1 text-[13px] font-extrabold">{l.n}</div>
              <div className="text-[11px] text-[#555]">{l.m}</div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-ink bg-white p-3">
            <svg width="188" height="44" viewBox="0 0 188 44">
              <path d="M12 22 q10 -22 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="var(--color-clash3b)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
            <div className="mt-1 text-[13px] font-extrabold">波浪带 ＝ 代理交接</div>
            <div className="text-[11px] text-[#555]">agent 边界 · 区域标记，不连线</div>
          </div>
        </div>
      </Section>
      <Section label="票券" note="状态的载体——完成即打孔（裁切式实现）">
        <div className="flex flex-wrap items-start gap-6">
          <Ticket chapter={CHAPTERS[1]} done />
          <Ticket chapter={CHAPTERS[5]} done={false} />
          <p className="m-0 max-w-[280px] flex-1 text-[11.5px] leading-relaxed text-body">
            <b>完成＝沿撕线打双孔</b>（半圆缺口）；未开始撕线为实线、无孔。头部色块无独立描边，由票体 overflow-hidden 裁出单一描边圆角。票号＝章程序号。
          </p>
        </div>
      </Section>
    </Page>
  )
}
