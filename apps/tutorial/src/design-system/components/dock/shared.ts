import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useDockEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

export function useDockDismiss(
  open: boolean,
  onDismiss: () => void,
  roots: RefObject<HTMLElement | null>[],
) {
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (roots.some((ref) => ref.current?.contains(target))) return
      onDismiss()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onDismiss, roots])
}
