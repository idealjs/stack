import { FlipCard } from '@idealjs/stack-ui-kit'
import type { ReactNode } from 'react'
import type { LearningTone } from './shared'
import { toneStyle } from './shared'

export interface FlashCardProps {
  question: ReactNode
  answer: ReactNode
  label?: string
  flipped?: boolean
  defaultFlipped?: boolean
  onFlip?: (flipped: boolean) => void
  tone?: LearningTone
  className?: string
}

export function FlashCard({
  question,
  answer,
  label = '知识卡',
  flipped,
  defaultFlipped = false,
  onFlip,
  tone = 'violet',
  className = '',
}: FlashCardProps) {
  return (
    <FlipCard
      data-comp="flash-card"
      label={label}
      faceHint={(back) => (back ? '背面 / A' : '正面 / Q')}
      actionLabel={(back) => (back ? '↶ 返回问题' : '↻ 翻面看答案')}
      front={question}
      back={answer}
      flipped={flipped}
      defaultFlipped={defaultFlipped}
      onFlip={onFlip}
      rootClassName={`learning-object learning-flashcard ${className}`}
      topClassName="learning-flashcard-top"
      contentClassName="learning-flashcard-content"
      faceClassName="learning-flashcard-face learning-prose"
      actionClassName="learning-action"
      style={toneStyle(tone)}
    />
  )
}
