import * as styles from '@idealjs/stack-ui-kit/styles'
import { Mark, Ring, Tri, Wave } from '@idealjs/stack-ui-kit'
import type { ChapterId } from '@idealjs/stack-site-ui-kit'
import { BrickDots } from '@idealjs/stack-site-ui-kit'
import type { CSSProperties, ReactNode } from 'react'
import { CHAPTERS, CONTENT } from '../lib/chapters'
import { Page, Section } from '../lib/ui'

export function ChapterPage({ id, children }: { id: ChapterId; children?: ReactNode }) {
  const ch = CHAPTERS[id]
  const c = CONTENT[id]

  return (
    <Page active={id}>
      <div
        className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 ${styles.borderInk} p-5 ${styles.shadowInk}`}
        style={{ background: ch.color } as CSSProperties}
      >
        <span
          className={`${styles.tDisplay} pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none`}
          aria-hidden
        >
          0{id}
        </span>
        <span className="text-[44px] leading-none">{ch.emoji}</span>
        <div className="flex-1">
          <h1 className={`m-0 ${styles.textT1} font-extrabold ${styles.textInk}`}>
            第 {id} 章 · {ch.title}
          </h1>
          <div className={`mt-2 flex flex-wrap gap-x-6 gap-y-1 ${styles.tSmallStrong}`}>
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
              <li
                key={s.title}
                className={`rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} p-4 ${styles.shadowInk}`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${styles.borderInk} bg-white text-[12px] font-extrabold`}
                  >
                    {i + 1}
                  </span>
                  {s.kind === 'value' ? (
                    <Mark className={`${styles.textT3}`}>{s.title}</Mark>
                  ) : (
                    <span
                      className={`flex items-center gap-1.5 ${styles.textT3} font-bold ${styles.textInk}`}
                    >
                      <Wave size={30} />
                      {s.title}
                      <span
                        className={`rounded-full ${styles.bgClash3b15} px-2 py-0.5 text-[10.5px]`}
                      >
                        代理区 · 交给 agent
                      </span>
                    </span>
                  )}
                </div>
                <p className={`m-0 mt-2.5 ${styles.textContent} ${styles.textBody}`}>{s.what}</p>
                <p className={`m-0 mt-2 ${styles.textContent} ${styles.textBody}`}>
                  <b className={`${styles.tSmallStrong}`}>验收</b>
                  <span className={`mx-1.5 ${styles.textMute}`}>·</span>
                  {s.accept}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="积木清单" note="从靶子倒推、每块三句话、教一块带一族">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {c.bricks.map((b) => (
              <div
                key={b.name}
                className={`rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} p-3.5 ${styles.shadowInk}`}
              >
                <div className="flex items-center gap-2">
                  <Tri size={13} />
                  <b className={`${styles.textT3}`}>{b.name}</b>
                </div>
                <p className={`m-0 mt-2 ${styles.textSmall} leading-relaxed ${styles.textBody}`}>
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
            <div
              className={`flex items-start gap-3 rounded-xl border-2 border-dashed ${styles.borderInk40} ${styles.bgClash3b15} p-4`}
            >
              <Ring size={18} className="mt-0.5 shrink-0" />
              <p className={`m-0 ${styles.textContent} ${styles.textBody}`}>{c.base}</p>
            </div>
          </Section>
        )}

        {children}
      </div>
    </Page>
  )
}
