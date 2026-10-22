import { createRoot, hydrateRoot } from 'react-dom/client'
import { ChapterPage } from '../../components/ChapterPage'

const page = <ChapterPage id={6} />

export default page

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
