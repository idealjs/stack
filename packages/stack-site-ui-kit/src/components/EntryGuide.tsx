import type { Chapter, ChapterId, Profile } from '../types'
import {
  guideCard,
  guideHead,
  guideIcon,
  guideName,
  guideNote,
  guideRow,
  pathArrow,
  pathChip,
  pathChipEntry,
  pathChipLink,
  pathItem,
  pathRow,
} from './entryGuide.css'

export function EntryGuide({
  chapters,
  profiles,
  linkChapter = false,
  chapterHref,
}: {
  chapters: Record<ChapterId, Chapter>
  profiles: Profile[]

  linkChapter?: boolean
  chapterHref?: (id: ChapterId) => string
}) {
  return (
    <div className={guideRow}>
      {profiles.map((p) => (
        <div key={p.name} data-comp="entry-card" className={guideCard}>
          <div className={guideHead}>
            <span className={guideIcon} style={{ background: chapters[p.entry].color }}>
              {p.icon}
            </span>
            <b className={guideName}>{p.name}</b>
          </div>
          <div className={pathRow}>
            {p.path.map((id, i) => (
              <span key={id} className={pathItem}>
                {i > 0 && <span className={pathArrow}>→</span>}
                {linkChapter ? (
                  <a
                    href={(chapterHref ?? ((chapterId: ChapterId) => `./ch${chapterId}.html`))(id)}
                    className={`${pathChip} ${id === p.entry ? pathChipEntry : ''} ${pathChipLink}`}
                  >
                    {id === p.entry && ['①', '②', '③'][profiles.indexOf(p)]} {chapters[id].title}
                  </a>
                ) : (
                  <span className={`${pathChip} ${id === p.entry ? pathChipEntry : ''}`}>
                    {id === p.entry && ['①', '②', '③'][profiles.indexOf(p)]} {chapters[id].title}
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className={guideNote}>{p.note}</p>
        </div>
      ))}
    </div>
  )
}
