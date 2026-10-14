/** 只读文件树——agent 每次 write 后由工作区重扫刷新，用户只看不改 */
import type { FileEntry } from '../lib/webcontainer'

export function FileTree({ entries }: { entries: FileEntry[] | null }) {
  return (
    <div className="flex h-full flex-col">
      <p className="t-small-mute m-0 border-b border-dashed border-ink/15 px-3 py-1.5">文件</p>
      <ul className="m-0 list-none overflow-auto p-2 font-mono text-[12px] leading-5">
        {entries === null && <li className="t-small-mute">扫描中…</li>}
        {entries?.map((e) => (
          <li key={e.path} style={{ paddingLeft: (e.depth - 1) * 12 }} className="truncate">
            <span className={e.kind === 'dir' ? 'font-bold text-ink' : 'text-body'}>
              {e.kind === 'dir' ? `${e.path.split('/').pop()}/` : e.path.split('/').pop()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
