import { Ticket, TicketProps } from '@idealjs/stack-ui-kit'
import type { Chapter } from '../types'
import {
  emojiZone,
  stubDashed,
  stubSolid,
  stubZone,
  ticketFaceRow,
  titleText,
  titleZone,
} from './chapterTicket.css'

export interface ChapterTicketProps
  extends Pick<TicketProps, 'holePosition' | 'holeSize' | 'hover'> {
  chapter: Chapter
  done: boolean
}

export function ChapterTicket({ chapter, done, ...ticketProps }: ChapterTicketProps) {
  return (
    <Ticket punched={done} className={ticketFaceRow} {...ticketProps}>
      <div className={emojiZone} style={{ background: chapter.color }}>
        {chapter.emoji}
      </div>
      <div className={titleZone}>
        <b className={titleText}>{chapter.title}</b>
      </div>
      <div className={`${stubZone} ${done ? stubDashed : stubSolid}`}>
        №{String(chapter.id).padStart(2, '0')}
      </div>
    </Ticket>
  )
}
