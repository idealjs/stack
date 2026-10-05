/** 入口梳理 —— 读者画像推荐路径：是推荐不是强制（无锁） */
import { CHAPTERS, PROFILES } from '../lib/chapters'

export function EntryGuide() {
  return (
    <div className="flex flex-wrap gap-5">
      {PROFILES.map((p) => (
        <div key={p.name} className="w-[252px] rounded-xl border-2 border-ink bg-paper p-3 shadow-[5px_5px_0_var(--color-ink)]">
          <div className="flex items-center gap-2">
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border-2 border-ink text-[14px]"
              style={{ background: CHAPTERS[p.entry].color }}
            >
              {p.icon}
            </span>
            <b className="text-[13px]">{p.name}</b>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {p.path.map((id, i) => (
              <span key={id} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[10px] text-mute">→</span>}
                <span
                  className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 text-[10.5px] ${id === p.entry ? 'bg-clash2a font-extrabold' : 'bg-white'}`}
                >
                  {id === p.entry && ['①', '②', '③'][PROFILES.indexOf(p)]} {CHAPTERS[id].title}
                </span>
              </span>
            ))}
          </div>
          <p className="m-0 mt-2 text-[10px] leading-relaxed text-mute">{p.note}</p>
        </div>
      ))}
    </div>
  )
}
