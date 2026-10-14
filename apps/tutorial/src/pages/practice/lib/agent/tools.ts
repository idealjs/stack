/** 工具 seam——agent 对练习工程的全部动作：写文件 / 读文件 / 跑命令。
 * 一律作用在 WebContainer 内，浏览器侧只拿结果摘要喂回模型。 */
import type { WebContainer } from '@webcontainer/api'
import type { OutputSink } from '../webcontainer'
import type { ToolSchema } from './llm'

export interface ToolHooks {
  /** 命令输出进终端流水（与 install/dev 共用一块屏） */
  onCommandChunk?: OutputSink
}

/** 工具结果与命令输出的截断上限（token 友好） */
const MAX_RESULT = 4000

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: '写入或覆盖练习工程中的一个 UTF-8 文本文件。父目录不存在会自动创建。',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '工程内相对路径，如 src/App.tsx' },
          content: { type: 'string', description: '完整文件内容（全量覆盖，非增量）' },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: '读取练习工程中的一个文本文件。',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string', description: '工程内相对路径' } },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description:
        '在练习工程根目录执行一条 shell 命令并返回输出与退出码。dev server 已在运行，不要执行长期驻留的服务类命令。',
      parameters: {
        type: 'object',
        properties: { command: { type: 'string', description: '如 node -v、npx tsc --noEmit' } },
        required: ['command'],
      },
    },
  },
]

export async function execTool(
  wc: WebContainer,
  name: string,
  argsJson: string,
  hooks: ToolHooks,
): Promise<string> {
  let args: Record<string, unknown>
  try {
    args = argsJson ? JSON.parse(argsJson) : {}
  } catch {
    return '参数不是合法 JSON，请重试。'
  }

  switch (name) {
    case 'write_file': {
      const path = String(args.path ?? '')
      if (!path || path.startsWith('/')) return 'path 必须是工程内相对路径'
      const dir = path.split('/').slice(0, -1).join('/')
      if (dir) await wc.fs.mkdir(dir, { recursive: true }).catch(() => {})
      await wc.fs.writeFile(path, String(args.content ?? ''), { encoding: 'utf8' })
      return `已写入 ${path}（${String(args.content ?? '').length} 字符），预览将由 vite 热更新。`
    }
    case 'read_file': {
      const path = String(args.path ?? '')
      const text = await wc.fs.readFile(path, 'utf8')
      return text.length > MAX_RESULT * 2 ? `${text.slice(0, MAX_RESULT * 2)}\n…（超长截断）` : text
    }
    case 'run_command': {
      const command = String(args.command ?? '').trim()
      if (!command) return 'command 为空'
      const proc = await wc.spawn('jsh', ['-c', command])
      let output = ''
      proc.output.pipeTo(
        new WritableStream({
          write(chunk) {
            output += chunk
            hooks.onCommandChunk?.(chunk)
          },
        }),
      )
      const exit = await proc.exit
      const clipped = output.length > MAX_RESULT ? `…（前段截断）\n${output.slice(-MAX_RESULT)}` : output
      return `exit ${exit}\n${clipped || '(无输出)'}`
    }
    default:
      return `未知工具 ${name}`
  }
}
