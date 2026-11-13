import { ChapterPage } from '../../components/ChapterPage'
import { mountPage } from '../../lib/mount'
import { setupPageFlip } from '../../lib/page-flip'

const page = <ChapterPage id={1} />

export default page

setupPageFlip()
mountPage(page)
