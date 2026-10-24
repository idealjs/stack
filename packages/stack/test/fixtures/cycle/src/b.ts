import { fromA } from './a'

export const describeA = (): string => typeof fromA
export const fromB = (x: string): string => `[b:${x}]`
