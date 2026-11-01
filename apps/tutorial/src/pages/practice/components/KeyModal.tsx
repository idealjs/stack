import { useState } from 'react'
import { DockModal } from '../../../design-system'
import type { LlmConfig } from '../lib/agent/llm'

const FIELD =
  'w-full rounded-lg border-2 border-ink bg-paper px-2.5 py-1.5 font-mono text-[13px] outline-none focus:bg-paper-deep'

export function KeyModal({
  config,
  onSave,
  onClose,
}: {
  config: LlmConfig
  onSave: (config: LlmConfig) => void
  onClose: () => void
}) {
  const [baseURL, setBaseURL] = useState(config.baseURL)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [model, setModel] = useState(config.model)

  return (
    <DockModal label="模型接入" className="w-full max-w-md" onClose={onClose}>
      <h2 className="m-0 text-t3 font-extrabold text-ink">模型接入</h2>
      <p className="t-small-mute mt-1.5 mb-4">
        默认 DeepSeek；也可填任何 OpenAI 兼容端点。key 仅保存在浏览器 localStorage。
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSave({ baseURL: baseURL.trim(), apiKey: apiKey.trim(), model: model.trim() })
        }}
      >
        <label htmlFor="km-base-url" className="t-small-strong mb-1 block">
          API 地址（baseURL）
        </label>
        <input
          id="km-base-url"
          className={FIELD}
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
          spellCheck={false}
        />
        <label htmlFor="km-api-key" className="t-small-strong mt-3 mb-1 block">
          API Key
        </label>
        <input
          id="km-api-key"
          className={FIELD}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-…"
          autoComplete="off"
          spellCheck={false}
        />
        <label htmlFor="km-model" className="t-small-strong mt-3 mb-1 block">
          模型
        </label>
        <input
          id="km-model"
          className={FIELD}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          spellCheck={false}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border-2 border-ink bg-paper px-3 py-1.5 text-[13px] font-bold text-body transition-colors hover:bg-paper-deep"
          >
            取消
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-lg border-2 border-ink bg-clash1b px-3 py-1.5 text-[13px] font-bold text-ink transition-colors hover:bg-clash1b/80"
          >
            保存
          </button>
        </div>
      </form>
    </DockModal>
  )
}
