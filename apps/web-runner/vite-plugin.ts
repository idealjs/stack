import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild-wasm'
import type { Plugin } from 'vite'

const here = fileURLToPath(new URL('.', import.meta.url))
const RUNTIME_HTML = resolve(here, 'index.html')
const RUNTIME_MAIN = resolve(here, 'runtime/main.ts')
const DOC_SCRIPT = '<script type="module" src="./runtime/main.ts"></script>'

export const WEB_RUNNER_DOC = 'virtual:web-runner-doc'

export async function composeRuntimeDoc(): Promise<string> {
  const out = await esbuild.build({
    entryPoints: [RUNTIME_MAIN],
    bundle: true,
    write: false,
    format: 'esm',
  })
  const code = out.outputFiles[0].text.replace(/<\/script>/g, '<\\/script>')
  const html = readFileSync(RUNTIME_HTML, 'utf8')
  if (!html.includes(DOC_SCRIPT)) {
    throw new Error(`index.html 缺少入口标签：${DOC_SCRIPT}`)
  }
  return html.replace(DOC_SCRIPT, `<script type="module">\n${code}\n</script>`)
}

export const webRunnerDoc: Plugin = {
  name: 'web-runner-doc',
  resolveId(id) {
    if (id === WEB_RUNNER_DOC) return `\0${WEB_RUNNER_DOC}`
  },
  async load(id) {
    if (id !== `\0${WEB_RUNNER_DOC}`) return
    return `export default ${JSON.stringify(await composeRuntimeDoc())}`
  },
}
