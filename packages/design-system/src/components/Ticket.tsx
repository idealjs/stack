
import type { CSSProperties, HTMLAttributes } from 'react'

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
    <div
      {...props}
      data-comp={component}
      className={`ticket-shell w-fit rounded-xl ${hasHoles ? 'tk-pk' : ''} ${hover ? 'ticket-lift' : ''} ${wrapperClassName}`}
      style={ticketStyle}
    >
      <div className="ticket-shadow">
        <div className={`ticket-face relative overflow-hidden rounded-xl border-2 border-ink bg-paper ${hasHoles ? 'ticket-pk' : ''} ${className}`}>
          {children}
        </div>
      </div>
      {hasHoles && (
        <>
          <i className="pk-arc pk-arc-t" aria-hidden />
          <i className="pk-arc pk-arc-b" aria-hidden />
        </>
      )}
    </div>
  )
}
