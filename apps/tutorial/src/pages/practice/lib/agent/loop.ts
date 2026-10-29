import type { PracticeTask } from '../tasks'
import { taskMarkdown } from '../tasks'
import type { ChatMessage, LlmConfig } from './llm'
import { streamChat } from './llm'

export function systemPrompt(task: PracticeTask): string {
  return [
    '你是「在线练习」页面的陪练 agent。用户是编程初学者，正在完成一个练习任务：你负责讲解思路、给出代码与检查方法，用户负责动手和验收。',
    '',
    `当前任务：${task.title}`,
    '任务说明（TASK.md）：',
    taskMarkdown(task),
    '',
    '工作约定：',
    '- 页面左侧已接入沙箱运行时：用户会把代码粘贴进左侧编辑器，点「运行」构建后在隔离 iframe 里执行；你不能真的写文件或跑命令。改动以完整可粘贴的代码块给出，并说明放进哪个文件、替换哪一段。',
    '- 用户粘贴报错或代码时，先解释发生了什么，再给最小修改；不要一次倾倒完整文件，除非用户要求。',
    '- 全程简体中文，简洁、教学式；完成后引导用户逐条对照验收清单。',
  ].join('\n')
}

export interface TurnHooks {
  onAssistantDelta: (delta: string) => void
}

export async function runAgentTurn(opts: {
  config: LlmConfig

  history: ChatMessage[]
  userText: string
  signal: AbortSignal
  hooks: TurnHooks
}): Promise<void> {
  const { config, history, userText, signal, hooks } = opts
  history.push({ role: 'user', content: userText })

  let _full = ''
  const assistant = await streamChat({
    config,
    messages: history,
    signal,
    onDelta: (delta) => {
      _full += delta
      hooks.onAssistantDelta(delta)
    },
  })
  history.push({ role: 'assistant', content: assistant.content })
}
