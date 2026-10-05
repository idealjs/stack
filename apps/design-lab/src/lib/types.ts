/** 设计系统数据类型——对齐 ai-era-tutorial 词汇表 */

/** 章程序号（票号＝章程序号） */
export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6

/** 卡头三件套之一：靶子 = ▲目标 + ○预期结果 + ●积木清单 */
export interface Target {
  /** ▲ 目标：这一章做成什么（一句话） */
  goal: string
  /** ○ 预期结果：做成长什么样、怎么核对（GIF 的 alt） */
  expectation: string
  /** ● 积木清单：要用到的零件——只列用到的；实心数 = 已学 */
  bricks: { name: string; learned: boolean }[]
}

/** 章节数据（MemphisCard / Ticket 共用） */
export interface Chapter {
  id: ChapterId
  title: string
  emoji: string
  color: string // 章节色（只进 16:9 相框与图标瓦）
  target: Target
  /** 预期结果 GIF（16:9 无声循环）；缺省用静态占位 */
  gifUrl?: string
}

/** 关系边——线形即含义 */
export type EdgeKind = 'seq' | 'rel' | 'family'
/** seq 实线＝先后（唯一带站点）；rel 虚线＝相关；family 点线＝同族 */

export interface Edge {
  from: ChapterId
  to: ChapterId
  kind: EdgeKind
}

/** 入口画像（推荐路径，非强制——无锁） */
export interface Profile {
  icon: string
  name: string
  entry: ChapterId // ①②③ 推荐起点
  path: ChapterId[]
  note: string
}

/** 指派学习块三样：位置给坐标、预期当尺子、场景管巩固 */
export interface Assignment {
  title: string
  pos: string
  expect: string
  scenes: string[]
  /** 脱靶标记：可能性 + 长相（撞上时认出缺哪块） */
  miss: { how: string; looks: string }
}
