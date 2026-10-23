import { BlogDatePage } from '../../components/BlogPages'
import { mountPage } from '../../lib/mount'

const page = <BlogDatePage dateKey="2025-07" />

export default page

mountPage(page)
