import { TEMPLATE_FILES } from '../../lib/templateFiles'
import { Section } from '../../lib/ui'
import { Playground } from '../../playground'

function CodeCard({ label, code }: { label: string; code: string }) {
  return (
    <div className="min-w-0 rounded-xl border-2 border-ink bg-paper p-3.5 shadow-ink">
      <p className="t-small-strong m-0 mb-2 font-mono">{label}</p>
      <pre
        tabIndex={0}
        aria-label={`${label} 源码`}
        className="m-0 overflow-x-auto font-mono text-[12.5px] leading-relaxed text-body"
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function TemplateLab() {
  return (
    <Section
      label="实验室：template 进沙箱"
      note="预置的就是 examples/template 的真实文件——MPA 入口在 playground 里跑起来"
    >
      <p className="m-0 text-content text-body">
        template 包的全部就是下面三个文件：index.html 是入口文档（挂载点＋一行 module
        script），main.ts 是被引进来的 TS，stack.config.ts 向宿主声明入口——entry
        写谁就构建谁，不写则回退按 script src 推导。点「运行」——宿主读配置后用 stack
        构建，index.html 的身体被装进沙箱文档，#app 里长出 hello, template。
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <CodeCard label="index.html" code={TEMPLATE_FILES[0].code} />
        <CodeCard label="main.ts" code={TEMPLATE_FILES[1].code} />
        <CodeCard label="stack.config.ts" code={TEMPLATE_FILES[2].code} />
      </div>
      <div className="mt-3">
        <Playground initialFiles={TEMPLATE_FILES} />
      </div>
    </Section>
  )
}
