export interface LlmConfig {
  baseURL: string
  apiKey: string
  model: string
}

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
}

const STORE_KEY = 'practice.llm.v1'

export function loadLlmConfig(): LlmConfig {
  if (typeof localStorage === 'undefined') return DEFAULT_LLM_CONFIG
  try {
    return { ...DEFAULT_LLM_CONFIG, ...JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') }
  } catch {
    return DEFAULT_LLM_CONFIG
  }
}

export function saveLlmConfig(config: LlmConfig) {
  localStorage.setItem(STORE_KEY, JSON.stringify(config))
}

export function hasKey(config: LlmConfig): boolean {
  return config.apiKey.trim().length > 0
}

export interface ToolSchema {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

export interface ToolCall {
  id: string
  function: { name: string; arguments: string }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export async function streamChat(opts: {
  config: LlmConfig
  messages: ChatMessage[]
  tools?: ToolSchema[]
  signal?: AbortSignal
  onDelta?: (text: string) => void
}): Promise<ChatMessage> {
  const url = `${opts.config.baseURL.replace(/\/+$/, '')}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.config.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: opts.config.model,
      messages: opts.messages,
      tools: opts.tools,
      stream: true,
    }),
    signal: opts.signal,
  })
  if (!res.ok || !res.body) {
    const detail = (await res.text().catch(() => '')).slice(0, 300)
    throw new Error(`LLM 请求失败 HTTP ${res.status}${detail ? `：${detail}` : ''}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let content = ''
  const toolAcc = new Map<number, ToolCall>()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx: number
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim()
      buf = buf.slice(idx + 1)
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') continue
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta ?? {}
        if (typeof delta.content === 'string' && delta.content) {
          content += delta.content
          opts.onDelta?.(delta.content)
        }
        for (const tc of delta.tool_calls ?? []) {
          const acc = toolAcc.get(tc.index) ?? { id: '', function: { name: '', arguments: '' } }
          if (tc.id) acc.id = tc.id
          if (tc.function?.name) acc.function.name += tc.function.name
          if (tc.function?.arguments) acc.function.arguments += tc.function.arguments
          toolAcc.set(tc.index, acc)
        }
      } catch {
        // 残包/心跳行，忽略
      }
    }
  }

  const message: ChatMessage = { role: 'assistant', content }
  if (toolAcc.size)
    message.tool_calls = [...toolAcc.entries()].sort(([a], [b]) => a - b).map(([, v]) => v)
  return message
}
