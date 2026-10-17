/** ShadowCard —— 阴影卡三部曲（票券效果的重推导；标本卡，内容留空）
 * 普通卡使用 shadow-ink；票券复用 Ticket 的票面 mask 与内层包裹 drop-shadow。
 * 撕线在票面内，孔缘挂 wrapper，圆心与票面外缘使用同一坐标系。 */
import type { ReactNode } from 'react'
import { Ticket } from './Ticket'
import type { TicketProps } from './Ticket'

export function ShadowCard({
  hover = false,
  ticket = false,
  holePosition,
  holeSize,
  className = '',
  children,
}: Pick<TicketProps, 'holePosition' | 'holeSize'> & {
  /** 拿起动效：浮起 3px＋阴影 5→8（同 Button / MemphisCard 规格） */
  hover?: boolean
  /** 票券咬边：票面撕线＋两端半圆孔，阴影跟随打孔轮廓生成 */
  ticket?: boolean
  /** 传入票体（内层卡）：尺寸等 */
  className?: string
  children?: ReactNode
}) {
  if (ticket) {
    return (
      <Ticket data-comp="shadow-card" hover={hover} holePosition={holePosition} holeSize={holeSize} className={`w-[200px] ${className}`}>
        {children}
        <i aria-hidden className="ticket-perforation" />
      </Ticket>
    )
  }
  return (
    <div
      data-comp="shadow-card"
      className={`relative w-fit rounded-xl shadow-ink
        ${hover ? 'transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px]' : ''}`}
    >
      {/* 票体：纯视觉卡（描边＋底色），尺寸类由 className 进入 */}
      <div className={`relative w-[200px] rounded-xl border-2 border-ink bg-paper ${className}`}>{children}</div>
    </div>
  )
}
