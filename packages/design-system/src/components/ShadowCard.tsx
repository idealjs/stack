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
  hover?: boolean

  ticket?: boolean

  className?: string
  children?: ReactNode
}) {
  if (ticket) {
    return (
      <Ticket
        data-comp="shadow-card"
        hover={hover}
        holePosition={holePosition}
        holeSize={holeSize}
        className={`w-[200px] ${className}`}
      >
        {children}
        <i aria-hidden className="ticket-perforation" />
      </Ticket>
    )
  }
  return (
    <div
      data-comp="shadow-card"
      className={`relative w-fit rounded-xl shadow-ink
        ${hover ? 'transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-ink-lift' : ''}`}
    >
      {/* 票体：纯视觉卡（描边＋底色），尺寸类由 className 进入 */}
      <div className={`relative w-[200px] rounded-xl border-2 border-ink bg-paper ${className}`}>
        {children}
      </div>
    </div>
  )
}
