/** 教程首页——首屏到第二屏回答读者的五个问题（OUTLINE-v2.md §1）：
 * 做什么（终点先行）→ 用什么（积木清单）→ 在哪练（两条路线）→ 要多久（时间便签）→ 凭什么（数据控制）。
 *
 * 组件组合：ExperimentFrame（成品预览）＋ BrickToolbox（积木三句话）＋
 * ComparisonBoard（环境两条路线对照）＋ StickyNote（时间便签）＋ Scatter（形状点缀，种子化）。
 *
 * 个人中心（后期上线）预留的接缝：
 * - 英雄区 CTA 的「个人中心」用 disabled Button 占位（虚线占位·不动不起），上线后替换为链接（进度/任务/Key 管理）；
 * - 积木清单的 learned 字段目前恒为 false，后期由个人中心的学习进度驱动。 */
import { Page, Section } from '../../lib/ui'
import { Button, BrickToolbox, ComparisonBoard, ExperimentFrame, Mark, Scatter, StickyNote } from '@stack/design-system'
import { BrickDot, Cross, Ring, Tremble, Tri, Wave } from '@stack/design-system'
import type { ToolboxBrick } from '@stack/design-system'
import { TodoMock } from './components/TodoMock'

/** 积木清单——从全局靶子倒推，只列用到的；三句话口径见 ai-era-tutorial skill。
 * learned 后期由个人中心进度驱动，此处先恒为待学。 */
const BRICKS: readonly ToolboxBrick[] = [
  {
    id: 'html',
    name: 'HTML 骨架与标签',
    what: '浏览器页面的结构语言：三件套骨架，加标题、列表、按钮这些零件标签。',
    why: '第 3 章起你写的每层界面都由它撑起——todolist 的骨架就是一张列表。',
    family: '标签一族（语义/表单/媒体）——要「结构」找标签，要「行为」找 JS。',
  },
  {
    id: 'dom',
    name: 'DOM 操作',
    what: '浏览器把页面开放给 JS 的操作口：查到元素、改它、增删它。',
    why: '第 3 章你靠它亲手把数组重画成界面——这是理解框架「替你做了什么」的前提。',
    family: '界面操作一族（原生 DOM / 框架虚拟 DOM）——框架只改变「谁来操作」，口子本身不变。',
  },
  {
    id: 'js',
    name: 'JS（变量/数组/事件）',
    what: '页面的行为语言：数据住在变量里、待办清单是数组、用户动作是事件。',
    why: 'todolist 的增删全靠它——「数据控制」的起点。',
    family: '编程语言一族（JS/TS）——TS 只是把「说清楚」变成硬约束。',
  },
  {
    id: 'css',
    name: 'CSS（内联/文件/选择器）',
    what: '界面的样式语言：内联与样式文件两种形式，选择器决定命中谁。',
    why: '第 3 章给 todolist 穿衣服，并讲清两种形式的工程分界。',
    family: '样式组织一族（原生 CSS / Tailwind / CSS-in-JS）——第 4 章的 Tailwind 是同一问题的另一种答案。',
  },
  {
    id: 'react',
    name: 'React 组件与 state',
    what: '把界面拆成零件；数据一变，界面自动跟着变。',
    why: '第 4 章用它重写第 3 章的 todolist——手动重绘消失，数据控制升级成声明。',
    family: '前端框架一族（React/Vue/Svelte）——学的是「声明式」这个共性，换框架不难。',
  },
  {
    id: 'props',
    name: 'props（父子数据流）',
    what: '父组件把数据递给子组件的通道：数据向下、事件向上。',
    why: '待办拆成输入条/清单/条目之后，「数据住谁家」靠它回答。',
    family: '组件通信一族（props/上下文/状态库）——先精通 props，再谈别的。',
  },
  {
    id: 'ts',
    name: 'TypeScript 类型',
    what: '给数据定型的语言：Todo 长什么样写清楚，拼错字段编译期就报错。',
    why: '第 4 章给待办数据定型——agent 给的代码里这类错误从此瞒不过你。',
    family: '类型系统一族（TS/JSDoc）——JS 的超集，可以渐进采用。',
  },
  {
    id: 'tailwind',
    name: 'TailwindCSS 工具类',
    what: '把样式写成 class 名的工具类方案。',
    why: '第 4 章用它复刻第 3 章的样式——同一个问题的工程化答案。',
    family: '样式方案一族（原子类/语义类/CSS-in-JS）——取舍在于「写在哪、怎么复用」。',
  },
  {
    id: 'vite',
    name: 'Vite 开发服务器与构建',
    what: '本地秒开的热更新服务器，加上把源码打包成可部署产物的构建器。',
    why: '第 2 章起你天天用它跑工程；第 4 章解剖它的产物。',
    family: '构建工具一族（Vite/webpack/esbuild）——它是工程的地基，属于认知基础。',
  },
]

