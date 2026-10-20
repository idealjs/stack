import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { renderToString } from 'react-dom/server'

const appDir = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(appDir, 'dist')

const server = await createServer({
  root: appDir,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const pages = readdirSync(appDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))

const failed = []
for (const name of pages) {
  try {
    const mod = await server.ssrLoadModule(`/src/pages/${name}/main.tsx`)
    const html = renderToString(mod.default)
    const file = join(dist, `${name}.html`)
    const template = readFileSync(file, 'utf8')
    if (!template.includes('<div id="root"></div>')) {
      throw new Error('模板缺少 #root 挂载点')
    }
    writeFileSync(file, template.replace('<div id="root"></div>', `<div id="root">${html}</div>`))
    console.log(`SSG ✓ ${name}.html`)
  } catch (e) {
    failed.push(`${name}: ${e.message}`)
  }
}

await server.close()
if (failed.length) {
  console.error(`SSG 失败 ${failed.length}/${pages.length} 页：\n${failed.join('\n')}`)
  process.exit(1)
}
console.log(`SSG 完成：${pages.length} 页全部静态化`)
