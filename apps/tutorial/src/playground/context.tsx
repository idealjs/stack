import runtimeOrigin from 'virtual:stack-env'
import runtimeDoc from 'virtual:web-runner-doc'
import { initEsbuild } from '@idealjs/stack'
import type { ReactNode, RefObject } from 'react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { buildDemo } from './demoBuild'
import { extractHtmlDocument } from './htmlBody'
import type { OutputLine } from './OutputPanel'
import { isRuntimeMessage, PROTOCOL_VERSION } from './protocol'

const WASM_URL = 'esbuild.wasm'

export const RUNTIME_ORIGIN: string = runtimeOrigin

const MAIN_TS = `// 沙箱工程入口：TypeScript 直写，点「运行」由宿主 stack 构建后送进沙箱执行。
const greeting: string = 'hello, playground'
console.log(greeting)
`

export interface ProjectFile {
  name: string
  code: string
}

const INITIAL_FILES: ProjectFile[] = [{ name: 'main.ts', code: MAIN_TS }]

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

export interface PlaygroundApi {
  files: ProjectFile[]
  active: ProjectFile
  newName: string
  nameError: string | null
  lines: OutputLine[]
  status: RuntimeStatus | null
  sameOriginAlert: boolean
  done: boolean
  building: boolean
  engineReady: boolean
  preview: boolean
  iframeRef: RefObject<HTMLIFrameElement>
  pingRuntime: () => void
  setActiveName: (name: string) => void
  updateActiveCode: (code: string) => void
  setNewName: (value: string) => void
  setNameError: (value: string | null) => void
  addFile: () => void
  removeFile: (name: string) => void
  run: () => Promise<void>
}

const PlaygroundContext = createContext<PlaygroundApi | null>(null)

export function usePlayground(): PlaygroundApi {
  const api = useContext(PlaygroundContext)
  if (api === null)
    throw new Error('PlaygroundProvider 缺失：编辑器与沙箱视图须包在 PlaygroundProvider 内')
  return api
}

export function PlaygroundProvider({
  initialFiles = INITIAL_FILES,
  children,
}: {
  initialFiles?: ProjectFile[]
  children: ReactNode
}) {
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
  const [engineReady, setEngineReady] = useState(false)
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

  useEffect(() => {
    initEsbuild(WASM_URL)
      .then(() => setEngineReady(true))
      .catch((error: unknown) => {
        setLines((prev) => [
          ...prev,
          {
            level: 'error',
            text: `引擎初始化失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ])
      })
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
      if (!files.some((f) => f.name === 'index.html')) {
        setLines([{ level: 'error', stage: 'build', text: '入口文档不存在：index.html' }])
        return
      }
      const { code, htmlDoc } = await buildDemo(files)
      const html = extractHtmlDocument(htmlDoc)
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

  const api: PlaygroundApi = {
    files,
    active,
    newName,
    nameError,
    lines,
    status,
    sameOriginAlert,
    done,
    building,
    engineReady,
    preview,
    iframeRef,
    pingRuntime,
    setActiveName,
    updateActiveCode,
    setNewName,
    setNameError,
    addFile,
    removeFile,
    run,
  }

  return <PlaygroundContext.Provider value={api}>{children}</PlaygroundContext.Provider>
}
