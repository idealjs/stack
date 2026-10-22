import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'

const page = <App />

export default page

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
