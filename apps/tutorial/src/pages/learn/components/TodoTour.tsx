import { useEffect, useState } from 'react'
import { Joyride } from 'react-joyride'
import { ShadowButton } from '../../../design-system'
import { ADD_CLICK, ADD_FILL, CHECK, DELETE, INTRO, SEARCH, SUMMARY, buildSteps } from './tourSteps'
import type { TourAction } from './tourSteps'

const EXAMPLE_TEXT = '买牛奶'
const SEARCH_TEXT = '牛奶'
const STEP_FOCUS: Record<number, string> = {
  [ADD_FILL]: '#todo-preview-input',
  [SEARCH]: '#todo-preview-search',
}

export function TodoTour() {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(220)
  const [large, setLarge] = useState(true)
  const [listEmpty, setListEmpty] = useState(false)
  const [milkGone, setMilkGone] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!run) {
      setListEmpty(false)
      setMilkGone(false)
      setAdded(false)
      return
    }
    const readTodoState = () => {
      setListEmpty(document.body.dataset.learnTodoTotal === '0')
      setMilkGone(document.body.dataset.learnTodoMilk !== 'true')
    }
    readTodoState()
    const observer = new MutationObserver(readTodoState)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-learn-todo-total', 'data-learn-todo-milk'],
    })
    const addForm = document.querySelector('.learn-todo-input')
    const onAddSubmit = () => setAdded(true)
    addForm?.addEventListener('submit', onAddSubmit)
    return () => {
      observer.disconnect()
      addForm?.removeEventListener('submit', onAddSubmit)
    }
  }, [run])

  useEffect(() => {
    if (!run) return
    if (milkGone && (stepIndex === CHECK || stepIndex === DELETE)) setStepIndex(SUMMARY)
  }, [milkGone, stepIndex, run])

  useEffect(() => {
    if (!run) return
    const selector = STEP_FOCUS[stepIndex]
    if (!selector) return
    const timer = window.setTimeout(() => {
      ;(document.querySelector(selector) as HTMLElement | null)?.focus()
    }, 120)
    return () => window.clearTimeout(timer)
  }, [stepIndex, run])

  useEffect(() => {
    if (!run) return
    if (stepIndex !== CHECK && stepIndex !== DELETE) return
    if (document.body.dataset.learnTodoMilk !== 'true') return
    if (document.querySelector('[data-todo="买牛奶"]')) return
    const search = document.querySelector('#todo-preview-search') as HTMLInputElement | null
    if (!search || search.value === '') return
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    setter?.call(search, '')
    search.dispatchEvent(new Event('input', { bubbles: true }))
  }, [stepIndex, run])

  const fillMilk = () => {
    const input = document.querySelector('#todo-preview-input') as HTMLInputElement | null
    if (!input) return
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, EXAMPLE_TEXT)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const fillSearch = () => {
    const search = document.querySelector('#todo-preview-search') as HTMLInputElement | null
    if (!search) return
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    setter?.call(search, SEARCH_TEXT)
    search.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const checkMilk = () => {
    const input = document.querySelector('[data-todo="买牛奶"] input') as HTMLInputElement | null
    input?.click()
  }

  const removeMilk = () => {
    const button = document.querySelector('[data-todo="买牛奶"] button') as HTMLButtonElement | null
    button?.click()
  }

  const clickAdd = () => {
    const input = document.querySelector('#todo-preview-input') as HTMLInputElement | null
    if (input && input.value.trim().length === 0) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      setter?.call(input, EXAMPLE_TEXT)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    window.setTimeout(() => {
      const button = document.querySelector('[aria-label="添加待办"]') as HTMLButtonElement | null
      button?.click()
    }, 80)
  }

  const start = () => {
    setLarge(window.matchMedia('(min-width: 768px)').matches)
    setScrollOffset(Math.max(120, Math.round(window.innerHeight * 0.38)))
    setStepIndex(INTRO)
    setRun(true)
  }

  const runAction = (action: TourAction) => {
    action.run()
    setStepIndex(action.nextIndex)
  }

  const go = (index: number) => setStepIndex(index)
  const stop = () => {
    setRun(false)
    setStepIndex(INTRO)
  }

  const actions: TourAction[] = [
    { label: '开始体验', run: () => {}, nextIndex: ADD_FILL },
    { label: '填入「买牛奶」', run: fillMilk, nextIndex: ADD_CLICK },
    { label: '加入清单', run: clickAdd, nextIndex: SEARCH },
    { label: '填入「牛奶」', run: fillSearch, nextIndex: CHECK },
    { label: '勾选「买牛奶」', run: checkMilk, nextIndex: DELETE },
    { label: '删除「买牛奶」', run: removeMilk, nextIndex: SUMMARY },
  ]

  const steps = buildSteps(large, listEmpty, added, actions, runAction, go, stop)

  return (
    <div className="learn-tour">
      <ShadowButton size="sm" onClick={start}>
        ▶ 30 秒上手这个待办应用
      </ShadowButton>
      <Joyride
        run={run}
        stepIndex={stepIndex}
        steps={steps}
        continuous
        floatingOptions={{ hideArrow: true }}
        scrollToFirstStep={false}
        locale={{ back: '上一步', next: '下一步', last: '完成', skip: '跳过' }}
        options={{
          scrollOffset,
          overlayClickAction: false,
          disableFocusTrap: true,
          primaryColor: 'var(--color-clash2a)',
          textColor: 'var(--color-ink)',
          backgroundColor: 'var(--color-paper)',
          overlayColor: 'rgba(17, 17, 17, 0.4)',
        }}
        styles={{
          tooltip: {
            width: 260,
            position: 'relative',
            border: '2px solid var(--color-ink)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-ink)',
          },
          tooltipContainer: { padding: '12px 16px', fontSize: 13, lineHeight: 1.75 },
        }}
      />
    </div>
  )
}
