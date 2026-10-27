import runtimeDoc from 'virtual:web-runner-doc'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ShadowButton } from '../design-system'
import { buildDemo } from './demoBuild'
import { extractHtmlBody } from './htmlBody'
import { type OutputLine, OutputPanel } from './OutputPanel'
import { isRuntimeMessage, PROTOCOL_VERSION } from './protocol'

const RUNTIME_ORIGIN: string = import.meta.env.VITE_STACK_RUNTIME_ORIGIN ?? ''

const MAIN_TS = `// 沙箱工程入口：TypeScript 直写，点「运行」由宿主 stack 构建后送进沙箱执行。
const greeting: string = 'hello, playground'
console.log(greeting)
`

interface ProjectFile {
  name: string
  code: string
}

const INITIAL_FILES: ProjectFile[] = [{ name: 'main.ts', code: MAIN_TS }]

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
    if (files.length <= 1) return
    const next = files.filter((f) => f.name !== name)
    setFiles(next)
    if (name === active.name) setActiveName(next[0].name)
  }

  const pendingRun = useRef<{ code: string; html: string } | null>(null)

  const reloadRuntime = useCallback(() => {
    const frame = iframeRef.current
    if (frame === null) return
    if (RUNTIME_ORIGIN) frame.src = `${RUNTIME_ORIGIN.replace(/\/$/, '')}/?t=${Date.now()}`
    else frame.srcdoc = `${runtimeDoc}\n<!--${Date.now()}-->`
  }, [])

  const pingRuntime = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ v: PROTOCOL_VERSION, type: 'ping' }, '*')
  }, [])

  useEffect(() => {
    pingRuntime()

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (!isRuntimeMessage(event.data)) return
      const msg = event.data
      if (msg.type === 'ready') {
        setStatus({ origin: msg.origin, parentBlocked: msg.parentBlocked })

        setSameOriginAlert(msg.origin === window.location.origin)
        const pending = pendingRun.current
        if (pending !== null) {
          pendingRun.current = null
          iframeRef.current?.contentWindow?.postMessage(
            { v: PROTOCOL_VERSION, type: 'run', code: pending.code, html: pending.html },
            '*',
          )
        }
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
  }, [pingRuntime])

  const run = async () => {
    if (building) return
    setLines([])
    setDone(false)
    setSameOriginAlert(false)
    setBuilding(true)
    try {
      const doc = files.find((f) => f.name === 'index.html')
      if (doc === undefined) {
        setLines([{ level: 'error', stage: 'build', text: '入口文档不存在：index.html' }])
        return
      }
      const entry = /<script\b[^>]*\ssrc="([^"]+)"/i.exec(doc.code)?.[1]?.replace(/^\.\//, '')
      if (entry === undefined || !files.some((f) => f.name === entry)) {
        setLines([
          {
            level: 'error',
            stage: 'build',
            text:
              entry === undefined
                ? 'index.html 缺少 <script src>——无法确定入口'
                : `入口文件不存在：${entry}（index.html 的 script src 必须指向工程内文件）`,
          },
        ])
        return
      }
      const html = extractHtmlBody(doc.code)
      const code = await buildDemo(files, entry)
      pendingRun.current = { code, html }
      reloadRuntime()
      setPreview(true)
    } catch (error) {
      setLines((prev) => [
        ...prev,
        {
          level: 'error',
          stage: 'build',
          text: error instanceof Error ? error.message : String(error),
        },
      ])
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

      {/* 项目文件：切换＝按钮置灰当前项；删除＝×（至少保留一份）；新建＝白名单校验后入列。
       * 入口由 index.html 的 script src 推导（stack 驱动）；demo 构建在本页由 stack SDK 完成，
       * 沙箱只执行构建产物。文件名是用户输入，渲染永远走文本节点。 */}
      {/* biome-ignore lint/a11y/useSemanticElements: 文件切换按钮集合，fieldset 表单语义不符 */}
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
            {files.length > 1 && (
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
            ? 'stack 构建中（宿主）…'
            : `「${active.name}」宿主 stack 构建（入口按 stack.config.ts，缺省由 index.html 的 script src 推导）→ 产物送沙箱执行`}
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
        srcDoc={RUNTIME_ORIGIN ? undefined : runtimeDoc}
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