export function App() {
  return (
    <Page
      active="learn"
      title="全栈教程"
      desc="从第一个网页到行业标配框架——同一支 todolist，逐层重写。终点先行：先看清楚要做出什么，再出发。"
    >
      {/* 1.1 做什么：终点先行 */}
      <Section label="终点先行" note="学完这门教程，你将亲手做出并看懂右边这个东西">
        <div className="relative">
          {/* 形状点缀：散在内容盒附近的空当里，种子固定、基线可测 */}
          <Scatter
            seed={11}
            shapes={[
              <Tri size={20} />,
              <Ring size={18} />,
              <Wave size={28} />,
              <span className="flex gap-1">
                <BrickDot on />
                <BrickDot />
              </span>,
              <Cross size={16} />,
              <Tremble size={20} />,
            ]}
          />
          <div className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div data-comp="hero-copy" className="min-w-0">
              <p className="m-0 text-content leading-relaxed text-body">
                <b className="text-ink">目标</b>：做出一个你自己天天会用的<b className="text-ink">单人版 todolist</b>
                ——你负责指挥 agent 与逐条核对，长出识别力。
              </p>
              <p className="mb-0 mt-3 text-content leading-relaxed text-body">
                <b className="text-ink">预期结果</b>：待办可增删、可勾选完成，界面即时跟随数据变化；
                同一份功能经历五次重写（HTML → JS → CSS → React → React + TS + Tailwind），
                你能对照任意两个版本，指出这一层替你做了什么。
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button tone="clash1b" href="/practice.html">
                  直接开练 · 去练习场
                </Button>
                <Button href="#bricks">先看用什么</Button>
                {/* 个人中心：后期上线后替换为链接（进度/任务/Key 管理），此前保持虚线占位 */}
                <Button disabled>个人中心 · 敬请期待</Button>
              </div>
            </div>
            <ExperimentFrame
              title="单人版 TodoList"
              address="localhost:5173"
              status="running"
              caption="终点示意 · 静态预览"
              className="w-full max-w-[360px] justify-self-start lg:justify-self-end"
            >
              <TodoMock />
            </ExperimentFrame>
          </div>
        </div>
      </Section>

      {/* 1.2 用什么：积木清单 */}
      <Section label="用什么" note="从终点倒推的积木清单，只列用到的；点开看每块的三句话" >
        <div id="bricks" className="scroll-mt-40">
          <BrickToolbox title="积木清单" bricks={BRICKS} />
        </div>
      </Section>

      {/* 1.3 在哪练：两条环境路线 */}
      <Section label="在哪练" note="两条路线任选其一，产物完全一致，随时可切换">
        <ComparisonBoard
          title="环境 · 两条路线"
          caption="选顺手的就好，别在选路上花时间。两条路线的差别与搭建细节，见「环境处理和搭建」。"
          left={{
            label: '线上 playground · 立刻开始',
            content: (
              <>
                <p className="m-0 text-small leading-relaxed text-body">
                  本站自带：浏览器里跑<b className="text-ink">真实工程</b>（WebContainer），陪练 agent
                  已就位——填一个 API key 就能动工，零安装。
                </p>
                <p className="mb-0 mt-3">
                  <Button tone="clash2b" href="/practice.html">
                    去练习场
                  </Button>
                </p>
              </>
            ),
          }}
          right={{
            label: '本地工程 · 贴近真实',
            content: (
              <>
                <p className="m-0 text-small leading-relaxed text-body">
                  你自己的机器＋你自己的 agent：node、编辑器、dev server
                  一样不少。「环境处理和搭建」会带你搭起来，并把这些脚下的地逐一露出来。
                </p>
                <p className="mb-0 mt-3 t-small-mute">该章排期实现中——先把练习场跑起来不亏。</p>
              </>
            ),
          }}
        />
      </Section>

      {/* 1.4 要多久：时间便签 */}
      <Section label="要多久" note="预估——按「通读 / 跟练 / 分几次」给数，卡住就问你的 agent">
        <StickyNote title="时间投入便签" tone="teal" className="max-w-[520px]">
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-small leading-relaxed text-body">
            <li>纯通读：约 <b className="text-ink">1–1.5 小时</b>；</li>
            <li>边读边跟练：约 <b className="text-ink">4–6 小时</b>，分 2–3 次为宜；</li>
            <li>环境搭建：一次性 <b className="text-ink">30 分钟–1 小时</b>。</li>
          </ul>
        </StickyNote>
      </Section>

      {/* 1.5 凭什么：全栈的核心——数据控制 */}
      <Section label="凭什么 · 全栈的核心" note="这条线贯穿全部章节，学完回头看，每一层都在做同一件事">
        <p className="m-0 max-w-[72ch] text-content leading-relaxed text-body">
          界面是数据的影子。全栈要做的事只有一件：
          <Mark>让数据听你的，让界面跟着数据走</Mark>
          ——谁拥有数据、数据怎么变、变化怎么走到屏幕上。这支 todolist 会陪你把这条路走一遍：
          先用 JS <b className="text-ink">亲手</b>重画（第 3 章），再交给 React <b className="text-ink">声明</b>（第 4 章），
          再用 TS 给数据<b className="text-ink">定型</b>，最后回答数据<b className="text-ink">住在哪里</b>。
        </p>
      </Section>
    </Page>
  )
}
