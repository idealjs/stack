/** 页面挂载入口：容器里已有 SSG 预渲染内容走 hydrateRoot（保静态内容、接上交互），
 * 纯 CSR 容器走 createRoot。 */
import { createRoot, hydrateRoot } from 'react-dom/client'
import type { ReactNode } from 'react'

export function mount(node: ReactNode) {
  const el = document.getElementById('root')!
  if (el.hasChildNodes()) hydrateRoot(el, node)
  else createRoot(el).render(node)
}
