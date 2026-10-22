import { createRoot, hydrateRoot } from 'react-dom/client'
import { BlogDatePage } from '../../components/BlogPages'

const page = <BlogDatePage dateKey="2025-07" />

export default page

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
