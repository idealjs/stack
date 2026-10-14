/** 终端面板——xterm 渲染 WebContainer 的输出流水（install / dev / agent 命令共用）。
 * 只出不进：交互都由用户对 agent 说话完成，符合「用户验收、agent 过程」的练习定位。
 * xterm 是 CJS 包，SSG 的 ssrLoadModule 吃不下具名导出——动态 import 延迟到浏览器。 */
import { useEffect, useRef } from 'react'
import '@xterm/xterm/css/xterm.css'
import type { OutputSink } from '../lib/webcontainer'

export function TerminalPanel({
  sinkRef,
  logRef,
}: {
  sinkRef: { current: OutputSink | null }
  /** 挂载前的历史输出，整段回放后接入实时流 */
  logRef: { current: string[] }
}) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let dispose = () => {}
    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ])
      if (disposed || !elRef.current) return
      const term = new Terminal({
        convertEol: true,
        disableStdin: true,
        fontSize: 12,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        theme: { background: '#111111', foreground: '#fff9f0', cursor: '#4ecdc4' },
      })
      const fit = new FitAddon()
      term.loadAddon(fit)
      term.open(elRef.current)
      for (const chunk of logRef.current) term.write(chunk)
      fit.fit()
      sinkRef.current = (chunk) => term.write(chunk)

      const ro = new ResizeObserver(() => fit.fit())
      ro.observe(elRef.current)
      dispose = () => {
        sinkRef.current = null
        ro.disconnect()
        term.dispose()
      }
    })()
    return () => {
      disposed = true
      dispose()
    }
  }, [sinkRef, logRef])

  return <div ref={elRef} className="h-full w-full bg-ink" />
}
