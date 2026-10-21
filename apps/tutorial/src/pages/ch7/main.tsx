import { mount } from '../../mount'
import { ChapterPage } from '../../components/ChapterPage'
import { TemplateLab } from './TemplateLab'

const page = (
  <ChapterPage id={7}>
    <TemplateLab />
  </ChapterPage>
)

export default page

if (typeof document !== 'undefined') mount(page)
