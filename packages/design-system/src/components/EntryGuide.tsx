/** 入口梳理 —— 读者画像推荐路径：是推荐不是强制（无锁）。
 * 章节数据与画像由宿主注入（真实教程数据）。 */
import type { Chapter, ChapterId, Profile } from '../lib/types'

export function EntryGuide({
  chapters,
  profiles,
  linkChapter = false,
}: {
  chapters: Record<ChapterId, Chapter>
  profiles: Profile[]
  /** 路径 chip 是否链接章节页（教程站 true） */
  linkChapter?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-5">
      {profiles.map((p) => (
        <div key={p.name} data-comp="entry-card" className="w-[252px] rounded-xl border-2 border-ink bg-paper p-3 shadow-hard">
          <div className="flex items-center gap-2">
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border-2 border-ink text-[14px]"
              style={{ background: chapters[p.entry].color }}
            >
              {p.icon}
            </span>
            <b className="text-t3">{p.name}</b>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {p.path.map((id, i) => (
              <span key={id} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-small text-mute">→</span>}
                {linkChapter ? (
                  <a
                    href={`/ch${id}.html`}
                    className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 text-small no-underline ${id === p.entry ? 'bg-clash2a font-extrabold' : 'bg-white'}`}
                  >
                    {id === p.entry && ['①', '②', '③'][profiles.indexOf(p)]} {chapters[id].title}
                  </a>
                ) : (
                  <span
                    className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 text-small ${id === p.entry ? 'bg-clash2a font-extrabold' : 'bg-white'}`}
                  >
                    {id === p.entry && ['①', '②', '③'][profiles.indexOf(p)]} {chapters[id].title}
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="m-0 mt-2 t-small-mute leading-relaxed">{p.note}</p>
        </div>
      ))}
    </div>
  )
}
