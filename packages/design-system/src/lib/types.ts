


export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6


export interface Target {
  
  goal: string
  
  expectation: string
  
  bricks: { name: string; learned: boolean }[]
}


export interface Chapter {
  id: ChapterId
  title: string
  emoji: string
  color: string 
  target: Target
  
  gifUrl?: string
}


export type EdgeKind = 'seq' | 'rel' | 'family'


export interface Edge {
  from: ChapterId
  to: ChapterId
  kind: EdgeKind
}


export interface Profile {
  icon: string
  name: string
  entry: ChapterId 
  path: ChapterId[]
  note: string
}
