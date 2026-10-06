const PAGES = [
  { href: '/colors.html', name: '01 颜色', desc: '撞色对 · 中性阶 · 章节色 · 反例' },
  { href: '/symbols.html', name: '02 符号形状', desc: '语义形状 · 词汇表 · 线形 · 票券' },
  { href: '/components.html', name: '03 组件', desc: 'CourseCard · RouteLine · 票券 · 指派块 · 入口' },
  { href: '/shelf.html', name: '04 样例', desc: '组合场景——实现验收对照图' },
]

export function App() {
  return (
    <main className="mx-auto max-w-[880px] px-6 py-14">
      <span className="inline-block rounded-lg bg-[#efe6fb] px-3 py-1 font-mono text-[15px] font-bold text-[#6d28d9]">
        &lt;DesignLab /&gt;
      </span>
      <h1 className="mt-2 mb-1 text-[30px] font-extrabold">design-lab · 孟菲斯 × 拟物卡</h1>
      <p className="mt-0 text-[14.5px] text-[#6b6b6b]">Vite MPA：一页一入口（src/pages/xxx/main.tsx）。设计系统四册的可运行版。</p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {PAGES.map((p) => (
          <a
            key={p.href}
            href={p.href}
            className="rounded-2xl border-2 border-ink bg-paper p-5 no-underline shadow-hard transition-transform hover:-translate-y-[3px] hover:shadow-hard-lift"
          >
            <b className="text-[17px] text-ink">{p.name}</b>
            <p className="m-0 mt-1 text-[12.5px] text-[#6b6b6b]">{p.desc}</p>
          </a>
        ))}
      </div>
    </main>
  )
}
