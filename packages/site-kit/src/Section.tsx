/** Section —— 页面内容小节：小标签（t-small-strong）＋可选注解（t-small-mute）＋children。
 * 自 tutorial 的 lib/ui.tsx 原样平移，无内容语义。 */
import type { ReactNode } from 'react'

export function Section({ label, note, id, className = '', children }: { label?: string; note?: string; id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mb-8 ${className}`}>
      {(label || note) && (
        <h2 className="mb-2.5 flex flex-wrap items-baseline gap-2">
          {label && <span className="t-small-strong">{label}</span>}
          {note && <i className="t-small-mute not-italic">{note}</i>}
        </h2>
      )}
      {children}
    </section>
  )
}
