import * as styles from '@idealjs/stack-ui-kit/styles'
import * as themes from '@idealjs/stack-ui-kit/themes'
import '@idealjs/stack-site-ui-kit/styles/index.css'
import '../styles/tailwind.css'
import type { ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

export function mountPage(page: ReactNode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.add(themes.paletteClass, themes.themeClass, themes.siteClass)
  document.body.classList.add(styles.pageBase)
  const root = document.getElementById('root')
  if (!root) throw new Error('mount target #root not found')
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
