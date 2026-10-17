import type { ReactNode } from 'react'
import { ClipboardChecklist } from '../components/learning/ClipboardChecklist'
import { FolderTabs } from '../components/learning/FolderTabs'
import { StickyNote } from '../components/learning/StickyNote'
import { Bookmark } from '../components/learning/Bookmark'
import { FlashCard } from '../components/learning/FlashCard'
import { ExperimentFrame } from '../components/learning/ExperimentFrame'
import { OutputReceipt } from '../components/learning/OutputReceipt'
import { TaskEnvelope } from '../components/learning/TaskEnvelope'
import { Stamp } from '../components/learning/Stamp'
import { BrickToolbox } from '../components/learning/BrickToolbox'
import { DeliveryManifest } from '../components/learning/DeliveryManifest'
import { ComparisonBoard } from '../components/learning/ComparisonBoard'
import { DataFlowBoard } from '../components/learning/DataFlowBoard'
import { Mark } from '../components/shapes'

function Sample({ name, title, note, wide, children }: {
  name: string; title: string; note: string; wide?: boolean; children: ReactNode
}) {
  return (
    <article className={`learning-gallery-sample ${wide ? 'learning-gallery-span-two' : ''}`}>
      <h4 className="learning-gallery-sample-title">{title}<code>{name}</code></h4>
      {children}
      <p>{note}</p>
    </article>
  )
}

