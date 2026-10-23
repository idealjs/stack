import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild-wasm'
import type { Plugin } from 'vite'

const here = fileURLToPath(new URL('.', import.meta.url))
const RUNTIME_HTML = resolve(here, 'index.html')
const RUNTIME_MAIN = resolve(here, 'runtime/main.ts')
const SCRIPT_TAG = /<script[^>]*src="[^"]*main\.ts"[^>]*>\s*<\/script>/

export const WEB_RUNNER_DOC = 'virtual:web-runner-doc'

export async function composeRuntimeDoc(): Promise<string> {
  const out = await esbuild.build({
    entryPoints: [RUNTIME_MAIN],
    bundle: true,
    write: false,
    format: 'esm',
  })
  const code = out.outputFiles[0].text.replace(/<\/script>/g, '<\\/script>')
  return readFileSync(RUNTIME_HTML, 'utf8').replace(
    SCRIPT_TAG,
    `<script type="module">\n${code}\n</script>`,
  )
}

export function webRunnerDoc(): Plugin {
  return {
    name: 'web-runner-doc',
    resolveId(id) {
      if (id === WEB_RUNNER_DOC) return `\0${WEB_RUNNER_DOC}`
    },
    async load(id) {
      if (id !== `\0${WEB_RUNNER_DOC}`) return
      return `export default ${JSON.stringify(await composeRuntimeDoc())}`
    },
  }
}

export function runtimeDocCache() {
  let cacheAt = 0
  let cacheDoc = ''
  return async () => {
    const at = Math.max(statSync(RUNTIME_HTML).mtimeMs, statSync(RUNTIME_MAIN).mtimeMs)
    if (at === cacheAt) return cacheDoc
    cacheDoc = await composeRuntimeDoc()
    cacheAt = at
    return cacheDoc
  }
}
