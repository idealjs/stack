import { mount } from '../../mount'
import { ChapterPage } from '../../components/ChapterPage'

const page = <ChapterPage id={4} />

export default page

if (typeof document !== 'undefined') mount(page)
