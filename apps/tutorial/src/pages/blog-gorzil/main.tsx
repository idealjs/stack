import { mount } from '../../mount'
import { BlogPostPage } from '../../components/BlogPages'

const page = <BlogPostPage slug="gorzil" />

export default page

if (typeof document !== 'undefined') mount(page)
