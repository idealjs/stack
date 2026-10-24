import { fromB } from './b'

export const fromA = (x: string): string => `[a:${fromB(x)}]`
