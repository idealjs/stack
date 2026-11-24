import { ToggleButton } from '@idealjs/stack-ui-kit'
import type { LearningTone } from './shared'
import { toneStyle } from './shared'

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
  return (
    <ToggleButton
      data-comp="bookmark"
      label={label}
      pressed={saved}
      defaultPressed={defaultSaved}
      onPressedChange={onSavedChange}
      hostClassName={`learning-bookmark-shell ${className}`}
      buttonClassName="learning-object learning-bookmark"
      style={toneStyle(tone)}
    >
      {(marked) => (
        <>
          <span className="learning-bookmark-hole" aria-hidden="true" />
          <b>{label}</b>
          <span>{marked ? '已标记 · 再点取消' : '点一下，留个书签'}</span>
        </>
      )}
    </ToggleButton>
  )
}
