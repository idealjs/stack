import { Stamp } from './Stamp'
import { useLearningState } from './shared'

export interface ChecklistItem {
  id: string
  label: string
  detail?: string
}

export interface ClipboardChecklistProps {
  title: string
  description?: string
  items: readonly ChecklistItem[]
  checkedIds?: readonly string[]
  defaultCheckedIds?: readonly string[]
  onCheckedChange?: (ids: readonly string[]) => void
  className?: string
}

export function ClipboardChecklist({
  title,
  description,
  items,
  checkedIds,
  defaultCheckedIds = [],
  onCheckedChange,
  className = '',
}: ClipboardChecklistProps) {
  const [checked, setChecked] = useLearningState(checkedIds, defaultCheckedIds, onCheckedChange)
  const count = items.filter((item) => checked.includes(item.id)).length
  const complete = items.length > 0 && count === items.length

  return (
    <section
      data-comp="clipboard-checklist"
      className={`learning-object learning-clipboard ${className}`}
    >
      <span className="learning-clipboard-clip" aria-hidden="true" />
      <div className="learning-clipboard-paper">
        <div className="learning-eyebrow">CHECK / 验收清单</div>
        <h3>{title}</h3>
        {description && <p className="learning-description">{description}</p>}
        <ul className="learning-checklist">
          {items.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={checked.includes(item.id)}
                  onChange={(event) =>
                    setChecked(
                      event.target.checked
                        ? [...checked.filter((id) => id !== item.id), item.id]
                        : checked.filter((id) => id !== item.id),
                    )
                  }
                />
                <span>
                  <b>{item.label}</b>
                  {item.detail && <small>{item.detail}</small>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="learning-clipboard-footer" aria-live="polite">
          <span>
            已核对 {count} / {items.length}
          </span>
          {complete && <Stamp />}
        </div>
      </div>
    </section>
  )
}
