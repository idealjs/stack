import type { CSSProperties } from 'react'

export type LearningTone = 'coral' | 'teal' | 'yellow' | 'violet' | 'pink' | 'blue'

const COLORS: Record<LearningTone, string> = {
  coral: 'var(--color-clash1a)',
  teal: 'var(--color-clash1b)',
  yellow: 'var(--color-clash2a)',
  violet: 'var(--color-clash2b)',
  pink: 'var(--color-clash3a)',
  blue: 'var(--color-clash3b)',
}

export function toneStyle(tone: LearningTone): CSSProperties {
  return { '--learning-accent': COLORS[tone] } as CSSProperties
}

export { useControllableState as useLearningState } from '@idealjs/stack-ui-kit'
