import { toneStyle, useLearningState } from './shared'
import type { LearningTone } from './shared'

export interface BookmarkProps {
  label: string
  saved?: boolean
  defaultSaved?: boolean
  onSavedChange?: (saved: boolean) => void
  tone?: LearningTone
  className?: string
}

export function Bookmark({
  label,
  saved,
  defaultSaved = false,
  onSavedChange,
  tone = 'teal',
  className = '',
}: BookmarkProps) {
  const [marked, setMarked] = useLearningState(saved, defaultSaved, onSavedChange)
  return (
    <div
      data-comp="bookmark"
      className={`learning-bookmark-shell ${className}`}
      style={toneStyle(tone)}
    >
      <button
        type="button"
        className="learning-object learning-bookmark"
        aria-label={label}
        aria-pressed={marked}
        onClick={() => setMarked(!marked)}
      >
        <span className="learning-bookmark-hole" aria-hidden="true" />
        <b>{label}</b>
        <span>{marked ? '已标记 · 再点取消' : '点一下，留个书签'}</span>
      </button>
    </div>
  )
}
