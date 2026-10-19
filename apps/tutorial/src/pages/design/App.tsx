
import { Page, Section } from '../../lib/ui'

const BOOKS = [
  { key: 'design-colors', label: '颜色', desc: '高饱和 clash 色板与纸色系统——把鲜艳关进形状里。' },
  { key: 'design-typography', label: '字体', desc: '展示、正文、等宽的字阶与排版层级。' },
  { key: 'design-symbols', label: '符号形状', desc: '线条的形式规格：实线、虚线、点线与形状记号。' },
  { key: 'design-components', label: '组件', desc: 'CourseCard、票券、Button、SiteNavbar 等组件的实际组合。' },
  { key: 'design-shadow', label: '阴影', desc: '一份投影配方的四枚 token（两档 × 两形）、拿起动效层 hoverable-shadow，与组件选影归位表。' },
]

export function App() {
  return (
    <Page
      active="design"
      title="设计系统"
      desc="孟菲斯 × 拟物卡的四个切面；组件与 tokens 唯一定义于 @stack/design-system。"
    >
      <Section label="五册" note="点卡片进入对应册">
        <div className="flex flex-wrap gap-6">
          {BOOKS.map((b) => (
            <a
              key={b.key}
              href={`/${b.key}.html`}
              className="block w-[280px] rounded-2xl border-2 border-ink bg-paper p-5 no-underline shadow-ink transition-transform duration-150 hover:-translate-y-[3px] hover:shadow-ink-lift"
            >
              <span className="text-t3 font-extrabold text-ink">{b.label}</span>
              <span className="mt-2 block text-small leading-relaxed text-body">{b.desc}</span>
            </a>
          ))}
        </div>
      </Section>
    </Page>
  )
}
