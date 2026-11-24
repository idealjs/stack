import { useState } from 'react'

export function useControllableState<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [local, setLocal] = useState(initial)
  return [
    value ?? local,
    (next: T) => {
      if (value === undefined) setLocal(next)
      onChange?.(next)
    },
  ] as const
}
