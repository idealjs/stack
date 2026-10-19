/** Playground 宿主组件：极简编辑器（textarea）＋「运行」＋输出面板＋沙箱 iframe。
 *
 * 安全模型（与本目录 protocol.ts、../../playground-runtime/index.html 共同构成契约）：
 * - iframe 只有 sandbox="allow-scripts"。严禁 allow-same-origin（它会把 srcdoc/跨源文档
 *   拉回宿主源，DOM 遍历即击穿全部隔离）、也严禁 allow-top-navigation / allow-popups /
 *   allow-forms / allow-modals——沙箱里的代码只许算与说，不许动宿主。
 * - 宿主 ↔ 运行时唯一通道是 postMessage。消息显式构造、带协议版本字段 { v: 1, type: ... }；
 *   宿主对收到的每条消息做双重校验——来源（event.source 对上当前 iframe 的 contentWindow）
 *   与结构（isRuntimeMessage），不认识的一律丢弃。
 * - 运行时文档与宿主不同源是硬要求：OPFS（navigator.storage.getDirectory）在 opaque
 *   origin 下被浏览器禁用——而 sandbox="allow-scripts"（无 allow-same-origin）把框进来的
 *   文档剥成 opaque origin，srcdoc 与跨源 src 皆然。所以「运行时拥有真实但独立的源」要等
 *   OPFS 阶段把沙箱放宽为 allow-scripts + allow-same-origin 才成立——放宽之所以安全，正
 *   是因为文档部署在独立源上（另一端口/另一域名），宿主隔离不破。这就是独立源接缝
 *   （vite.runtime.config.ts / VITE_PLAYGROUND_RUNTIME_ORIGIN / 另一域名托管）存在的根因。
 *   当前构建未注入 VITE_PLAYGROUND_RUNTIME_ORIGIN 时退化 srcdoc——hello world 阶段两条路
 *   行为一致（同为 opaque origin），隔离一视同仁。 */
import { useEffect, useRef, useState } from 'react'
import { ShadowButton } from '@stack/design-system'
import { isRuntimeMessage, PROTOCOL_VERSION, type ConsoleLevel } from './protocol'
// 「一份原文、两条路」：运行时文档原文以 ?raw 进包，srcdoc 退化路径直接注入 iframe；
// 跨源路径不用它（iframe src 直指第二端口/另一域名 serve 的同一文件）。
import runtimeHtml from '../../playground-runtime/index.html?raw'

/** 运行时源：构建/开发时经 VITE_PLAYGROUND_RUNTIME_ORIGIN 注入；缺省空串＝srcdoc 退化 */
const RUNTIME_ORIGIN: string = import.meta.env.VITE_PLAYGROUND_RUNTIME_ORIGIN ?? ''

/** 预置示例：默认导出 init() 的模块——运行时 import 完成后调用 init（见运行时 execute），
 * 这是将来 init()/update() 练习框架的接缝。 */
const HELLO_WORLD = `// 沙箱里的第一个模块：默认导出 init()，运行时在 import 完成后调用它。
export default {
  init() {
    console.log('hello, playground')
  },
}
`

interface OutputLine {
  level: ConsoleLevel | 'system'
  text: string
}

/** 运行时报到后的隔离自证（ready 消息），渲染成状态条——e2e 据此断言 */
interface RuntimeStatus {
  origin: string
  parentBlocked: boolean
}

const LEVEL_STYLE: Record<OutputLine['level'], string> = {
  log: 'bg-paper-deep text-body',
  info: 'bg-paper-deep text-body',
  warn: 'bg-clash2a text-ink',
  error: 'bg-clash1a text-ink',
  system: 'bg-paper text-mute',
}

