/** 终点示意——单人版 todolist 的静态成品预览（非交互）。
 * 放在教程首页英雄区，让读者第一眼看到学完后做出来的东西。 */

const ITEMS = [
  { text: '给陪练 agent 填 API Key', done: true },
  { text: '把 hello world 跑起来', done: false },
  { text: '给待办加一条筛选', done: false },
]

export function TodoMock() {
  return (
    <div aria-label="todolist 成品示意（静态预览）" className="flex h-full flex-col gap-2.5 bg-paper p-3 text-left">
      <div className="flex items-baseline justify-between">
        <b className="text-content font-extrabold text-ink">今天</b>
        <span className="t-small-mute font-mono">3 件 · 完成 1</span>
      </div>
      {/* 输入条：虚线框＝待你实现 */}
      <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-ink/40 px-2.5 py-1.5">
        <span className="flex-1 t-small-mute">加一件待办…</span>
        <span
          aria-hidden
          className="flex size-5 items-center justify-center rounded-md border-2 border-ink bg-clash1b text-[13px] font-extrabold leading-none text-ink"
        >
          ＋
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {ITEMS.map((item) => (
          <li key={item.text} className="flex items-center gap-2 rounded-lg border-2 border-ink bg-white px-2.5 py-1.5">
            <span
              aria-hidden
              className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-ink text-[12px] font-extrabold leading-none ${
                item.done ? 'bg-ink text-paper' : 'bg-paper text-transparent'
              }`}
            >
              ✓
            </span>
            <span className={`flex-1 text-small font-bold ${item.done ? 'text-mute line-through' : 'text-ink'}`}>
              {item.text}
            </span>
            <span aria-hidden className="t-small-mute font-mono">
              ×
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
