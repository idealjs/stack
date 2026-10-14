/** WebContainer 生命周期 seam：boot → mount 模板 → npm install → dev server。
 * 全部浏览器端调用；@webcontainer/api 动态 import，SSG 渲染树不触碰 window。 */
import type { FileSystemTree, WebContainer, WebContainerProcess } from '@webcontainer/api'

export type { WebContainer }

/** 终端流水：install / dev / agent 命令的输出都汇到同一个 sink */
export type OutputSink = (chunk: string) => void

export interface PracticeEnv {
  wc: WebContainer
  /** dev server 就绪后的预览地址 */
  previewUrl: Promise<string>
}

function assertIsolated() {
  if (typeof window === 'undefined' || !window.crossOriginIsolated) {
    throw new Error(
      '页面未开启跨域隔离（crossOriginIsolated=false）。WebContainer 需要 COOP/COEP 响应头：' +
        'Cross-Origin-Opener-Policy: same-origin 与 Cross-Origin-Embedder-Policy: require-corp。' +
        '若在本地 vite dev/preview 之外访问，请检查反向代理是否配置了同名头。',
    )
  }
}

/** 拉起练习环境：mount 模板 → 装依赖 → 起 dev server。install 输出/错误都进终端流水。 */
export async function startPracticeEnv(files: FileSystemTree, sink: OutputSink): Promise<PracticeEnv> {
  assertIsolated()
  const { WebContainer } = await import('@webcontainer/api')
  const wc = await WebContainer.boot()
  await wc.mount(files)

  const install = await spawnPiped(wc, 'npm', ['install'], sink)
  const installExit = await install.exit
  if (installExit !== 0) {
    throw new Error(`依赖安装失败（exit ${installExit}），详情见终端。可点击「重试」重新拉起。`)
  }

  const previewUrl = new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('dev server 90s 未就绪，请查看终端输出')), 90_000)
    wc.on('server-ready', (_port, url) => {
      clearTimeout(timer)
      resolve(url)
    })
  })

  // dev server 常驻，不等待退出
  spawnPiped(wc, 'npm', ['run', 'dev'], sink).catch((e) => sink(`\r\ndev server 异常退出：${e.message}\r\n`))

  return { wc, previewUrl }
}

export async function spawnPiped(
  wc: WebContainer,
  command: string,
  args: string[],
  sink: OutputSink,
): Promise<WebContainerProcess> {
  const proc = await wc.spawn(command, args)
  proc.output.pipeTo(new WritableStream({ write: sink }))
  return proc
}

export interface FileEntry {
  path: string
  kind: 'file' | 'dir'
  depth: number
}

/** 只读文件树快照（跳过 node_modules）：agent 每次 write 后重扫 */
export async function scanFiles(wc: WebContainer, root = '/', maxDepth = 4): Promise<FileEntry[]> {
  const out: FileEntry[] = []
  async function walk(dir: string, depth: number) {
    if (depth > maxDepth) return
    const dirents = await wc.fs.readdir(dir, { withFileTypes: true })
    for (const d of dirents) {
      if (d.name === 'node_modules' || d.name.startsWith('.')) continue
      const path = `${dir === '/' ? '' : dir}/${d.name}`
      out.push({ path, kind: d.isFile() ? 'file' : 'dir', depth })
      if (d.isDirectory()) await walk(path, depth + 1)
    }
  }
  await walk(root, 1)
  return out.sort((a, b) => (a.path === b.path ? 0 : a.path.localeCompare(b.path)))
}
