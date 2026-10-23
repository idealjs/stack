import { BlogPostPage } from '../../components/BlogPages'
import { mountPage } from '../../lib/mount'

const page = <BlogPostPage slug="gorzil" />

export default page

mountPage(page)
