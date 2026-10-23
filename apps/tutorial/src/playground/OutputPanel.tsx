import type { ConsoleLevel } from './protocol'

export interface OutputLine {
  level: ConsoleLevel | 'system'
  text: string
  stage?: 'build'
}

const LEVEL_STYLE: Record<OutputLine['level'], string> = {
  log: 'bg-paper-deep text-body',
  info: 'bg-paper-deep text-body',
  warn: 'bg-clash2a text-ink',
  error: 'bg-clash1a text-ink',
  system: 'bg-paper text-mute',
}

export function OutputPanel({ lines, done }: { lines: OutputLine[]; done: boolean }) {
  return (
    <section aria-label="输出" className="mt-4 rounded-xl border-2 border-ink bg-white p-3">
      <h2 className="t-small-strong m-0 mb-2">输出</h2>
      {lines.length === 0 && !done && (
        <p className="t-small-mute m-0">（还没有输出——点「运行」试试）</p>
      )}
      <ul className="m-0 mb-0 list-none p-0">
        {lines.map((l, i) => (
          <li
            key={i}
            className="mb-1 flex items-baseline gap-2 font-mono text-[13px] leading-relaxed"
          >
            <span
              className={`shrink-0 rounded-md px-1.5 text-[11px] font-bold ${LEVEL_STYLE[l.level]}`}
            >
              {l.stage === 'build' ? '构建' : l.level}
            </span>
            <span className="min-w-0 break-all whitespace-pre-wrap text-body">{l.text}</span>
          </li>
        ))}
      </ul>
      {done && <p className="t-small-mute m-0 mt-1">✓ 执行完毕</p>}
    </section>
  )
}
