
import { useEffect, useRef, useState } from 'react'

export interface PromptStripProps {
  
  title?: string
  
  text: string
  
  onSend: (text: string) => void
  
  disabled?: boolean
  
  busy?: boolean
  
  sendLabel?: string
  
  flat?: boolean
  
  testId?: string
}

const COPIED_RESET_MS = 1600

export function PromptStrip({
  title,
  text,
  onSend,
  disabled = false,
  busy = false,
  sendLabel = '发给陪练',
  flat = false,
  testId,
}: PromptStripProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const copy = () => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true)
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(() => setCopied(false), COPIED_RESET_MS)
      })
      .catch(() => {})
  }

  return (
    <div
      data-testid={testId}
      className={`rounded-lg border-2 border-ink bg-clash2a px-2.5 py-2 ${flat ? '' : 'shadow-ink'}`}
    >
      {title && <p className="t-small-strong m-0">{title}</p>}
      <p className={`text-[12.5px] leading-5 text-ink ${title ? 'mt-1 mb-0' : 'm-0'}`}>{text}</p>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={copy}
          className="cursor-pointer rounded-lg border-2 border-ink bg-paper px-2.5 py-1 text-[12px] font-bold text-body transition-colors hover:bg-paper-deep"
        >
          {copied ? '已复制' : '复制'}
        </button>
        <button
          type="button"
          onClick={() => onSend(text)}
          disabled={disabled || busy}
          className="cursor-pointer rounded-lg border-2 border-ink bg-clash1b px-2.5 py-1 text-[12px] font-bold text-ink transition-colors hover:bg-clash1b/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendLabel}
        </button>
      </div>
    </div>
  )
}
