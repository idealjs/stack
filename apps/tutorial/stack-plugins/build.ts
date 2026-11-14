import { statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { dirname, join } from 'node:path'
import type { StackHook, WatchHook } from '@idealjs/stack'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'

export interface TutorialBuildOptions {
  root: string
}

const TOKENS_PATH = 'src/design-system/styles/tokens.css'

export function tutorialBuild(options: TutorialBuildOptions): StackHook {
  const hook: WatchHook = {
    name: 'tutorial-build',
    watch: ['default'],
    lower: async (ctx, watched) => {
      const files = watched.files.map((file) => ({ ...file }))
      const byPath = new Map(files.map((file) => [file.path, file]))
      await compileTailwind(byPath, options.root)
      ctx.output({ name: 'tutorial-build', dir: watched.dir, files })
    },
  }
  return hook
}

const compileTailwind = async (
  byPath: Map<string, { path: string; code: string }>,
  root: string,
): Promise<void> => {
  const target = byPath.get(TOKENS_PATH)
  if (target === undefined) {
    throw new Error(`[tutorial-build] 产出里找不到 ${TOKENS_PATH}——html 需以 link 引入 tokens.css`)
  }
  const tokensPath = join(root, TOKENS_PATH)
  const raw = await readFile(tokensPath, 'utf8')
  const compiler = await compile(raw, {
    base: dirname(tokensPath),
    onDependency: () => {},
  })
  const sources =
    compiler.root === 'none'
      ? []
      : compiler.root === null
        ? [{ base: root, pattern: '**/*', negated: false }]
        : [{ base: compiler.root.base, pattern: compiler.root.pattern, negated: false }]
  const scanner = new Scanner({
    sources: [...sources, ...compiler.sources].filter((source) => {
      try {
        return statSync(source.base).isDirectory()
      } catch {
        return false
      }
    }),
  })
  const candidates = new Set(scanner.scan())
  target.code = compiler.build([...candidates])
}
