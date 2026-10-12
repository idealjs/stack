import { mount } from '../../mount'
import { BlogDatePage } from '../../components/BlogPages'

const page = <BlogDatePage dateKey="2026-08" />

export default page

if (typeof document !== 'undefined') mount(page)
