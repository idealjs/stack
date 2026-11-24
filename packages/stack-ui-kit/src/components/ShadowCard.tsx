import type { ReactNode } from 'react'
import { hoverableShadow } from './effectClasses.css.ts'
import { hoverHost } from './hoverHost.css.ts'
import {
  shadowCardBody,
  shadowCardHost,
  shadowCardHover,
  shadowCardTicketWidth,
  shadowCardWrap,
} from './shadowCard.css.ts'
import { ticketPerforation } from './ticket.css.ts'
import type { TicketProps } from './Ticket'
import { Ticket } from './Ticket'

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
        className={`${shadowCardTicketWidth} ${className}`}
      >
        {children}
        <i aria-hidden className={ticketPerforation} />
      </Ticket>
    )
  }
  return (
    <span className={`${hoverHost} ${shadowCardHost}`}>
      <div
        data-comp="shadow-card"
        className={`${shadowCardWrap} ${hover ? `${hoverableShadow} ${shadowCardHover}` : ''}`}
      >
        <div className={`${shadowCardBody} ${className}`}>{children}</div>
      </div>
    </span>
  )
}
