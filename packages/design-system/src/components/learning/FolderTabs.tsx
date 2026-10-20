import { useId } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { useLearningState } from './shared'

export interface FolderTab {
  id: string
  label: string
  content: ReactNode
}

export interface FolderTabsProps {
  label: string
  tabs: readonly FolderTab[]
  selectedId?: string
  defaultSelectedId?: string
  onSelect?: (id: string) => void
  className?: string
}

export function FolderTabs({
  label,
  tabs,
  selectedId,
  defaultSelectedId,
  onSelect,
  className = '',
}: FolderTabsProps) {
  const uid = useId()
  const [selected, setSelected] = useLearningState(
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
    <div data-comp="folder-tabs" className={`learning-object learning-folder ${className}`}>
      <div className="learning-folder-tabs" role="tablist" aria-label={label}>
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
      <div className="learning-folder-paper">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${uid}-panel-${index}`}
            aria-labelledby={`${uid}-tab-${index}`}
            hidden={active !== tab.id}
            tabIndex={0}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