export function Playground() {
  const [code, setCode] = useState(HELLO_WORLD)
  const [lines, setLines] = useState<OutputLine[]>([])
  const [status, setStatus] = useState<RuntimeStatus | null>(null)
  const [sameOriginAlert, setSameOriginAlert] = useState(false)
  const [done, setDone] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  /** 索要 ready 报到：运行时文档加载与宿主监听器挂载并发，自发 ready 可能漏收——
   * onLoad 与挂载后各 ping 一次，运行时凡收到即补发 ready（协议 PingMessage）。
   * targetOrigin 只能 '*'：沙箱（allow-scripts，无 allow-same-origin）把文档剥成
   * opaque origin——srcdoc 与跨源 src 皆然——任何具体 origin 都匹配不上；身份由双向
   * event.source 校验兜住。将来 OPFS 阶段沙箱放宽后可改锁具体 origin（接缝）。 */
  const pingRuntime = () => {
    iframeRef.current?.contentWindow?.postMessage({ v: PROTOCOL_VERSION, type: 'ping' }, '*')
  }

  useEffect(() => {
    pingRuntime()
    // 宿主侧收包：先对来源（只认当前 iframe），再对结构（isRuntimeMessage），其余丢弃。
    // targetOrigin 校验在发送侧做不了（srcdoc 文档是 opaque origin，"null" 不是合法
    // 匹配值），身份由「谁被装进这个 iframe」＋ event.source 反向锁定。
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (!isRuntimeMessage(event.data)) return
      const msg = event.data
      if (msg.type === 'ready') {
        setStatus({ origin: msg.origin, parentBlocked: msg.parentBlocked })
        // 防线（为沙箱放宽后的 OPFS 阶段预备）：上报 origin 一旦等于宿主源即亮红。
        // 当前沙箱下文档 origin 恒为 "null"（opaque），不会触发；真实源出现之日
        // （独立源 + allow-same-origin）它就是同源击穿的最后一道报警。
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

  const run = () => {
    setLines([])
    setDone(false)
    setSameOriginAlert(false)
    iframeRef.current?.contentWindow?.postMessage(
      { v: PROTOCOL_VERSION, type: 'run', code },
      // '*' 的理由同 pingRuntime：沙箱文档是 opaque origin，具体 target 匹配不上
      '*',
    )
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

      {/* 编辑器：textarea 起步（后续接缝：CodeMirror 等真编辑器，只换这一块） */}
      <textarea
        aria-label="模块代码"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={12}
        className="w-full resize-y rounded-xl border-2 border-ink bg-paper p-3 font-mono text-[13px] leading-relaxed text-ink outline-none focus:bg-white"
      />

      <div className="mt-2.5 flex items-center gap-3">
        <ShadowButton tone="clash1a" onClick={run}>
          运行 ▶
        </ShadowButton>
        <span className="t-small-mute">代码作为 ESM 模块送进沙箱：Blob URL + import()</span>
      </div>

      {/* 输出面板：console 按级别显示；done 后缀一行执行完毕 */}
      <section aria-label="输出" className="mt-4 rounded-xl border-2 border-ink bg-white p-3">
        <h2 className="t-small-strong m-0 mb-2">输出</h2>
        {lines.length === 0 && !done && <p className="t-small-mute m-0">（还没有输出——点「运行」试试）</p>}
        <ul className="m-0 mb-0 list-none p-0">
          {lines.map((l, i) => (
            <li key={i} className="mb-1 flex items-baseline gap-2 font-mono text-[13px] leading-relaxed">
              <span className={`shrink-0 rounded-md px-1.5 text-[11px] font-bold ${LEVEL_STYLE[l.level]}`}>
                {l.level}
              </span>
              <span className="min-w-0 break-all whitespace-pre-wrap text-body">{l.text}</span>
            </li>
          ))}
        </ul>
        {done && <p className="t-small-mute m-0 mt-1">✓ 执行完毕（顶层＋init 已结束）</p>}
      </section>

      {/* 沙箱 iframe：唯一通道 postMessage，视觉退场（0×0）但脚本照常执行。
        * sandbox 只有 allow-scripts——加任何一个 allow-*（尤其 allow-same-origin）都是击穿。 */}
      <iframe
        ref={iframeRef}
        title="playground 沙箱运行时"
        sandbox="allow-scripts"
        src={RUNTIME_ORIGIN ? `${RUNTIME_ORIGIN.replace(/\/$/, '')}/` : undefined}
        srcDoc={RUNTIME_ORIGIN ? undefined : runtimeHtml}
        onLoad={pingRuntime}
        className="border-0"
        style={{ width: 0, height: 0 }}
        data-testid="sandbox-frame"
      />
    </div>
  )
}
