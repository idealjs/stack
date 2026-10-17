/** 聊天面板——用户与陪练 agent 的对话视图（纯展示，会话状态在工作区）。
 * 常驻于 CoachSticky 便签的展开态：notice 是注入输入区上方的开场提示词条，flat 去掉外投影（便签框内不再叠影）。 */
import { useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

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
  onSend,
  onStop,
  onOpenKey,
  notice,
  flat = false,
}: {
  items: ChatItem[]
  busy: boolean
  /** 浏览器内运行时就绪后才允许发消息 */
  ready: boolean
  hasKey: boolean
  model: string
  onSend: (text: string) => void
  onStop: () => void
  onOpenKey: () => void
  /** 输入区上方的注入条（如当前任务的开场提示词） */
  notice?: ReactNode
  /** 去掉外投影（嵌在便签框内时） */
  flat?: boolean
}) {
  const [draft, setDraft] = useState('')

  const submit = () => {
    const text = draft.trim()
    if (!text || busy || !ready) return
    setDraft('')
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
      className={`flex h-full min-h-0 flex-col rounded-xl border-2 border-ink bg-paper ${flat ? '' : 'shadow-hard'}`}
    >
      {/* 头部：模型 + key 配置入口 */}
      <div className="flex items-center gap-2 border-b border-dashed border-ink/20 px-3 py-2">
        <span className="t-small-strong">陪练 agent</span>
        <span className="t-small-mute min-w-0 flex-1 truncate font-mono">{model}</span>
        <button
          type="button"
          onClick={onOpenKey}
          className={`cursor-pointer rounded-lg border-2 border-ink px-2 py-0.5 text-[12px] font-bold transition-colors ${
            hasKey ? 'bg-paper text-body hover:bg-paper-deep' : 'bg-clash2a text-ink'
          }`}
        >
          {hasKey ? '接入配置' : '填写 Key'}
        </button>
      </div>

      {/* 消息流 */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto p-3">
        {items.map((item, i) =>
          item.kind === 'tool' ? (
            <p key={i} className="t-small-mute m-0 font-mono">
              {item.text}
            </p>
          ) : (
            <div key={i} className={`flex ${item.kind === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[92%] rounded-xl border-2 border-ink px-3 py-2 text-[13.5px] leading-6 whitespace-pre-wrap ${
                  item.kind === 'user' ? 'bg-paper-deep text-ink' : 'bg-paper text-body'
                }`}
              >
                {item.text}
              </div>
            </div>
          ),
        )}
        {busy && <p className="t-small-mute m-0 animate-pulse font-mono">agent 工作中…</p>}
      </div>

      {/* 注入条（开场提示词等）：位于输入区上方 */}
      {notice && <div className="border-t border-dashed border-ink/20 p-2.5">{notice}</div>}

      {/* 输入区 */}
      <div className="border-t border-dashed border-ink/20 p-2.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            !ready ? '练习环境启动中…' : hasKey ? '告诉 agent 要做什么（Enter 发送，Shift+Enter 换行）' : '先填写 API Key'
          }
          className="w-full resize-none rounded-lg border-2 border-ink bg-paper px-2.5 py-1.5 text-[13.5px] leading-6 outline-none focus:bg-paper-deep"
        />
        <div className="mt-1.5 flex justify-end gap-2">
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              className="cursor-pointer rounded-lg border-2 border-ink bg-clash1a px-3 py-1 text-[13px] font-bold text-ink transition-colors hover:bg-clash1a/80"
            >
              停止
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!ready}
              className="cursor-pointer rounded-lg border-2 border-ink bg-clash1b px-3 py-1 text-[13px] font-bold text-ink transition-colors hover:bg-clash1b/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
