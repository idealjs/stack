/** Agent 会话 seam——当前为「无工具直连对话」形态。
 * 练习场的代码执行运行时（WebContainer / Vivari 适配层）已随 ESM + MCP 重规划移除，
 * 工具循环（write_file / run_command 与 ⚙ 状态行）归档于 exp/vivari-playground 分支；
 * 新运行时接入后按原 seam 形状接回：streamChat 的 tools 参数、TurnHooks 的
 * onToolCall/onToolResult 回调位都留在这里。 */
import type { ChatMessage, LlmConfig } from './llm'
import { streamChat } from './llm'
import type { PracticeTask } from '../tasks'
import { taskMarkdown } from '../tasks'

export function systemPrompt(task: PracticeTask): string {
  return [
    '你是「在线练习」页面的陪练 agent。用户是编程初学者，正在完成一个练习任务：你负责讲解思路、给出代码与检查方法，用户负责动手和验收。',
    '',
    `当前任务：${task.title}`,
    '任务说明（TASK.md）：',
    taskMarkdown(task),
    '',
    '工作约定：',
    '- 当前页面尚未接入代码执行运行时：你不能真的写文件或跑命令。改动以代码块给出，并说明放进哪个文件、替换哪一段。',
    '- 用户粘贴报错或代码时，先解释发生了什么，再给最小修改；不要一次倾倒完整文件，除非用户要求。',
    '- 全程简体中文，简洁、教学式；完成后引导用户逐条对照验收清单。',
  ].join('\n')
}

export interface TurnHooks {
  /** assistant 文本增量（流式） */
  onAssistantDelta: (delta: string) => void
}

/** 推进一轮对话：就地追加 user/assistant 消息到 history。Abort 后直接抛出。 */
export async function runAgentTurn(opts: {
  config: LlmConfig
  /** 完整历史（应已含 system prompt），就地追加 */
  history: ChatMessage[]
  userText: string
  signal: AbortSignal
  hooks: TurnHooks
}): Promise<void> {
  const { config, history, userText, signal, hooks } = opts
  history.push({ role: 'user', content: userText })

  let full = ''
  const assistant = await streamChat({
    config,
    messages: history,
    signal,
    onDelta: (delta) => {
      full += delta
      hooks.onAssistantDelta(delta)
    },
  })
  history.push({ role: 'assistant', content: assistant.content })
}
