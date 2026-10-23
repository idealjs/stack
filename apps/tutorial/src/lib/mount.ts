import type { ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

export function mountPage(page: ReactNode) {
  if (typeof document === 'undefined') return
  const root = document.getElementById('root')
  if (!root) throw new Error('mount target #root not found')
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
