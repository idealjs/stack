/** Playground 宿主 ↔ 运行时消息协议（v1，唯一权威定义处）。
 *
 * 通道约束（安全模型，见 Playground.tsx 头注释）：宿主页与沙箱 iframe 之间唯一允许的
 * 通信方式是 postMessage；所有消息显式构造并携带协议版本字段 v，宿主对收到的每条消息做
 * 来源校验（event.source 对上当前 iframe）与结构校验（本文件的 isRuntimeMessage），
 * 不认识的一律丢弃。
 *
 * 运行时侧（playground-runtime/index.html）是零依赖内联脚本，按本文件手工镜像实现同一
 * 协议——它要同时服务「跨源 serve」与「srcdoc 注入」两条路，不能 import 宿主模块；若后续
 * 阶段协议变复杂，改为打包时共享同一份协议源码。 */

export const PROTOCOL_VERSION = 1

/** 宿主 → 运行时：索要一次 ready 报到。运行时文档加载与宿主监听器挂载是并发的，
 * 自发的 ready 可能先于宿主 addEventListener 落地而丢失——宿主在 iframe onLoad 与
 * 挂载后各发一次 ping，运行时凡收到即补发 ready，把启动竞态变成确定性问答。 */
export interface PingMessage {
  v: typeof PROTOCOL_VERSION
  type: 'ping'
}

/** 宿主 → 运行时：送一段代码进沙箱按 ESM 执行 */
export interface RunMessage {
  v: typeof PROTOCOL_VERSION
  type: 'run'
  code: string
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'

/** 运行时 → 宿主：报到（带隔离生效的自证） */
export interface ReadyMessage {
  v: typeof PROTOCOL_VERSION
  type: 'ready'
  /** 运行时文档的 location.origin 序列化：srcdoc 路是 "null"；跨源 src 路是部署位 URL
   * （如 http://localhost:5174）。注意它只是部署位标识、不是「存储可用」证明——
   * allow-scripts 沙箱（无 allow-same-origin）下文档 origin 对存储仍按 opaque 处理，
   * OPFS 照样被拒（实测 getDirectory() 抛 SecurityError）；真实可用源要等 OPFS 阶段
   * 沙箱放宽（独立源 + allow-same-origin）。宿主另用它做同源击穿报警（等于宿主源即亮红） */
  origin: string
  /** 运行时读 parent.location.href 抛 SecurityError 的自证：沙箱拿不到宿主任何数据的直接证据 */
  parentBlocked: boolean
}

/** 运行时 → 宿主：一条 console 输出（运行时侧已序列化成单行文本） */
export interface ConsoleMessage {
  v: typeof PROTOCOL_VERSION
  type: 'console'
  level: ConsoleLevel
  text: string
}

/** 运行时 → 宿主：未捕获异常 / import 失败 / init 抛错 */
export interface ErrorMessage {
  v: typeof PROTOCOL_VERSION
  type: 'error'
  text: string
}

/** 运行时 → 宿主：本轮代码执行完毕（顶层 + init 都已结束） */
export interface DoneMessage {
  v: typeof PROTOCOL_VERSION
  type: 'done'
}

export type RuntimeMessage = ReadyMessage | ConsoleMessage | ErrorMessage | DoneMessage

const CONSOLE_LEVELS: readonly ConsoleLevel[] = ['log', 'info', 'warn', 'error']

/** 结构校验：认识且字段齐全才放行，否则宿主丢弃。 */
export function isRuntimeMessage(data: unknown): data is RuntimeMessage {
  if (typeof data !== 'object' || data === null) return false
  const m = data as Record<string, unknown>
  if (m.v !== PROTOCOL_VERSION) return false
  switch (m.type) {
    case 'ready':
      return typeof m.origin === 'string' && typeof m.parentBlocked === 'boolean'
    case 'console':
      return (
        typeof m.level === 'string' &&
        (CONSOLE_LEVELS as readonly string[]).includes(m.level) &&
        typeof m.text === 'string'
      )
    case 'error':
      return typeof m.text === 'string'
    case 'done':
      return true
    default:
      return false
  }
}
