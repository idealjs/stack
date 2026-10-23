import { BlogPostPage } from '../../components/BlogPages'
import { mountPage } from '../../lib/mount'

const page = <BlogPostPage slug="sapling-transformer" />

export default page

mountPage(page)
