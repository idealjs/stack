import { useState } from 'react'
import { Dropdown } from '../../design-system'

const ZONE_BASE = 't-small-mute rounded-xl border-2 border-dashed border-ink/25 px-2.5 pt-1.5'

const CARD_BASE = 'w-fit rounded-xl border-2 border-ink bg-white p-3'

export function DropdownPreview() {
  const [downOpen, setDownOpen] = useState(false)
  const [upOpen, setUpOpen] = useState(false)

  return (
    <div data-testid="dropdown-preview" className="flex flex-wrap items-start gap-8">
      <div className={`${CARD_BASE} flex flex-col items-end`}>
        <div className="mb-2 self-start text-[13px] font-extrabold">placement · bottom</div>
        <div className="text-small mb-2 self-start text-[#555]">
          向下展开 · tips 贴签与验收夹的形态
        </div>
        <div className="relative w-fit">
          <Dropdown
            comp="dropdown-demo-down"
            panelId="dropdown-demo-down-panel"
            label="向下 · tips 形"
            open={downOpen}
            onOpenChange={setDownOpen}
            triggerClassName="flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12.5px] font-extrabold text-ink transition-[background-color] duration-150 motion-reduce:transition-none hover:bg-paper-deep"
            trigger={
              <>
                <span aria-hidden>💡</span>
                <span>tips</span>
                <span aria-hidden className="text-[10px] leading-none">
                  {downOpen ? '▴' : '▾'}
                </span>
              </>
            }
          >
            <div className="rounded-xl border-2 border-ink bg-paper p-3">
              <p className="t-small-strong m-0">tips 贴签面板</p>
              <ul className="mt-2 mb-0 list-none space-y-1.5 p-0 text-small text-body">
                <li>点入口开合，点面板外任意处收起</li>
                <li>Esc 收起，面板内点击不收</li>
                <li>展开 200ms、收起 100ms，收起利落</li>
              </ul>
              <p className="t-small-mute mb-0 mt-2">真件应用：练习场 tips 贴签、验收夹</p>
            </div>
          </Dropdown>
        </div>
        <div className={`${ZONE_BASE} mt-2 h-[196px] w-[min(380px,100vw_-_48px)]`}>面板展开区</div>
      </div>

      <div className={`${CARD_BASE} flex flex-col items-end`}>
        <div className="mb-2 self-start text-[13px] font-extrabold">placement · top</div>
        <div className="text-small mb-2 self-start text-[#555]">
          向上弹出 · 陪练 agent 底角弹层的形态
        </div>
        <div className={`${ZONE_BASE} mb-2 h-[248px] w-[min(360px,100vw_-_48px)]`}>面板展开区</div>
        <div className="relative w-fit">
          <Dropdown
            comp="dropdown-demo-up"
            panelId="dropdown-demo-up-panel"
            label="向上 · agent 形"
            open={upOpen}
            onOpenChange={setUpOpen}
            placement="top"
            panelClassName="w-[min(360px,100vw_-_24px)]"
            triggerClassName="flex cursor-pointer items-center gap-2 rounded-t-lg border-2 border-ink bg-clash2a py-2 pr-4 pl-3 text-[12.5px] font-extrabold text-ink transition-[filter] duration-150 motion-reduce:transition-none hover:brightness-95"
            trigger={
              <>
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full border-2 border-ink bg-paper"
                />
                <span>陪练 agent</span>
                <span aria-hidden className="ml-0.5">
                  {upOpen ? '▾' : '▴'}
                </span>
              </>
            }
          >
            <div className="relative h-[220px] rounded-b-lg rounded-tl-lg border-2 border-ink bg-clash2a p-2 shadow-ink">
              <span
                aria-hidden
                className="absolute right-0 bottom-0 size-4 border-t-2 border-l-2 border-ink bg-paper-deep"
              />
              <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border-2 border-ink bg-paper p-3">
                <p className="t-small-strong m-0">陪练弹层面板</p>
                <p className="m-0 text-small text-body">
                  底角弹层从贴签向上弹出，pop 缩放归位；Esc 与点外收起同 tips 形。
                </p>
                <p className="t-small-mute mb-0 mt-auto">真件应用：练习场陪练 agent 贴签</p>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
