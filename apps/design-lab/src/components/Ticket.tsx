/** 票券 —— 只表达完成状态：完成＝沿撕线打孔（半圆缺口），未开始＝实线无孔。
 * 裁切式实现：头部色块无独立描边，由票体 overflow-hidden 裁出单一描边圆角。 */
import type { Chapter } from '../lib/types'

export function Ticket({ chapter, done }: { chapter: Chapter; done: boolean }) {
  return (
    <div
      className={`relative flex w-[216px] items-stretch overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-[5px_5px_0_var(--color-ink)] ${done ? 'ticket-pk' : ''}`}
      style={{ ['--tk-color' as string]: chapter.color }}
    >
      {/* 头部媒体块：章节色纯填充，无独立边框（由票体裁切） */}
      <div className="flex w-14 shrink-0 items-center justify-center text-[22px]" style={{ background: chapter.color }}>{chapter.emoji}</div>
      <div className="flex-1 py-2 pl-2.5 pr-2">
        <b className="text-[12.5px]">{chapter.title}</b>
        <div className="mt-0.5 font-mono text-[8.5px] text-mute">
          No. {String(chapter.id).padStart(3, '0')} · {done ? '已完成（打孔）' : '未开始（无孔）'}
        </div>
      </div>
      <div
        className={`flex w-[42px] items-center justify-center font-mono text-[9.5px] text-mute ${done ? 'border-l-[1.5px] border-dashed border-ink' : 'border-l-[1.5px] border-solid border-ink'}`}
      >
        №{String(chapter.id).padStart(2, '0')}
      </div>
      <style>{`
        .ticket-pk::before, .ticket-pk::after {
          content: ''; position: absolute; left: 160px; width: 14px; height: 14px;
          border-radius: 50%; background: var(--color-paper); border: 2px solid var(--color-ink);
        }
        .ticket-pk::before { top: -10px; }
        .ticket-pk::after { bottom: -10px; }
      `}</style>
    </div>
  )
}

/** 指派学习块 —— 普通内容块（非票据）：＋ 位置/预期/场景三样 + 脱靶标记 */
export function AssignBlock({
  title,
  pos,
  expect,
  scenes,
  miss,
}: {
  title: string
  pos: string
  expect: string
  scenes: string[]
  miss: { how: string; looks: string }
}) {
  return (
    <div className="w-[260px] rounded-xl border-2 border-ink bg-paper p-3 shadow-[5px_5px_0_var(--color-ink)]">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
          <path d="M9 1 v16 M1 9 h16" stroke="var(--color-clash2b)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M9 1 v16 M1 9 h16" stroke="var(--color-ink)" strokeWidth="1.2" />
        </svg>
        <b className="text-[13px]">{title}</b>
      </div>
      <div className="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-body">
        <div>
          <b>位置</b>：{pos}
        </div>
        <div>
          <b>预期</b>：{expect}
        </div>
        <div>
          <b>场景</b>：{scenes.join(' / ')}
        </div>
      </div>
      <div className="mt-2 border-t border-dashed border-ink/20 pt-2">
        <div className="flex items-start gap-2.5">
          <svg width="20" height="28" viewBox="0 0 24 34" className="mt-0.5 shrink-0" aria-hidden>
            <path d="M 12 32 L 8 27 L 16 22 L 8 17 L 16 12 L 12 7 L 14 2" fill="none" stroke="var(--color-clash1a)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <div>
            <b className="text-[11.5px]">脱靶 · {miss.how}</b>
            <p className="m-0 mt-0.5 text-[10.5px] leading-relaxed text-body">{miss.looks}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
