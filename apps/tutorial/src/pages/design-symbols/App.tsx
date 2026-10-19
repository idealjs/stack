import { Page, Section } from '../../lib/ui'
import { BrickDot, Mark, Ring, Tri, Wave } from '@stack/design-system'
import { CHAPTERS } from '../../lib/chapters'
import { ChapterTicket } from '@stack/design-system'
import type { ReactNode } from 'react'

const SHAPES = [
  { el: <Tri size={28} />, n: '▲ 靶子', m: '目标，卡头打头', s: '靶子先行' },
  { el: <span className="flex"><BrickDot on /><BrickDot /></span>, n: '● 积木', m: '清单点列，实=已学', s: '积木清单' },
  { el: <Ring size={28} />, n: '○ 预期', m: '可核对的结果', s: '预期结果' },
  { el: <Wave size={36} />, n: '～ 代理区', m: '交给 agent', s: '每步先分类' },
  { el: <Mark>过程</Mark>, n: '荧光标记 价值区', m: '划在文字上，不是散落图形', s: '每步先分类' },
]

const VOCAB: { p: string; rows: [ReactNode, string][] }[] = [
  { p: '靶子', rows: [['▲ 目标', '做什么'], ['○ 预期结果', '做成长什么样、怎么核对'], ['● 积木清单', '要用到的零件——只列用到的；说零件不说知识']] },
  { p: '步骤分类', rows: [['～ 代理区', '无学习价值——交给 agent'], [<Mark key="v">价值区</Mark>, '有学习价值——就地写清']] },
  { p: '认知基础', rows: [['底座纹·真机验收章', 'env/库/运行环境——脚下的地，不是积木']] },
]

export function App() {
  return (
    <Page active="design-symbols" title="符号、形状 · 装饰即语义" desc="形状对内容下定义、散落于空白；票券只表达完成状态。">
      <Section label="语义形状 ×5" note="散落＝卡片附近空当＋随机旋转/落点（Scatter 种子化），密度 ≤ 8/屏">
        <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-5">
          {SHAPES.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-xl border-2 border-ink bg-white">{s.el}</div>
              <div className="mt-1.5 text-[11px] font-bold">{s.n}</div>
              <div className="t-small-mute leading-tight">{s.m}</div>
              <div className="mt-0.5 t-small-mute">{s.s}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="词汇表 · 父子层级" note="与 ai-era-tutorial 词汇表对齐">
        <table className="w-full border-collapse text-small text-body">
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
      <Section label="票券" note="状态的载体——完成即打孔（裁切式实现）">
        <div className="flex flex-wrap items-start gap-6">
          <ChapterTicket chapter={CHAPTERS[1]} done />
          <ChapterTicket chapter={CHAPTERS[5]} done={false} />
          <p className="m-0 max-w-[280px] flex-1 text-content leading-relaxed text-body">
            <b>完成＝沿撕线打双孔</b>（半圆缺口）；未开始撕线为实线、无孔。头部色块无独立描边，由票体 overflow-hidden 裁出单一描边圆角。票号＝章程序号。
          </p>
        </div>
      </Section>
    </Page>
  )
}
