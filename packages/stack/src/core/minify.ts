import { transform } from 'esbuild-wasm'
import type { EmittedOutput, StackPlugin } from './plugin.ts'

export interface MinifyOptions {
  from?: string
  name?: string
  dir: string
}

export function minify(options: MinifyOptions): StackPlugin {
  const from = options.from ?? 'default'
  const name = options.name ?? 'min'
  if (options.dir === undefined) throw new Error('[stack] minify 插件需要 dir 指定产物目录')
  return {
    name: `minify:${name}`,
    async buildEnd(ctx) {
      const source = ctx.outputs.find((output: EmittedOutput) => output.name === from)
      if (source === undefined) {
        const known = ctx.outputs.map((output: EmittedOutput) => output.name).join('、') || '（无）'
        throw new Error(
          `[stack] minify 插件找不到来源产出 "${from}"，现有产出：${known}——产出只对声明顺序在后的插件可见，请检查插件声明顺序`,
        )
      }
      const files = []
      for (const file of source.files) {
        if (!file.path.endsWith('.js')) {
          files.push(file)
          continue
        }
        const result = await transform(file.code, {
          loader: 'js',
          format: 'esm',
          target: 'esnext',
          minify: true,
        })
        files.push({ path: file.path, code: result.code })
      }
      ctx.output({ name, dir: options.dir, files })
    },
  }
}
