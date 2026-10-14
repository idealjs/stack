/** Agent loop——驱动一轮「用户消息 → (工具调用)* → 回复」的会话推进。
 * 模型只与 TOOL_SCHEMAS/llm seam 打交道；对 WebContainer 的访问全部经 tools seam。 */
import type { WebContainer } from '@webcontainer/api'
import type { ChatMessage, LlmConfig } from './llm'
import { streamChat } from './llm'
import type { PracticeTask } from '../tasks'
import { taskMarkdown } from '../tasks'
import type { ToolHooks } from './tools'
import { TOOL_SCHEMAS, execTool } from './tools'

/** 单轮对话最大「模型步」数（含工具迭代），防失控 */
const MAX_STEPS = 25

export function systemPrompt(task: PracticeTask): string {
  return [
    '你是「在线练习」页面的陪练 agent，运行在浏览器 WebContainer 沙盒中。',
    '用户是编程初学者，正在完成一个练习任务：你负责写代码，用户负责提出要求、看预览并验收结果。',
    '',
    `当前任务：${task.title}`,
    '任务说明（TASK.md）：',
    taskMarkdown(task),
    '',
    '工作约定：',
    '- dev server 已在运行，用户始终能看到最新预览；禁止启动常驻服务（npm run dev/serve 等）。',
    '- 改动代码用 write_file 全量写入；改完直接请用户看预览，不要自行「验证页面」。',
    '- 需要确认现状时用 read_file / run_command（如 npx tsc --noEmit 查类型错误）。',
    '- 全程简体中文，简洁、教学式；完成后引导用户逐条对照验收清单。',
  ].join('\n')
}

export interface TurnHooks extends ToolHooks {
  /** assistant 文本增量（流式） */
  onAssistantDelta: (delta: string) => void
  onToolCall: (name: string, args: Record<string, unknown>) => void
  onToolResult: (name: string, summary: string) => void
}

/** 推进一轮对话：就地追加 user/assistant/tool 消息到 history。Abort 后直接抛出。 */
export async function runAgentTurn(opts: {
  config: LlmConfig
  wc: WebContainer
  /** 完整历史（应已含 system prompt），就地追加 */
  history: ChatMessage[]
  userText: string
  signal: AbortSignal
  hooks: TurnHooks
}): Promise<void> {
  const { config, wc, history, userText, signal, hooks } = opts
  history.push({ role: 'user', content: userText })

  for (let step = 0; step < MAX_STEPS; step++) {
    const assistant = await streamChat({
      config,
      messages: history,
      tools: TOOL_SCHEMAS,
      signal,
      onDelta: hooks.onAssistantDelta,
    })
    history.push(assistant)

    const calls = assistant.tool_calls ?? []
    if (!calls.length) return // 纯文本回复，本轮结束

    for (const call of calls) {
      let args: Record<string, unknown> = {}
      try {
        args = JSON.parse(call.function.arguments || '{}')
      } catch {
        // 参数坏包也照样走 execTool 的容错路径
      }
      hooks.onToolCall(call.function.name, args)
      let result: string
      try {
        result = await execTool(wc, call.function.name, call.function.arguments, hooks)
      } catch (e) {
        result = `工具执行失败：${(e as Error).message}`
      }
      hooks.onToolResult(call.function.name, result)
      history.push({ role: 'tool', tool_call_id: call.id, content: result })
    }
  }

  history.push({
    role: 'assistant',
    content: '（已连续执行较多步骤，先停在这里。你可以继续给指示。）',
  })
}
