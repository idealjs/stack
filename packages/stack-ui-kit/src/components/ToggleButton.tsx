import type { CSSProperties, ReactNode } from 'react'
import { useControllableState } from '../hooks/useControllableState'

export interface ToggleButtonProps {
  label: string
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  hostClassName?: string
  buttonClassName?: string
  style?: CSSProperties
  'data-comp'?: string
  children: (pressed: boolean) => ReactNode
}

export function ToggleButton({
  label,
  pressed,
  defaultPressed = false,
  onPressedChange,
  hostClassName = '',
  buttonClassName = '',
  style,
  'data-comp': component = 'toggle-button',
  children,
}: ToggleButtonProps) {
  const [on, setOn] = useControllableState(pressed, defaultPressed, onPressedChange)
  return (
    <div data-comp={component} className={hostClassName} style={style}>
      <button
        type="button"
        className={buttonClassName}
        aria-label={label}
        aria-pressed={on}
        onClick={() => setOn(!on)}
      >
        {children(on)}
      </button>
    </div>
  )
}
