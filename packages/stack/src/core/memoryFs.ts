import type { StackFs } from './config.ts'
import { normalizePath } from './pathUtil.ts'

export function memoryFs(files: Record<string, string> = {}): StackFs {
  const store = new Map(Object.entries(files))
  return {
    async readFile(path: string) {
      const content = store.get(normalizePath(path))
      if (content === undefined) throw new Error(`[stack] memoryFs 找不到文件：${path}`)
      return content
    },
    async writeFile(path: string, content: string) {
      store.set(normalizePath(path), content)
    },
  }
}
