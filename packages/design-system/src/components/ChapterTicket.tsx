
import type { Chapter } from '../lib/types'
import { Ticket } from './Ticket'
import type { TicketProps } from './Ticket'

export interface ChapterTicketProps extends Pick<TicketProps, 'holePosition' | 'holeSize' | 'hover'> {
  chapter: Chapter
  done: boolean
}

export function ChapterTicket({ chapter, done, ...ticketProps }: ChapterTicketProps) {
  return (
    <Ticket punched={done} className="flex w-[200px] items-stretch" {...ticketProps}>
      <div className="flex w-12 shrink-0 items-center justify-center text-[22px]" style={{ background: chapter.color }}>{chapter.emoji}</div>
      <div className="ticket-title flex flex-1 items-center py-2.5 pl-2.5 pr-2">
        <b className="text-content font-bold">{chapter.title}</b>
      </div>
      <div className={`ticket-stub flex shrink-0 items-center justify-center font-mono text-small text-mute ${done ? 'border-dashed' : 'border-solid'}`}>
        №{String(chapter.id).padStart(2, '0')}
      </div>
    </Ticket>
  )
}
