import { Tabs } from '@idealjs/stack-ui-kit'
import type { TabItem, TabsProps } from '@idealjs/stack-ui-kit'

export type FolderTab = TabItem

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
  const skin: Pick<TabsProps, 'rootClassName' | 'listClassName' | 'paperClassName'> = {
    rootClassName: `learning-object learning-folder ${className}`,
    listClassName: 'learning-folder-tabs',
    paperClassName: 'learning-folder-paper',
  }
  return (
    <Tabs
      data-comp="folder-tabs"
      label={label}
      tabs={tabs}
      selectedId={selectedId}
      defaultSelectedId={defaultSelectedId}
      onSelect={onSelect}
      {...skin}
    />
  )
}
