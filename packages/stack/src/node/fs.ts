import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { StackFs } from '../core/config.ts'

export function nodeFs(): StackFs {
  return {
    async readFile(path: string) {
      return readFile(path, 'utf8')
    },
    async writeFile(path: string, content: string) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content, 'utf8')
    },
  }
}
