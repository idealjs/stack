import { ChapterPage } from '../../components/ChapterPage'
import { mountPage } from '../../lib/mount'

const page = <ChapterPage id={4} />

export default page

mountPage(page)
