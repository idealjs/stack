import { createRoot, hydrateRoot } from 'react-dom/client'
import type { ReactNode } from 'react'

export function mount(node: ReactNode) {
  const el = document.getElementById('root')!
  if (el.hasChildNodes()) hydrateRoot(el, node)
  else createRoot(el).render(node)
}
