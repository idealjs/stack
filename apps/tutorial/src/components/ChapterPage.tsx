/** 章节页——一章的完整教学结构（对齐 ai-era-tutorial）：
 * 章头靶子卡（▲目标 ○预期 ●积木，view-transition-name 与书架相框同名 morph）
 * → 步骤列（价值区荧光标记 / 代理区波浪，每步＝目标＋验收产物）
 * → 积木三句话（是什么/与靶子的关系/带一族）
 * → 认知基础（脚下的地，就地露出）→ 指派学习三样＋脱靶提醒 */
import type { CSSProperties } from 'react'
import { Page, Section } from '../lib/ui'
import { CHAPTERS, CONTENT } from '../lib/chapters'
import type { ChapterId } from '@stack/design-system'
import { AssignBlock, BrickDots, Mark, Ring, Tri, Wave } from '@stack/design-system'

const ALL: ChapterId[] = [1, 2, 3, 4, 5, 6]

export function ChapterPage({ id }: { id: ChapterId }) {
  const ch = CHAPTERS[id]
  const c = CONTENT[id]
  const prev = ALL[id - 2]
  const next = ALL[id]

  return (
    <Page active={id}>
      {/* 章头：与书架相框共享 view-transition-name —— 点卡片进来时相框飞进来变成章头 */}
      <div
        className="relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-ink p-5 shadow-ink"
        style={{ background: ch.color, viewTransitionName: `ch-${id}` } as CSSProperties}
      >
        <span className="t-display pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none" aria-hidden>
          0{id}
        </span>
        <span className="text-[44px] leading-none">{ch.emoji}</span>
        <div className="flex-1">
          <h1 className="m-0 text-t1 font-extrabold text-ink">
            第 {id} 章 · {ch.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 t-small-strong">
            <span>▲ 目标：{ch.target.goal}</span>
            <span>○ 预期：{ch.target.expectation}</span>
            <span className="flex items-center gap-1.5">
              ● 积木 <BrickDots bricks={ch.target.bricks} />
              {ch.target.bricks.length} 块
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Section label="步骤" note="每步先分类：这一步的过程里有没有学习价值">
          <ol className="m-0 list-none space-y-3 p-0">
            {c.steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border-2 border-ink bg-paper p-4 shadow-ink">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white text-[12px] font-extrabold">
                    {i + 1}
                  </span>
                  {s.kind === 'value' ? (
                    <Mark className="text-t3">{s.title}</Mark>
                  ) : (
                    <span className="flex items-center gap-1.5 text-t3 font-bold text-ink">
                      <Wave size={30} />
                      {s.title}
                      <span className="rounded-full bg-clash3b/15 px-2 py-0.5 text-[10.5px]">代理区 · 交给 agent</span>
                    </span>
                  )}
                </div>
                <p className="m-0 mt-2.5 text-content text-body">{s.what}</p>
                <p className="m-0 mt-2 text-content text-body">
                  <b className="t-small-strong">验收</b>
                  <span className="mx-1.5 text-mute">·</span>
                  {s.accept}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="积木清单" note="从靶子倒推、每块三句话、教一块带一族">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {c.bricks.map((b) => (
              <div key={b.name} className="rounded-xl border-2 border-ink bg-paper p-3.5 shadow-ink">
                <div className="flex items-center gap-2">
                  <Tri size={13} />
                  <b className="text-t3">{b.name}</b>
                </div>
                <p className="m-0 mt-2 text-small leading-relaxed text-body">
                  <b>是什么</b>：{b.what}
                  <br />
                  <b>为何在这</b>：{b.why}
                  <br />
                  <b>带一族</b>：{b.family}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {c.base && (
          <Section label="认知基础" note="脚下的地（env/库/运行环境）——第一次用到就地露出">
            <div className="flex items-start gap-3 rounded-xl border-2 border-dashed border-ink/40 bg-clash3b/15 p-4">
              <Ring size={18} className="mt-0.5 shrink-0" />
              <p className="m-0 text-content text-body">{c.base}</p>
            </div>
          </Section>
        )}

        {c.assign && (
          <Section label="指派学习" note="位置给坐标、预期当尺子、场景管巩固；讲解交给你的 agent">
            <AssignBlock {...c.assign} />
          </Section>
        )}

        <div className="flex items-center justify-between gap-4">
          {prev ? (
            <a
              href={`/ch${prev}.html`}
              className="rounded-xl border-2 border-ink bg-paper px-4 py-2 text-[12.5px] font-bold text-ink no-underline shadow-ink"
            >
              ← 第 {prev} 章 · {CHAPTERS[prev].title}
            </a>
          ) : (
            <span />
          )}
          <a
            href="/index.html"
            className="rounded-xl border-2 border-ink bg-ink px-4 py-2 text-[12.5px] font-bold text-paper no-underline"
          >
            返回首页
          </a>
          {next ? (
            <a
              href={`/ch${next}.html`}
              className="rounded-xl border-2 border-ink bg-paper px-4 py-2 text-[12.5px] font-bold text-ink no-underline shadow-ink"
            >
              第 {next} 章 · {CHAPTERS[next].title} →
            </a>
          ) : (
            <span />
          )}
        </div>
      </div>
    </Page>
  )
}
