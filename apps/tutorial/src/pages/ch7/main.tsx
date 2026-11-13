import { ChapterPage } from '../../components/ChapterPage'
import { mountPage } from '../../lib/mount'
import { setupPageFlip } from '../../lib/page-flip'
import { TemplateLab } from './TemplateLab'

const page = (
  <ChapterPage id={7}>
    <TemplateLab />
  </ChapterPage>
)

export default page

setupPageFlip()
mountPage(page)
