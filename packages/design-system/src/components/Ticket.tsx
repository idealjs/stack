/** 通用票券：票面 mask 打孔，内层包裹 drop-shadow 跟随轮廓生成阴影；孔缘描边不参与投影。 */
import type { CSSProperties, HTMLAttributes } from 'react'

export interface TicketProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否打上下双孔，默认 true；孔径为 0 时不打孔 */
  punched?: boolean
  /** 上下孔圆心的横坐标：number 为距左侧的 px，string 支持百分比与 calc()；默认在票根处 */
  holePosition?: number | string
  /** 孔径，单位 px，默认 12；孔缘描边同步调整 */
  holeSize?: number
  /** hover 浮起 3px，阴影偏移 5px→8px，默认 true */
  hover?: boolean
  /** 票面尺寸与内容布局 */
  className?: string
  /** 外层布局类名；style 与其他 div 属性也传给外层 */
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
