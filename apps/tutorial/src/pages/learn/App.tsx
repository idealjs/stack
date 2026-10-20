import { Page, Section } from '../../lib/ui'
import {
  BrickToolbox,
  Button,
  ComparisonBoard,
  DataFlowBoard,
  ExperimentFrame,
  Mark,
  StickyNote,
} from '../../design-system'
import type { DataFlowStep, ToolboxBrick } from '../../design-system'
import { TodoPreview } from './components/TodoPreview'
import './learn.css'

const BRICKS: readonly ToolboxBrick[] = [
  {
    id: 'html',
    name: 'HTML',
    stage: '基础页面',
    tone: 'coral',
    summary: '搭出输入框、列表和按钮。',
    what: '描述网页结构的标记语言。标签告诉浏览器哪些是标题、表单和列表。',
    why: '为待办应用搭出结构，让每一项数据都有展示的位置。',
    family: '语义标签与表单元素。样式交给 CSS，交互交给 JavaScript。',
  },
  {
    id: 'css',
    name: 'CSS',
    stage: '基础页面',
    tone: 'blue',
    summary: '控制布局、颜色和完成样式。',
    what: '描述页面外观的样式语言，通过选择器匹配需要设置样式的元素。',
    why: '排列待办条目，为已完成的任务显示删除线，并适配不同屏幕。',
    family: '选择器、Flexbox、Grid；Tailwind CSS 是组织样式的另一种方式。',
  },
  {
    id: 'js',
    name: 'JavaScript',
    stage: '基础交互',
    tone: 'yellow',
    summary: '响应操作，修改待办数据。',
    what: '处理数据与交互的编程语言。DOM 是 JavaScript 读取和修改页面的接口。',
    why: '用数组存放待办，响应添加、删除和勾选，再把变化呈现在页面上。',
    family: '变量、数组、事件与 DOM 操作。这些基础也会用于 React 版本。',
  },
  {
    id: 'react',
    name: 'React',
    stage: '组件与数据流',
    tone: 'teal',
    summary: '用组件和状态组织界面。',
    what: '构建用户界面的库。组件描述界面，state 保存状态，props 把数据和回调传给子组件。',
    why: '把待办拆成输入区、列表和条目。更新状态后，由 React 更新对应界面。',
    family: '组件、state、props 与状态提升；共享的数据由共同的父组件管理。',
  },
  {
    id: 'ts',
    name: 'TypeScript',
    stage: '类型检查',
    tone: 'violet',
    summary: '明确每条待办的数据结构。',
    what: '为 JavaScript 增加类型检查的语言，在运行前发现部分代码错误。',
    why: '写清待办的 id、文字和完成状态，检查字段名或数据类型是否用错。',
    family: '接口、联合类型与类型推断；类型检查与运行时的数据校验各有职责。',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    stage: '样式组织',
    tone: 'pink',
    summary: '用工具类组合界面样式。',
    what: '提供 CSS 工具类的样式框架，把常用样式组合在元素的 class 中。',
    why: '用另一种方式实现同一个待办界面，对比工具类和样式文件的取舍。',
    family: '原生 CSS、工具类与组件样式；都需要理解布局和 CSS 的基础规则。',
  },
  {
    id: 'vite',
    name: 'Vite',
    stage: '运行与构建',
    tone: 'coral',
    summary: '运行工程，生成部署产物。',
    what: '提供开发服务器和构建能力的工具。开发时预览修改，构建时生成发布文件。',
    why: '跑起待办工程，并看懂源码怎样变成可部署的 HTML、CSS 和 JavaScript。',
    family: 'Node.js、npm、开发服务器与构建产物；区分开发环境和发布环境。',
  },
  {
    id: 'api',
    name: 'HTTP / API',
    stage: '前后端连接',
    tone: 'blue',
    summary: '让浏览器与服务端交换数据。',
    what: 'HTTP 是请求与响应的通信协议，API 约定应用如何读取和修改数据。',
    why: '把添加、删除和勾选待办变成服务端请求，并处理返回结果。',
    family: '请求方法、JSON、状态码与服务端校验。',
  },
  {
    id: 'database',
    name: 'SQLite / Prisma',
    stage: '数据保存',
    tone: 'teal',
    summary: '保存待办，刷新后仍能读取。',
    what: 'SQLite 是数据库；Prisma 帮助代码按约定的数据结构读写数据库。',
    why: '让服务端保存待办数据，浏览器重新打开时通过 API 读取。',
    family: '数据模型、数据库迁移与持久化；界面状态和长期保存的数据需要配合。',
  },
]

const DATA_FLOW_STEPS: readonly DataFlowStep[] = [
  {
    id: 'input',
    title: '用户操作',
    tone: 'coral',
    input: true,
    detail: '在清单里勾掉「买牛奶」。流程从这里开始，后面每一步都由这一下触发。',
  },
  {
    id: 'state',
    title: '更新数据',
    tone: 'teal',
    detail: '浏览器里的 JavaScript 找到数组中 id 为 2 的那项，把 done 改成 true。',
  },
  {
    id: 'render',
    title: '更新界面',
    tone: 'yellow',
    detail: '「买牛奶」划上删除线，计数从「完成 0」变成「完成 1」，页面不用刷新。',
  },
  {
    id: 'save',
    title: '保存数据',
    tone: 'blue',
    detail: '请求带着「id: 2, done: true」到达服务端，校验通过后写入数据库。',
  },
]

