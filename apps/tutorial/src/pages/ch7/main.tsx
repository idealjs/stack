import { createRoot, hydrateRoot } from 'react-dom/client'
import { ChapterPage } from '../../components/ChapterPage'
import { TemplateLab } from './TemplateLab'

const page = (
  <ChapterPage id={7}>
    <TemplateLab />
  </ChapterPage>
)

export default page

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!
  if (root.hasChildNodes()) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
