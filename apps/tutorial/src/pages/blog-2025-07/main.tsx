import { mount } from '../../mount'
import { BlogDatePage } from '../../components/BlogPages'

const page = <BlogDatePage dateKey="2025-07" />

export default page

if (typeof document !== 'undefined') mount(page)
