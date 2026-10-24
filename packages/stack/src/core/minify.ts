import { transform } from 'esbuild-wasm'
import type { StackHook, WatchHook } from './hooks.ts'

export interface MinifyOptions {
  from?: string
  name?: string
  dir: string
}

export function minify(options: MinifyOptions): StackHook {
  const from = options.from ?? 'default'
  const name = options.name ?? 'min'
  if (options.dir === undefined) throw new Error('[stack] minify 插件需要 dir 指定产物目录')
  const hook: WatchHook = {
    name: `minify:${name}`,
    watch: [from],
    async lower(ctx, output) {
      const files = []
      for (const file of output.files) {
        if (file.path.endsWith('.js')) {
          const result = await transform(file.code, {
            loader: 'js',
            format: 'esm',
            target: 'esnext',
            minify: true,
          })
          files.push({ path: file.path, code: result.code })
          continue
        }
        if (file.path.endsWith('.css')) {
          const result = await transform(file.code, {
            loader: 'css',
            minify: true,
          })
          files.push({ path: file.path, code: result.code })
          continue
        }
        files.push(file)
      }
      ctx.output({ name, dir: options.dir, files })
    },
  }
  return hook
}
