import runtimeDoc from 'virtual:web-runner-doc'
import { ShadowButton } from '../design-system'
import { RUNTIME_ORIGIN, usePlayground } from './context'
import { OutputPanel } from './OutputPanel'

export function StatusLine() {
  const { status, sameOriginAlert } = usePlayground()
  return (
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
  )
}

export function FileTabs() {
  const {
    files,
    active,
    newName,
    nameError,
    setActiveName,
    removeFile,
    setNewName,
    setNameError,
    addFile,
  } = usePlayground()
  return (
    <>
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
    </>
  )
}

export function CodeEditor() {
  const { active, updateActiveCode } = usePlayground()
  return (
    <textarea
      aria-label="模块代码"
      value={active.code}
      onChange={(e) => updateActiveCode(e.target.value)}
      spellCheck={false}
      rows={12}
      className="w-full resize-y rounded-xl border-2 border-ink bg-white p-3 font-mono text-[13px] leading-relaxed text-ink outline-none selection:bg-white"
    />
  )
}

export function RunRow() {
  const { active, building, engineReady, run } = usePlayground()
  return (
    <div className="mt-2.5 flex items-center gap-3">
      <ShadowButton tone="clash1a" onClick={run} disabled={building || !engineReady}>
        {engineReady ? '运行 ▶' : '引擎加载中…'}
      </ShadowButton>
      <span className="t-small-mute">
        {building
          ? 'stack 构建中（宿主）…'
          : `「${active.name}」宿主 stack 构建（入口按 stack.config.ts 的 inputs，缺省由 index.html 的 script src 推导）→ 产物送沙箱执行`}
      </span>
    </div>
  )
}

export function OutputView() {
  const { lines, done } = usePlayground()
  return <OutputPanel lines={lines} done={done} />
}

function iframeProps(preview: boolean) {
  return {
    title: 'playground 沙箱运行时',
    sandbox: 'allow-scripts',
    src: RUNTIME_ORIGIN ? `${RUNTIME_ORIGIN.replace(/\/$/, '')}/` : undefined,
    srcDoc: RUNTIME_ORIGIN ? undefined : runtimeDoc,
    'data-testid': 'sandbox-frame',
    ...(preview ? {} : { style: { width: 0, height: 0 } }),
  } as const
}

export function SandboxFrame({ fill = false }: { fill?: boolean }) {
  const { preview, iframeRef, pingRuntime } = usePlayground()
  if (fill) {
    return (
      <iframe
        {...iframeProps(preview)}
        ref={iframeRef}
        onLoad={pingRuntime}
        className="block size-full rounded-lg border-0 bg-white"
      />
    )
  }
  return (
    <iframe
      {...iframeProps(preview)}
      ref={iframeRef}
      onLoad={pingRuntime}
      className={preview ? 'mt-4 block w-full rounded-xl border-2 border-ink bg-white' : 'border-0'}
      style={preview ? { height: 240 } : { width: 0, height: 0 }}
    />
  )
}
