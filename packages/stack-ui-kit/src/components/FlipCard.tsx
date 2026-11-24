import type { CSSProperties, ReactNode } from 'react'
import { useId } from 'react'
import { useControllableState } from '../hooks/useControllableState'

export interface FlipCardProps {
  label: ReactNode
  faceHint: (flipped: boolean) => ReactNode
  actionLabel: (flipped: boolean) => ReactNode
  front: ReactNode
  back: ReactNode
  flipped?: boolean
  defaultFlipped?: boolean
  onFlip?: (flipped: boolean) => void
  rootClassName?: string
  topClassName?: string
  contentClassName?: string
  faceClassName?: string
  actionClassName?: string
  style?: CSSProperties
  'data-comp'?: string
}

export function FlipCard({
  label,
  faceHint,
  actionLabel,
  front,
  back,
  flipped,
  defaultFlipped = false,
  onFlip,
  rootClassName = '',
  topClassName = '',
  contentClassName = '',
  faceClassName = '',
  actionClassName = '',
  style,
  'data-comp': component = 'flip-card',
}: FlipCardProps) {
  const uid = useId()
  const [isBack, setBack] = useControllableState(flipped, defaultFlipped, onFlip)
  return (
    <section data-comp={component} data-flipped={isBack} className={rootClassName} style={style}>
      <div className={topClassName}>
        <span>{label}</span>
        <span>{faceHint(isBack)}</span>
      </div>
      <div id={uid} className={contentClassName} aria-live="polite">
        <div data-active={!isBack} className={faceClassName}>
          {front}
        </div>
        <div data-active={isBack} className={faceClassName}>
          {back}
        </div>
      </div>
      <button
        type="button"
        className={actionClassName}
        aria-controls={uid}
        aria-expanded={isBack}
        onClick={() => setBack(!isBack)}
      >
        {actionLabel(isBack)}
      </button>
    </section>
  )
}
