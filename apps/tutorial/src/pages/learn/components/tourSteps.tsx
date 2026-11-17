import type { Step } from 'react-joyride'
import { ShadowButton } from '../../../design-system'

export const INTRO = 0
export const ADD_FILL = 1
export const ADD_CLICK = 2
export const SEARCH = 3
export const CHECK = 4
export const DELETE = 5
export const SUMMARY = 6

export type TourAction = { label: string; run: () => void; nextIndex: number }

export const buildSteps = (
  large: boolean,
  listEmpty: boolean,
  added: boolean,
  actions: TourAction[],
  runAction: (action: TourAction) => void,
  go: (index: number) => void,
  stop: () => void,
): (Step & { action?: TourAction })[] => {
  const actionButton = (action: TourAction) => (
    <ShadowButton size="sm" tone="clash2a" onClick={() => runAction(action)}>
      {action.label}
    </ShadowButton>
  )
  const closeButton = (
    <button className="learn-tour-close" aria-label="关闭引导" onClick={stop}>
      ×
    </button>
  )
  const navButtons = (back: number | null, next: number | null, nextLabel = '下一步') => (
    <div className="learn-tour-nav">
      {back !== null && (
        <button className="learn-tour-nav-button" onClick={() => go(back)}>
          上一步
        </button>
      )}
      {next !== null && (
        <button className="learn-tour-nav-button" onClick={() => go(next)}>
          {nextLabel}
        </button>
      )}
    </div>
  )
  const [intro, fill, click, search, check, remove] = actions
  return [
    {
      target: '[data-comp="browser-mockup"]',
      skipBeacon: true,
      buttons: [],
      placement: large ? 'right' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          <p className="m-0">
            这是你学完全栈后能亲手做出来的待办应用。先别急着读文字，花 30 秒把它玩一遍。
          </p>
          <div className="learn-tour-buttons">
            {actionButton(intro)}
            <button className="learn-tour-nav-button" onClick={stop}>
              跳过
            </button>
          </div>
        </div>
      ),
      action: intro,
    },
    {
      target: '#todo-preview-input',
      skipBeacon: true,
      skipScroll: true,
      buttons: [],
      placement: large ? 'right' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          <p className="m-0">增：点下面按钮，把「买牛奶」填入输入框——也可以自己输入。</p>
          <div className="learn-tour-buttons">
            {actionButton(fill)}
            {navButtons(INTRO, ADD_CLICK)}
          </div>
        </div>
      ),
      action: fill,
    },
    {
      target: '[aria-label="添加待办"]',
      skipBeacon: true,
      skipScroll: true,
      buttons: [],
      placement: large ? 'right' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          {added ? (
            <>
              <p className="m-0">已加入清单！数据变了，界面立刻跟上。点「下一步」继续。</p>
              {navButtons(ADD_FILL, SEARCH)}
            </>
          ) : (
            <>
              <p className="m-0">增：点下面按钮，把输入框里的待办加入清单——也可以点右侧的 ＋。</p>
              <div className="learn-tour-buttons">
                {actionButton(click)}
                {navButtons(ADD_FILL, SEARCH)}
              </div>
            </>
          )}
        </div>
      ),
      action: click,
    },
    {
      target: '.learn-todo-search',
      skipBeacon: true,
      skipScroll: true,
      buttons: [],
      placement: large ? 'right' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          <p className="m-0">
            查：点下面按钮，自动填入关键字「牛奶」——清单会实时过滤，也可以自己输入。
          </p>
          <div className="learn-tour-buttons">
            {actionButton(search)}
            {navButtons(ADD_CLICK, CHECK)}
          </div>
        </div>
      ),
      action: search,
    },
    {
      target: '[data-todo="买牛奶"] input',
      skipBeacon: true,
      skipScroll: true,
      buttons: [],
      placement: large ? 'left' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          <p className="m-0">改：点下面按钮，勾选「买牛奶」——数据变了，界面立刻跟上。</p>
          <div className="learn-tour-buttons">
            {actionButton(check)}
            {navButtons(SEARCH, DELETE)}
          </div>
        </div>
      ),
      action: check,
    },
    {
      target: '[data-todo="买牛奶"] button',
      skipBeacon: true,
      skipScroll: true,
      hideOverlay: listEmpty,
      buttons: [],
      placement: large ? 'right' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          <p className="m-0">删：点下面按钮，把「买牛奶」从清单里删掉——数据离开，界面立刻跟上。</p>
          <div className="learn-tour-buttons">
            {actionButton(remove)}
            {navButtons(CHECK, SUMMARY)}
          </div>
        </div>
      ),
      action: remove,
    },
    {
      target: '.learn-todo-heading output',
      skipBeacon: true,
      skipScroll: true,
      buttons: [],
      placement: large ? 'right' : 'bottom',
      content: (
        <div className="learn-tour-add">
          {closeButton}
          <p className="m-0">
            查、增、改、删各体验了一遍——每一步，右上角的件数和完成数都实时变化。数据变，界面就变，这就是待办应用的全部。
          </p>
          <div className="learn-tour-buttons">
            {actionButton({ label: '完成', run: stop, nextIndex: SUMMARY })}
            {navButtons(DELETE, null, '上一步')}
          </div>
        </div>
      ),
    },
  ]
}
