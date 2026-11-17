import { useEffect, useRef, useState } from 'react'
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
const SPOT_PADDING = 10
const SPOT_RADIUS = 4

const spotlightCoverPath = (x: number, y: number, width: number, height: number) => {
  const r = Math.max(0, Math.min(SPOT_RADIUS, width / 2, height / 2))
  return (
    `M${x + r} ${y}H${x + width - r}A${r} ${r} 0 0 1 ${x + width} ${y + r}` +
    `V${y + height - r}A${r} ${r} 0 0 1 ${x + width - r} ${y + height}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + height - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  )
}

const repaintSpotlight = (target: Element) => {
  const paths = document.querySelectorAll<SVGPathElement>('.react-joyride__spotlight path')
  if (paths.length === 0) return
  const rect = target.getBoundingClientRect()
  const cover = spotlightCoverPath(
    Math.round(rect.left) - SPOT_PADDING,
    Math.floor(rect.top) - SPOT_PADDING,
    Math.round(rect.width) + SPOT_PADDING * 2,
    Math.round(rect.height) + SPOT_PADDING * 2,
  )
  for (const path of paths) {
    const d = path.getAttribute('d')
    if (!d) continue
    if (d.startsWith('M0 0')) {
      path.setAttribute('d', `${d.slice(0, d.indexOf('Z') + 1)} ${cover}`)
    } else {
      path.setAttribute('d', cover)
    }
  }
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
    const root = document.querySelector('[data-scroll-root]')
    if (!root) return
    const relay = () => {
      const { steps: liveSteps, stepIndex: liveIndex } = liveRef.current
      const target = liveSteps[liveIndex]?.target
      if (typeof target === 'string') {
        const element = document.querySelector(target)
        if (element) repaintSpotlight(element)
      }
      window.dispatchEvent(new Event('scroll'))
    }
    root.addEventListener('scroll', relay, { passive: true })
    return () => root.removeEventListener('scroll', relay)
  }, [run])

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
  const liveRef = useRef({ steps, stepIndex })
  liveRef.current = { steps, stepIndex }

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
