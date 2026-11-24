import type { KeyboardEvent, ReactNode } from 'react'
import { useId } from 'react'
import { useControllableState } from '../hooks/useControllableState'

export interface TabItem {
  id: string
  label: ReactNode
  content: ReactNode
}

export interface TabsProps {
  label: string
  tabs: readonly TabItem[]
  selectedId?: string
  defaultSelectedId?: string
  onSelect?: (id: string) => void
  rootClassName?: string
  listClassName?: string
  paperClassName?: string
  'data-comp'?: string
}

export function Tabs({
  label,
  tabs,
  selectedId,
  defaultSelectedId,
  onSelect,
  rootClassName = '',
  listClassName = '',
  paperClassName = '',
  'data-comp': component = 'tabs',
}: TabsProps) {
  const uid = useId()
  const [selected, setSelected] = useControllableState(
    selectedId,
    defaultSelectedId ?? tabs[0]?.id ?? '',
    onSelect,
  )
  const active = tabs.some((tab) => tab.id === selected) ? selected : tabs[0]?.id

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    setSelected(tabs[next].id)
    document.getElementById(`${uid}-tab-${next}`)?.focus()
  }

  return (
    <div data-comp={component} className={rootClassName}>
      <div className={listClassName} role="tablist" aria-label={label}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${index}`}
            aria-controls={`${uid}-panel-${index}`}
            aria-selected={active === tab.id}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setSelected(tab.id)}
            onKeyDown={(event) => navigate(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={paperClassName}>
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${uid}-panel-${index}`}
            aria-labelledby={`${uid}-tab-${index}`}
            hidden={active !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
