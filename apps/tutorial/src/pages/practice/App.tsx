/** 在线练习——占位页。浏览器内运行时两条路线（WebContainer / Vivari）经评估后均已移除：
 * 前者闭源且运行时资产绑定外部域，后者单人维护、工程管理（yarn4 等）在 wasm32 VM 内结构性受限。
 * 练习场将基于 ESM + MCP 的形式重新规划；历史实现归档于 exp/vivari-playground 分支，
 * 调研报告（外部域实测 / Prisma generate 与 migrate 移植可行性）在 vivari-lab 分支的 lab/ 目录。 */
import { Page } from '../../lib/ui'
import { Button } from '@stack/design-system'

export function App() {
  return (
    <Page
      active="practice"
      title="在线练习"
      desc="练习场正在重新规划：我们将以 ESM + MCP 的形式重建「在浏览器里动手写、有 Agent 陪练」的体验。在它回来之前，教程与本地跟练路线不受影响。"
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border-2 border-ink bg-paper p-5 shadow-hard">
          <h2 className="m-0 text-t3 font-extrabold text-ink">现在就能开始</h2>
          <p className="mt-2 mb-3 text-[13.5px] leading-6 text-body">
            教程不依赖练习场：从第一个网页写起，本地环境的跟练路线照常可用。
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button tone="clash1b" href="/learn.html">去看教程概览</Button>
            <Button href="/ch1.html">从第一个网页开始</Button>
          </div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-ink/40 bg-paper-deep p-5">
          <h2 className="m-0 text-t3 font-extrabold text-ink">重建中的练习场</h2>
          <p className="mt-2 mb-0 text-[13.5px] leading-6 text-body">
            计划采用 ESM + MCP 的形式：页面直接以 ESM 模块承载练习工程，Agent 经 MCP 工具协议协助你写代码、跑命令。
            方案规划完成后会在这里上线。
          </p>
        </div>
      </section>
    </Page>
  )
}