/** 组件标本，不绑定教程进度；交互仅在当前页面演示。 */
export function LearningKitGallery() {
  return (
    <div className="learning-gallery" data-testid="learning-kit-gallery">
      <nav className="learning-gallery-nav" aria-label="拟物组件分组">
        <a href="#learning-kit-check">学习与验收</a>
        <a href="#learning-kit-read">阅读与复习</a>
        <a href="#learning-kit-task">任务与交付</a>
        <a href="#learning-kit-connect">知识与对照</a>
        <a href="#learning-kit-list">清单类</a>
      </nav>

      <section className="learning-gallery-group" id="learning-kit-check" aria-labelledby="learning-kit-check-heading">
        <h3 id="learning-kit-check-heading" className="learning-gallery-group-heading"><strong>01 · 学习与验收</strong><small>做完一步，亲手核对结果。</small></h3>
        <div className="learning-gallery-grid">
          <Sample name="StickyNote" title="折角便签" note="第一次遇到的概念就地解释；折角为纸张提供可辨识的轮廓。">
            <StickyNote title="先记住这一件事">
              <p><b>dev server</b> 帮你边改边看。</p>
              <p><b>build</b> 把源码变成可以部署的文件。</p>
              <p>去 <code>dist/</code> 看一眼，核对产物到底长什么样。</p>
            </StickyNote>
          </Sample>
          <Sample name="ExperimentFrame" title="实验台预览框" note="在预览区域操作 todo，观察界面跟着状态变化。">
            <ExperimentFrame title="React Todo / 预期结果" address="localhost:5173" caption="点选任务，查看变化">
              <h3 className="mb-3">今天的练习</h3>
              <ul className="learning-demo-todo">
                <li><label><input type="checkbox" defaultChecked /><span>让第一个网页跑起来</span></label></li>
                <li><label><input type="checkbox" /><span>把列表拆成 React 组件</span></label></li>
                <li><label><input type="checkbox" /><span>刷新后，数据还在</span></label></li>
              </ul>
            </ExperimentFrame>
          </Sample>
        </div>
      </section>

      <section className="learning-gallery-group" id="learning-kit-read" aria-labelledby="learning-kit-read-heading">
        <h3 id="learning-kit-read-heading" className="learning-gallery-group-heading"><strong>02 · 阅读与复习</strong><small>分清内容，留住问题，再试着回答。</small></h3>
        <div className="learning-gallery-grid">
          <Sample name="FolderTabs" title="文件夹与索引标签" note="点击标签切换；聚焦标签后也可用左右方向键、Home 与 End。">
            <FolderTabs label="React 章节内容" tabs={[
              { id: 'steps', label: '步骤', content: <div className="learning-prose"><h3>用组件拼出 todo</h3><ol><li>建立 Vite 工程。</li><li>拆分输入框、列表与按钮。</li><li>用 state 驱动增删。</li></ol></div> },
              { id: 'bricks', label: '积木', content: <div className="learning-prose"><h3>这章的四块积木</h3><p>组件、props、state、Vite 工程。</p><p>先跟着数据走一遍，再解释界面为什么更新。</p></div> },
              { id: 'practice', label: '练习', content: <div className="learning-prose"><h3>给 todo 加一个筛选器</h3><p>只显示未完成的任务。</p><p><b>验收：</b>切换筛选条件后，原始任务数据保持完整。</p></div> },
            ]} />
          </Sample>
          <Sample name="FlashCard" title="双面知识卡" note="先想一想答案，再点击翻面；知识卡可以反复练习。">
            <FlashCard label="RECALL / React 01" question={<><h3>props 和 state，分别由谁决定？</h3><p>试着用 todo 的输入框与列表解释。</p></>}
              answer={<><h3>从数据的来源判断。</h3><p><b>props</b> 由父组件传入；<b>state</b> 由组件持有，并通过更新函数改变。</p><p>数据变化后，React 再据此更新界面。</p></>} />
          </Sample>
          <Sample name="Bookmark" title="书签与页边标签" note="点击书签切换标记；可用于续读位置或待复习内容。">
            <div className="learning-gallery-bookmarks"><Bookmark label="这一节，待复习" /></div>
          </Sample>
        </div>
      </section>

      <section className="learning-gallery-group" id="learning-kit-task" aria-labelledby="learning-kit-task-heading">
        <h3 id="learning-kit-task-heading" className="learning-gallery-group-heading"><strong>03 · 任务与交付</strong><small>明确交付物，留下运行证据。</small></h3>
        <div className="learning-gallery-grid">
          <Sample name="TaskEnvelope" title="任务信封" note="点击拆开信封，查看给 agent 的完整任务；再次点击收起。">
            <TaskEnvelope title="搭好 Vite 工程" summary="环境准备交给 agent，结果由你核对。">
              <p><b>目标</b><br />建立 React + TypeScript 的 Vite 工程。</p>
              <p><b>约束</b><br />沿用项目现有的包管理器。</p>
              <p><b>交付物</b><br />源码、启动命令、可访问的本地页面。</p>
              <p><b>验收</b><br />启动成功；改一行文字，浏览器里看到变化。</p>
            </TaskEnvelope>
          </Sample>
          <Sample name="OutputReceipt" title="打印回执／输出纸条" note="点击标题折叠或展开输出；长输出可在纸面内滚动。">
            <OutputReceipt title="API 请求，收到响应" command="curl -i localhost:3000/todos"
              output={'HTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  { "id": 1,\n    "title": "第一个 todo",\n    "done": false }\n]'} />
          </Sample>
        </div>
      </section>

      <section className="learning-gallery-group" id="learning-kit-connect" aria-labelledby="learning-kit-connect-heading">
        <h3 id="learning-kit-connect-heading" className="learning-gallery-group-heading"><strong>04 · 知识与对照</strong><small>打开一块积木，读懂两边的关系。</small></h3>
        <div className="learning-gallery-grid">
          <div className="learning-gallery-stack">
            <Sample name="BrickToolbox" title="积木工具盒" note="点击积木展开“是什么、为何在这、带一族”，允许同时打开多块。">
              <BrickToolbox title="Web 通信工具盒" bricks={[
                { id: 'http', name: 'HTTP 请求与响应', learned: true, what: '浏览器问一句，服务器答一句。', why: '页面和 API 数据都通过这次往返获得。', family: '同族还有 WebSocket，适合持续交换消息。' },
                { id: 'rest', name: 'REST 路由', what: '用请求方法与路径表达对资源的操作。', why: '让 todo 的读取、创建与删除有清晰入口。', family: '同样可以比较 RPC 与 GraphQL 的组织方式。' },
              ]} />
            </Sample>
            <Sample name="Stamp" title="验收印章" note="已核对、待复查、待验收各有文字与符号；与装箱单的组合见下方「清单类」。">
              <div className="learning-gallery-stamps"><Stamp /><Stamp status="review" /><Stamp status="pending" /></div>
            </Sample>
          </div>
          <Sample name="DataFlowBoard" title="数据流水线板" wide note="把一条数据流拆成工位卡：板面宽时横排、窄栏退回竖排，箭头固定读向；第一步虚线框＝等你操作的起点。">
            <DataFlowBoard
              title="一次勾选，数据怎样流动？"
              note="读向固定：先改数据，再动界面，最后落库；顺序由列表顺序决定。"
              steps={[
                { id: 'action', title: '用户操作', detail: '在待办列表里点中「买牛奶」的复选框。', tone: 'coral', input: true },
                { id: 'state', title: '更新数据', detail: '这条 todo 的 done 从 false 改成 true，数据先于界面变化。', tone: 'teal' },
                { id: 'render', title: '更新界面', detail: '界面按新数据重画：勾选框打勾，文字加删除线。', tone: 'yellow' },
                { id: 'persist', title: '保存数据', detail: '通过 API 把新状态写入数据库，刷新页面勾选仍在。', tone: 'blue' },
              ]}
            />
          </Sample>
          <Sample name="ComparisonBoard" title="纸页式对照板" wide note="宽屏并排核对，窄屏上下排列；适合请求与响应、源码与产物。">
            <ComparisonBoard title="一次请求，怎样带回数据？"
              left={{ label: '浏览器 / 请求', content: <><pre className="learning-demo-code">{'GET /todos HTTP/1.1\nHost: localhost:3000\nAccept: application/json'}</pre><p className="mt-3">请求里说明：<b>要哪个资源</b>。</p></> }}
              right={{ label: '服务器 / 响应', content: <><pre className="learning-demo-code">{'HTTP/1.1 200 OK\nContent-Type: application/json\n\n[{ "id": 1, "done": false }]'}</pre><p className="mt-3">核对状态码，再看<Mark>返回的数据结构</Mark>。</p></> }}
              caption="沿着请求与响应读一遍，把 Network 面板里的内容与两张纸对上。" />
          </Sample>
        </div>
      </section>

      <section className="learning-gallery-group" id="learning-kit-list" aria-labelledby="learning-kit-list-heading">
        <h3 id="learning-kit-list-heading" className="learning-gallery-group-heading"><strong>05 · 清单类</strong><small>核对与交付，都落在一纸清单上。</small></h3>
        <div className="learning-gallery-grid">
          <Sample name="ClipboardChecklist" title="夹板验收清单" note="勾选所有条件后盖章；取消任一条件，回到待验收。">
            <ClipboardChecklist
              title="第一个网页，跑起来了吗？" description="回到自己的浏览器，逐项核对。"
              defaultCheckedIds={['page']}
              items={[
                { id: 'page', label: '页面显示标题与一句话', detail: '确认看到的是自己写的内容。' },
                { id: 'server', label: '地址栏是 localhost', detail: '页面由服务器返回。' },
                { id: 'network', label: 'Network 返回 200', detail: '找到这次页面请求的响应。' },
              ]}
            />
          </Sample>
          <Sample name="DeliveryManifest + Stamp" title="装箱单／交付清单 × 验收印章" note="按实际产物列出交付状态；全部就绪后，把验收印章盖在装箱单右上角，核对入口一眼可辨。">
            <div className="relative">
              <DeliveryManifest title="这一章，你带走了什么？" reference="CHAPTER 01 / 装箱单" items={[
                { id: 'html', label: 'index.html', detail: '有标题与一句话的页面', ready: true },
                { id: 'server', label: 'server.js', detail: '返回静态文件的服务', ready: true },
                { id: 'evidence', label: '运行记录', detail: 'localhost 页面与 200 响应', ready: true },
              ]} />
              <div className="absolute -top-3 right-6">
                <Stamp />
              </div>
            </div>
          </Sample>
        </div>
      </section>
    </div>
  )
}
