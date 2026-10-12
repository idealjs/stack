import { mount } from '../../mount'
import { BlogPostPage } from '../../components/BlogPages'

const page = <BlogPostPage slug="sapling-transformer" />

export default page

if (typeof document !== 'undefined') mount(page)
