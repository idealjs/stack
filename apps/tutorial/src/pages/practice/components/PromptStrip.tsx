/** 提示词条——黄色便签条（撞色 token + 2px ink 描边 + 硬投影），一处实现、处处同款：
 * 陪练 agent 的开场提示词（CoachSticky 便签内，flat 无投影）与「创建项目」板块的示例提示词共用。
 * copied 态内聚自管（写剪贴板 + 1.6s 复位）；「发给陪练」走调用方传入的 onSend——与输入框
 * 同一条 send() 通道，无 Key 弹 KeyModal、busy/未就绪禁用的分支都由通道所有方（PracticeWorkspace）处理。
 * SSG 安全：renderToString 下不碰 window，副作用全在 handler/effect 里。 */
import { useEffect, useRef, useState } from 'react'

export interface PromptStripProps {
  /** 左上角小标题（开场提示词 / 示例 N），缺省时只显示正文 */
  title?: string
  /** 提示词原文：复制与发送的唯一来源 */
  text: string
  /** 发送回调——与陪练输入同一条通道 */
  onSend: (text: string) => void
  /** 环境未就绪等不可发送状态 */
  disabled?: boolean
  /** agent 工作中：发送同样禁用 */
  busy?: boolean
  /** 发送按钮文案，默认「发给陪练」 */
  sendLabel?: string
  /** 嵌在便签框内时去掉硬投影（与 ChatPanel 的 flat 同语义） */
  flat?: boolean
  /** 供 e2e 定位 */
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
