import { createRoot, hydrateRoot } from 'react-dom/client'
import { BlogPostPage } from '../../components/BlogPages'

const page = <BlogPostPage slug="gorzil" />

export default page

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
