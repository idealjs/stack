import { transform } from 'esbuild-wasm'
import type { StackPlugin } from './plugin.ts'

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
      const source = ctx.requireOutput(from)
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
