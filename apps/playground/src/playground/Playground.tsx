import { useEffect, useRef, useState } from 'react'
import { ShadowButton } from '../../../../apps/tutorial/src/design-system'
import { isRuntimeMessage, PROTOCOL_VERSION } from './protocol'
import { buildProject } from './build'
import { CONFIG_FILE_NAME, CONFIG_TEMPLATE, parseBuildConfig } from './config'
import { OutputPanel, type OutputLine } from './OutputPanel'

import runtimeHtml from '../../playground-runtime/index.html?raw'

const RUNTIME_ORIGIN: string = import.meta.env.VITE_PLAYGROUND_RUNTIME_ORIGIN ?? ''

const MAIN_TS = `// 沙箱工程入口：TypeScript 直写，点「运行」先经 esbuild-wasm 构建再进沙箱执行。
const greeting: string = 'hello, playground'
console.log(greeting)
`

interface ProjectFile {
  name: string
  code: string
}

const INITIAL_FILES: ProjectFile[] = [
  { name: 'main.ts', code: MAIN_TS },
  { name: CONFIG_FILE_NAME, code: CONFIG_TEMPLATE },
]

export interface PlaygroundProps {
  initialFiles?: ProjectFile[]
}

const FILE_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/

function checkFileName(raw: string, files: ProjectFile[]): string | null {
  const name = raw.trim()
  if (!name) return '文件名不能为空'
  if (!FILE_NAME_RE.test(name))
    return '文件名只能含字母、数字、点、下划线、连字符，且以字母或数字开头（≤64 字符）'
  if (files.some((f) => f.name === name)) return `同名文件已存在：${name}`
  return null
}

interface RuntimeStatus {
  origin: string
  parentBlocked: boolean
}

