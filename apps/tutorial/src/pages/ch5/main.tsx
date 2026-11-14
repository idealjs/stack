import { ChapterPage } from '../../components/ChapterPage'
import { mountPage } from '../../lib/mount'

const page = <ChapterPage id={5} />

export default page

mountPage(page)
