import type { ReactNode } from 'react'
import { BrickDot, Mark, Ring, Tri, Wave } from '../../design-system'
import { Page, Section } from '../../lib/ui'

const SHAPES = [
  {
    el: <Tri size={28} />,
    n: '▲ 靶子',
    d: '唯一实心有指向——说「做什么」，不核对、不计数',
    s: '靶子先行 · 章卡与步骤卡头',
  },
  {
    el: (
      <span className="flex">
        <BrickDot on />
        <BrickDot />
      </span>
    ),
    n: '● 积木',
    d: '唯一成列可数——实心＝已学，管进度不管方向',
    s: '积木清单 · 零件点列与卡头进度点',
  },
  {
    el: <Ring size={28} />,
    n: '○ 预期',
    d: '唯一空心——中间留空待核对，说「做成什么样」',
    s: '预期结果 · 对照 agent 输出的尺子',
  },
  {
    el: <Wave size={36} />,
    n: '～ 代理区',
    d: '唯一不闭合——是边界不是物件，圈出交给 agent 的范围',
    s: '每步先分类 · 无学习价值就交接',
  },
  {
    el: <Mark>过程</Mark>,
    n: '荧光标记 价值区',
    d: '唯一划在文字上——不散落空白，标记有学习价值的词',
    s: '每步先分类 · 价值区就地写清',
  },
]

const VOCAB: { p: string; rows: [ReactNode, string][] }[] = [
  {
    p: '靶子',
    rows: [
      ['▲ 目标', '做什么'],
      ['○ 预期结果', '做成长什么样、怎么核对'],
      ['● 积木清单', '要用到的零件——只列用到的；说零件不说知识'],
    ],
  },
  {
    p: '步骤分类',
    rows: [
      ['～ 代理区', '无学习价值——交给 agent'],
      [<Mark key="v">价值区</Mark>, '有学习价值——就地写清'],
    ],
  },
  { p: '认知基础', rows: [['底座纹·真机验收章', 'env/库/运行环境——脚下的地，不是积木']] },
]

export function App() {
  return (
    <Page
      active="design-symbols"
      title="符号、形状 · 装饰即语义"
      desc="形状对内容下定义、散落于空白；五种形状各管一件事——区别在形状语言，场景在教程环节。"
    >
      <Section
        label="语义形状 ×5"
        note="实心有指向 · 空心待核对 · 点可计数 · 波浪是边界 · 荧光在文字上；散落＝空当＋随机旋转（Scatter 种子化），密度 ≤ 8/屏"
      >
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {SHAPES.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-xl border-2 border-ink bg-white">
                {s.el}
              </div>
              <div className="mt-1.5 text-[11px] font-bold">{s.n}</div>
              <div className="mt-0.5 text-small leading-snug text-body">{s.d}</div>
              <div className="mt-0.5 t-small-mute leading-tight">场景 · {s.s}</div>
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
                <tr key={`${g.p}-${sub}`} className="border-b border-[#ececea]">
                  {i === 0 && (
                    <td
                      rowSpan={g.rows.length}
                      className="py-1 pr-2 align-top font-extrabold text-ink"
                    >
                      {g.p}
                    </td>
                  )}
                  <td className="py-1 pr-2">{sub}</td>
                  <td className="py-1 pr-2">{def}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </Section>
    </Page>
  )
}