export function Playground({ initialFiles = INITIAL_FILES }: PlaygroundProps) {
  const [files, setFiles] = useState<ProjectFile[]>(() => initialFiles.map((f) => ({ ...f })))
  const [activeName, setActiveName] = useState(initialFiles[0].name)
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [lines, setLines] = useState<OutputLine[]>([])
  const [status, setStatus] = useState<RuntimeStatus | null>(null)
  const [sameOriginAlert, setSameOriginAlert] = useState(false)
  const [done, setDone] = useState(false)
  const [building, setBuilding] = useState(false)
  const [preview, setPreview] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const active = files.find((f) => f.name === activeName) ?? files[0]

  const updateActiveCode = (code: string) => {
    setFiles((prev) => prev.map((f) => (f.name === active.name ? { ...f, code } : f)))
  }

  const addFile = () => {
    const err = checkFileName(newName, files)
    if (err) {
      setNameError(err)
      return
    }
    const name = newName.trim()
    setFiles((prev) => [...prev, { name, code: '' }])
    setActiveName(name)
    setNewName('')
    setNameError(null)
  }

  const removeFile = (name: string) => {
    if (name === CONFIG_FILE_NAME || files.length <= 1) return
    const next = files.filter((f) => f.name !== name)
    setFiles(next)
    if (name === active.name) setActiveName(next[0].name)
  }

  const pingRuntime = () => {
    iframeRef.current?.contentWindow?.postMessage({ v: PROTOCOL_VERSION, type: 'ping' }, '*')
  }

  useEffect(() => {
    pingRuntime()

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (!isRuntimeMessage(event.data)) return
      const msg = event.data
      if (msg.type === 'ready') {
        setStatus({ origin: msg.origin, parentBlocked: msg.parentBlocked })

        setSameOriginAlert(msg.origin === window.location.origin)
      } else if (msg.type === 'console') {
        setLines((prev) => [...prev, { level: msg.level, text: msg.text }])
      } else if (msg.type === 'error') {
        setLines((prev) => [...prev, { level: 'error', text: msg.text }])
      } else if (msg.type === 'done') {
        setDone(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const run = async () => {
    if (building) return
    setLines([])
    setDone(false)
    setSameOriginAlert(false)
    setBuilding(true)
    try {
      const configFile = files.find((f) => f.name === CONFIG_FILE_NAME)
      const parsed = parseBuildConfig(configFile?.code ?? '')
      if (!parsed.ok) {
        setLines([{ level: 'error', stage: 'build', text: parsed.error }])
        return
      }
      const outcome = await buildProject(files, parsed.config)
      const problemLines: OutputLine[] = outcome.problems.map((p) => ({
        level: p.level,
        stage: 'build',
        text: p.text,
      }))
      if (!outcome.ok || outcome.code === null) {
        setLines(problemLines)
        return
      }
      setLines(problemLines)
      iframeRef.current?.contentWindow?.postMessage(
        {
          v: PROTOCOL_VERSION,
          type: 'run',
          code: outcome.code,
          ...(outcome.html !== null ? { html: outcome.html } : {}),
        },
        '*',
      )
      setPreview(outcome.html !== null)
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div>
      {/* 隔离自证状态条：运行时 ready 后回填。沙箱（allow-scripts）剥源之下文档 origin
       * 恒为 "null"（opaque）——srcdoc 与跨源 src 皆然；RUNTIME_ORIGIN 显示的是「部署位」。
       * 「父窗口访问已阻断」＝运行时读 parent.location 抛 SecurityError 的自证，e2e 断言点。 */}
      <p className="t-small-mute m-0 mb-2.5" data-testid="runtime-status">
        {status
          ? `运行时源：${RUNTIME_ORIGIN ? `${RUNTIME_ORIGIN}（独立源部署）` : 'null（opaque origin，srcdoc 退化）'} · 文档 origin：${status.origin}`
          : '运行时启动中…'}
        {status && ' · '}
        {status &&
          (status.parentBlocked ? (
            <span className="font-bold text-ink">父窗口访问已阻断</span>
          ) : (
            <span className="font-bold text-clash1a">父窗口访问未被阻断——隔离异常！</span>
          ))}
        {sameOriginAlert && (
          <span className="font-bold text-clash1a"> · 运行时与宿主同源——隔离失效！</span>
        )}
      </p>

      {/* 项目文件：切换＝按钮置灰当前项；删除＝×（至少保留一份，esbuild.config.json 是
       * 构建配置位，永不删）；新建＝白名单校验后入列。文件名是用户输入，渲染永远走文本节点。 */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="项目文件">
        {files.map((f) => (
          <span
            key={f.name}
            className="inline-flex items-center overflow-hidden rounded-md border-2 border-ink bg-white"
          >
            <button
              type="button"
              onClick={() => setActiveName(f.name)}
              aria-current={f.name === active.name ? 'true' : undefined}
              className={`px-2 py-0.5 font-mono text-[12px] ${
                f.name === active.name ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-deep'
              }`}
            >
              {f.name}
            </button>
            {files.length > 1 && f.name !== CONFIG_FILE_NAME && (
              <button
                type="button"
                onClick={() => removeFile(f.name)}
                aria-label={`删除 ${f.name}`}
                title={`删除 ${f.name}`}
                className="px-1.5 py-0.5 text-[12px] text-mute hover:text-clash1a"
              >
                ×
              </button>
            )}
          </span>
        ))}
        <form
          className="inline-flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            addFile()
          }}
        >
          <input
            data-testid="new-file-name"
            aria-label="新文件名"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setNameError(null)
            }}
            placeholder="新建文件…"
            className="w-28 rounded-md border-2 border-ink bg-white px-2 py-0.5 font-mono text-[12px] text-ink outline-none focus:bg-white"
          />
          <button
            type="submit"
            aria-label="新建文件"
            className="rounded-md border-2 border-ink bg-white px-2 py-0.5 text-[12px] text-ink hover:bg-paper-deep"
          >
            ＋
          </button>
        </form>
      </div>
      {nameError && (
        <p
          role="alert"
          data-testid="file-name-error"
          className="t-small-mute m-0 mb-2 font-bold text-clash1a"
        >
          {nameError}
        </p>
      )}

      {/* 编辑器：textarea 起步（后续接缝：CodeMirror 等真编辑器，只换这一块） */}
      <textarea
        aria-label="模块代码"
        value={active.code}
        onChange={(e) => updateActiveCode(e.target.value)}
        spellCheck={false}
        rows={12}
        className="w-full resize-y rounded-xl border-2 border-ink bg-paper p-3 font-mono text-[13px] leading-relaxed text-ink outline-none focus:bg-white"
      />

      <div className="mt-2.5 flex items-center gap-3">
        <ShadowButton tone="clash1a" onClick={run} disabled={building}>
          运行 ▶
        </ShadowButton>
        <span className="t-small-mute">
          {building
            ? 'esbuild-wasm 构建中…'
            : `「${active.name}」经 esbuild-wasm 构建后送进沙箱：Blob URL + import()`}
        </span>
      </div>

      {/* 输出面板：console 按级别显示，构建诊断带「构建」徽章；done 后缀一行执行完毕。 */}
      <OutputPanel lines={lines} done={done} />

      {/* 沙箱 iframe：唯一通道 postMessage。html 模式下它就是预览框——入口文档的身体
       * 被装进这份沙箱文档（脚本已剥，执行只走构建通道）；console 模式保持 0×0 视觉退场。
       * sandbox 只有 allow-scripts——加任何一个 allow-*（尤其 allow-same-origin）都是击穿。 */}
      <iframe
        ref={iframeRef}
        title="playground 沙箱运行时"
        sandbox="allow-scripts"
        src={RUNTIME_ORIGIN ? `${RUNTIME_ORIGIN.replace(/\/$/, '')}/` : undefined}
        srcDoc={RUNTIME_ORIGIN ? undefined : runtimeHtml}
        onLoad={pingRuntime}
        className={
          preview ? 'mt-4 block w-full rounded-xl border-2 border-ink bg-white' : 'border-0'
        }
        style={preview ? { height: 240 } : { width: 0, height: 0 }}
        data-testid="sandbox-frame"
      />
    </div>
  )
}
