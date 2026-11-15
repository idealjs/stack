import { neighborsOf, type PageKey, relHref } from '../lib/pages'

export function PageTurnBar({ from }: { from: PageKey }) {
  const neighbors = neighborsOf(from)
  if (neighbors === undefined) return null
  const { prev, next } = neighbors
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <a
        href={relHref(from, prev.key)}
        data-dir="prev"
        className="max-w-[36ch] truncate rounded-xl border-2 border-ink bg-paper px-4 py-2 text-[12.5px] font-bold text-ink no-underline shadow-ink"
      >
        ← {prev.title}
      </a>
      {from === 'index' ? (
        <span />
      ) : (
        <a
          href={relHref(from, 'index')}
          className="flex-none rounded-xl border-2 border-ink bg-ink px-4 py-2 text-[12.5px] font-bold text-paper no-underline"
        >
          返回首页
        </a>
      )}
      <a
        href={relHref(from, next.key)}
        data-dir="next"
        className="max-w-[36ch] truncate rounded-xl border-2 border-ink bg-paper px-4 py-2 text-[12.5px] font-bold text-ink no-underline shadow-ink"
      >
        {next.title} →
      </a>
    </div>
  )
}
