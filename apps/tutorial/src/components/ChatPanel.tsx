import * as styles from '@idealjs/stack-ui-kit/styles'
import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
export interface ChatItem {
  kind: 'user' | 'assistant' | 'tool'
  text: string
}

export function ChatPanel({
  items,
  busy,
  ready,
  hasKey,
  model,
  draft,
  onDraftChange,
  focusSignal = 0,
  onSend,
  onStop,
  onOpenKey,
  flat = false,
}: {
  items: ChatItem[]
  busy: boolean

  ready: boolean
  hasKey: boolean
  model: string
  draft: string
  onDraftChange: (text: string) => void
  focusSignal?: number
  onSend: (text: string) => void
  onStop: () => void
  onOpenKey: () => void

  flat?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (focusSignal > 0) textareaRef.current?.focus()
  }, [focusSignal])

  const submit = () => {
    const text = draft.trim()
    if (!text || busy || !ready) return
    onDraftChange('')
    onSend(text)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-xl border-2 ${styles.borderInk} ${styles.bgPaper} ${flat ? '' : `${styles.shadowInk}`}`}
    >
      <div
        className={`flex items-center gap-2 border-b border-dashed ${styles.borderInk20} px-3 py-2`}
      >
        <span className={`${styles.tSmallStrong}`}>陪练 agent</span>
        <span className={`${styles.tSmallMute} min-w-0 flex-1 truncate font-mono`}>{model}</span>
        <button
          type="button"
          onClick={onOpenKey}
          className={`cursor-pointer rounded-lg border-2 ${styles.borderInk} px-2 py-0.5 text-[12px] font-bold transition-colors ${
            hasKey
              ? `${styles.bgPaper} ${styles.textBody} ${styles.hoverBgPaperDeep}`
              : `${styles.bgClash2a} ${styles.textInk}`
          }`}
        >
          {hasKey ? '接入配置' : '填写 Key'}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto p-3">
        {items.map((item, i) =>
          item.kind === 'tool' ? (
            <p key={i} className={`${styles.tSmallMute} m-0 font-mono`}>
              {item.text}
            </p>
          ) : (
            <div
              key={i}
              className={`flex ${item.kind === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-xl border-2 ${styles.borderInk} px-3 py-2 text-[13.5px] leading-6 whitespace-pre-wrap ${
                  item.kind === 'user'
                    ? `${styles.bgPaperDeep} ${styles.textInk}`
                    : `${styles.bgPaper} ${styles.textBody}`
                }`}
              >
                {item.text}
              </div>
            </div>
          ),
        )}
        {busy && (
          <p className={`${styles.tSmallMute} m-0 animate-pulse font-mono`}>agent 工作中…</p>
        )}
      </div>

      <div className={`border-t border-dashed ${styles.borderInk20} p-2.5`}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            !ready
              ? '练习环境启动中…'
              : hasKey
                ? '告诉 agent 要做什么（Enter 发送，Shift+Enter 换行）'
                : '先填写 API Key'
          }
          className={`w-full resize-none rounded-lg border-2 ${styles.borderInk} ${styles.bgPaper} px-2.5 py-1.5 text-[13.5px] leading-6 outline-none ${styles.focusBgPaperDeep}`}
        />
        <div className="mt-1.5 flex justify-end gap-2">
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              className={`cursor-pointer rounded-lg border-2 ${styles.borderInk} ${styles.bgClash1a} px-3 py-1 text-[13px] font-bold ${styles.textInk} transition-colors ${styles.hoverBgClash1a80}`}
            >
              停止
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!ready}
              className={`cursor-pointer rounded-lg border-2 ${styles.borderInk} ${styles.bgClash1b} px-3 py-1 text-[13px] font-bold ${styles.textInk} transition-colors ${styles.hoverBgClash1b80} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
