import { fileURLToPath } from 'node:url'
import type { Artifact, StackHook } from '@idealjs/stack'
import * as esbuild from 'esbuild-wasm'

const RUNTIME_TAG = '<script type="module" src="./runtime/main.ts"></script>'

const SDK_ENTRY = fileURLToPath(new URL('./runtime/sdk-entry.ts', import.meta.url))

const escapeScript = (code: string): string => code.replace(/<\/script>/g, '<\\/script>')

export const sdkEmbed = (options: { tag?: string } = {}): StackHook => {
  const tag = options.tag ?? RUNTIME_TAG
  let cached: Promise<string> | null = null
  const bundleSdk = (): Promise<string> => {
    cached ??= esbuild
      .build({
        entryPoints: [SDK_ENTRY],
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'browser',
        minify: true,
        logLevel: 'silent',
      })
      .then((result) => result.outputFiles[0].text)
      .catch((error: unknown) => {
        cached = null
        throw error
      })
    return cached
  }
  return {
    name: 'sdk-embed',
    lower: async (id, artifacts) => {
      const next: Artifact[] = []
      let embedded = false
      for (const artifact of artifacts) {
        if (!artifact.code.includes(tag)) {
          next.push(artifact)
          continue
        }
        const sdk = await bundleSdk()
        next.push({
          ...artifact,
          code: artifact.code.replace(
            tag,
            () => `<script type="module">\n${escapeScript(sdk)}\n</script>\n${tag}`,
          ),
        })
        embedded = true
      }
      if (!embedded && id.endsWith('index.html')) {
        throw new Error(`[stack] sdk-embed：index.html 缺少 runtime 入口标签：${tag}（id=${id}）`)
      }
      return next
    },
  }
}
