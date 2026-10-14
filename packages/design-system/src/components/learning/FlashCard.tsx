import { useId } from 'react'
import type { ReactNode } from 'react'
import { toneStyle, useLearningState } from './shared'
import type { LearningTone } from './shared'

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
  question, answer, label = '知识卡', flipped, defaultFlipped = false, onFlip, tone = 'violet', className = '',
}: FlashCardProps) {
  const uid = useId()
  const [back, setBack] = useLearningState(flipped, defaultFlipped, onFlip)
  return (
    <section data-comp="flash-card" data-flipped={back} className={`learning-object learning-flashcard ${className}`} style={toneStyle(tone)}>
      <div className="learning-flashcard-top"><span>{label}</span><span>{back ? '背面 / A' : '正面 / Q'}</span></div>
      <div id={uid} className="learning-flashcard-content" aria-live="polite">
        <div key={String(back)} className="learning-flashcard-face learning-prose">{back ? answer : question}</div>
      </div>
      <button type="button" className="learning-action" aria-controls={uid} aria-expanded={back} onClick={() => setBack(!back)}>
        {back ? '↶ 返回问题' : '↻ 翻面看答案'}
      </button>
    </section>
  )
}
