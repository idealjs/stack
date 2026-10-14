export interface StampProps {
  status?: 'done' | 'review' | 'pending'
  children?: string
  className?: string
}

const LABELS = { done: '已核对', review: '待复查', pending: '待验收' } as const

/** 印章只表达验收状态，完成与否由调用方决定。 */
export function Stamp({ status = 'done', children, className = '' }: StampProps) {
  return (
    <span data-comp="stamp" data-status={status} className={`learning-stamp ${className}`}>
      <span aria-hidden="true">{status === 'done' ? '✓' : status === 'review' ? '↺' : '○'}</span>
      {children ?? LABELS[status]}
    </span>
  )
}