export function App() {
  return (
    <Page
      active="learn"
      title="全栈教程"
      desc="从第一个网页到前后端协作，用同一个待办应用串起整个过程。"
    >
      <div className="learn-top">
        <section className="learn-copy" aria-labelledby="learn-goal">
          <h2 id="learn-goal">做一个自己的待办清单</h2>
          <p>
            学完做出一个<b>单人版 TodoList</b>：添加、删除、勾选完成，界面随数据更新； 接上 API
            和数据库后，刷新页面，待办仍然保留。
          </p>
          <p className="learn-meta">
            主线：<a href="#data-control">数据控制</a>
            <span aria-hidden="true"> · </span>通读约 60–90 分钟
          </p>
        </section>

        <div className="learn-actions">
          <Button tone="clash1b" href="/ch1.html">
            从第一个网页开始 <span aria-hidden="true">→</span>
          </Button>
          <Button href="/practice.html">打开练习场</Button>
          <p>你提出需求，Agent 协助实现；再对照结果，理解代码为什么这样工作。</p>
        </div>

        <ExperimentFrame
          title="你的待办应用"
          address={null}
          status="demo"
          caption="刷新后重置"
          className="learn-preview"
        >
          <TodoPreview />
        </ExperimentFrame>

        <section id="data-control" className="learn-core" aria-labelledby="learn-core-title">
          <h2 id="learn-core-title">
            全栈的核心：<Mark>数据控制</Mark>
          </h2>
          <p>
            跟着一次点击走完全栈。你在清单里勾掉「买牛奶」，数据就开始旅行： 浏览器里的 JavaScript
            改掉数组，界面立刻划掉这一行； 请求带着「id: 2, done: true」到服务端，校验后落进数据库；
            明天再打开页面，清单从数据库原路回来，勾选还在原处。
          </p>
          <DataFlowBoard title="一次勾选的数据流" steps={DATA_FLOW_STEPS} className="learn-flow" />
          <p className="learn-core-note">
            这本教程里框架和工具换了五茬，唯一不变的就是这条线：先想清楚数据怎么流，界面只是它的影子——前端让它可见、可操作，后端校验并保存。
          </p>
        </section>

        <StickyNote title="要多久" tone="teal" size="compact" className="learn-time">
          <dl className="learn-time-list">
            <div>
              <dt>通读主线</dt>
              <dd>60–90 分钟</dd>
            </div>
            <div>
              <dt>边读边练</dt>
              <dd>4–6 小时</dd>
            </div>
            <div>
              <dt>本地环境搭建</dt>
              <dd>30–60 分钟</dd>
            </div>
          </dl>
          <p className="learn-time-note">
            时间为预估。跟练不含本地搭建，建议分 2–3 次完成；通读不含拓展阅读。
          </p>
        </StickyNote>
      </div>

      <Section
        id="environments"
        className="learn-section"
        label="在哪里练习"
        note="浏览器或本地，按你的使用习惯选择。"
      >
        <ComparisonBoard
          connector="or"
          left={{
            label: '浏览器练习 · 重建中',
            content: (
              <>
                <dl className="learn-environment-list">
                  <div>
                    <dt>运行项目</dt>
                    <dd>练习场正在重建：计划以 ESM 模块承载练习工程，页面即工程、无需安装。</dd>
                  </div>
                  <div>
                    <dt>协助实现</dt>
                    <dd>
                      Agent 经 MCP 工具协议协助你写代码、跑命令——方案上线前，先走右侧本地路线。
                    </dd>
                  </div>
                </dl>
              </>
            ),
          }}
          right={{
            label: '本地开发 · 使用自己的工具',
            content: (
              <>
                <dl className="learn-environment-list">
                  <div>
                    <dt>运行项目</dt>
                    <dd>在自己的电脑上准备 Node.js、编辑器和终端，运行开发服务器。</dd>
                  </div>
                  <div>
                    <dt>协助实现</dt>
                    <dd>使用你熟悉的 Agent 修改项目，并在本地浏览器里检查页面和数据变化。</dd>
                  </div>
                </dl>
                <p className="learn-environment-note">
                  首次搭建预留 30–60 分钟，从「快速开始」查看环境准备。
                </p>
                <Button href="/ch1.html">查看本地环境准备</Button>
              </>
            ),
          }}
        />
      </Section>

      <Section
        id="bricks"
        className="learn-section"
        label="用哪些技术"
        note="先学页面与交互，再组织工程，最后连接并保存数据。"
      >
        <BrickToolbox title="项目里的技术积木" variant="overview" bricks={BRICKS} />
        <p className="learn-section-note">
          先看每块积木的用途，需要时展开详情。我们逐步完善同一个应用，再用 React、TypeScript 和
          Tailwind CSS 改写它。
        </p>
      </Section>
    </Page>
  )
}
