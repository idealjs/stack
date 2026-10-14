import { useState } from 'react'
import { Ticket } from '@stack/design-system'

/** 直接改变 React props，预览孔位、孔径和拿起动效（自 design-lab 迁入）。 */
export function TicketPreview() {
  const [position, setPosition] = useState('50%')
  const [size, setSize] = useState(20)
  const [punched, setPunched] = useState(true)
  const [hover, setHover] = useState(true)
  const holePosition = /^\d+(\.\d+)?$/.test(position) ? Number(position) : position

  return (
    <div data-testid="ticket-preview">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-small">
        <label className="flex items-center gap-1">
          孔位
          <input className="w-40 rounded border border-ink bg-white px-2 py-1" value={position} onChange={(e) => setPosition(e.target.value)} />
        </label>
        <label className="flex items-center gap-1">
          孔径
          <input type="number" min="0" step="2" className="w-16 rounded border border-ink bg-white px-2 py-1" value={size} onChange={(e) => setSize(Number(e.target.value))} />
          px
        </label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={punched} onChange={(e) => setPunched(e.target.checked)} />打孔</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={hover} onChange={(e) => setHover(e.target.checked)} />hover 动效</label>
      </div>
      <div data-testid="ticket-preview-canvas" className="w-fit p-5">
        <Ticket holePosition={holePosition} holeSize={size} punched={punched} hover={hover} className="flex h-[80px] w-[240px] items-center justify-center font-bold">
          自定义票券
        </Ticket>
      </div>
    </div>
  )
}
