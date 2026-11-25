import type { CSSProperties, HTMLAttributes } from 'react'
import {
  pkArc,
  pkArcB,
  pkArcT,
  ticketFace,
  ticketHost,
  ticketPk,
  ticketShell,
} from './ticket.css.ts'
import { hoverHost } from './hoverHost.css.ts'
import { ticketLift, ticketShadow } from './effectClasses.css.ts'

export interface TicketProps extends HTMLAttributes<HTMLDivElement> {
  punched?: boolean

  holePosition?: number | string

  holeSize?: number

  hover?: boolean

  className?: string

  wrapperClassName?: string

  'data-comp'?: string
}

export function Ticket({
  children,
  punched = true,
  holePosition,
  holeSize = 12,
  hover = true,
  className = '',
  wrapperClassName = '',
  style,
  'data-comp': component = 'ticket',
  ...props
}: TicketProps) {
  const hasHoles = punched && holeSize > 0
  const ticketStyle: CSSProperties & { '--hole-x'?: string; '--hole-radius': string } = {
    ...style,
    '--hole-radius': `${Math.max(0, holeSize) / 2}px`,
  }
  if (holePosition !== undefined) {
    ticketStyle['--hole-x'] = typeof holePosition === 'number' ? `${holePosition}px` : holePosition
  }

  return (
    <span className={`${hoverHost} ${ticketHost}`}>
      <div
        {...props}
        data-comp={component}
        className={`ticket-shell ${ticketShell} ${hasHoles ? 'tk-pk' : ''} ${hover ? ticketLift : ''} ${wrapperClassName}`}
        style={ticketStyle}
      >
        <div className={ticketShadow}>
          <div className={`${ticketFace} ${hasHoles ? ticketPk : ''} ${className}`}>{children}</div>
        </div>
        {hasHoles && (
          <>
            <i className={`${pkArc} ${pkArcT} pk-arc pk-arc-t`} aria-hidden />
            <i className={`${pkArc} ${pkArcB} pk-arc pk-arc-b`} aria-hidden />
          </>
        )}
      </div>
    </span>
  )
}
