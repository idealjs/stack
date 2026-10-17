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
    <div data-comp="assign" className="w-[320px] rounded-xl border-2 border-ink bg-paper p-4 shadow-ink">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
          <path d="M9 1 v16 M1 9 h16" stroke="var(--color-clash2b)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M9 1 v16 M1 9 h16" stroke="var(--color-ink)" strokeWidth="1.2" />
        </svg>
        <b className="text-t3">{title}</b>
      </div>
      <div className="mt-2 space-y-1 text-content leading-relaxed text-body">
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
            <b className="t-small-strong">脱靶 · {miss.how}</b>
            <p className="m-0 mt-0.5 text-small leading-relaxed text-body">{miss.looks}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
