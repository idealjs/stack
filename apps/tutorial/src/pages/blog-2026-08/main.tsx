import { BlogDatePage } from '../../components/BlogPages'
import { mountPage } from '../../lib/mount'

const page = <BlogDatePage dateKey="2026-08" />

export default page

mountPage(page)
