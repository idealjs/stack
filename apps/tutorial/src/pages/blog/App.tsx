
import { Page, Section } from '../../lib/ui'
import { BlogCard } from '../../components/BlogPages'
import { MONTHS } from '../../content/blogs'

export function App() {
  return (
    <Page
      active="blog"
      title="博客"
      desc="开发自述与工程笔记——项目进行中的经验与思考，按月归档。"
    >
      {MONTHS.map((m) => (
        <Section key={m.key} label={m.key} note={`${m.posts.length} 篇`}>
          <div className="flex flex-wrap gap-6">
            {m.posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </Section>
      ))}
    </Page>
  )
}
