import assert from 'node:assert/strict'
import test from 'node:test'
import { imports } from '../src/builtins.ts'
import { memoryFs } from '../src/core/memoryFs.ts'
import { type BuildResult, build } from '../src/index.ts'

const pkgJsonOf = (json: Record<string, unknown>): string => JSON.stringify(json)

const codeOf = (result: BuildResult, path: string): string => {
  const output = result.outputs.find((candidate) => candidate.name === 'default')
  assert.ok(output !== undefined, 'missing default output')
  const file = output.files.find((candidate) => candidate.path === path)
  assert.ok(
    file !== undefined,
    `missing output file ${path} (existing: ${output.files.map((f) => f.path).join(', ')})`,
  )
  return file.code
}

test('config.alias prefix rewrite goes through the plugin: boundary-safe, unmatched alias stays external', async () => {
  const files: Record<string, string> = {
    'src/app.ts': [
      `import { info } from '@/info'`,
      `import { thing } from '@utils/thing'`,
      `import { extra } from '@utils-extra/pkg'`,
      `export const all = [info, thing, extra]`,
    ].join('\n'),
    'src/info.ts': `export const info = 'info'`,
    'src/utils/thing.ts': `export const thing = 'thing'`,
  }
  const result = await build({
    inputs: [{ name: 'app', path: 'src/app.ts' }],
    alias: { '@/': 'src/', '@utils': 'src/utils' },
    fs: memoryFs(files),
    hooks: [imports()],
  })
  assert.equal(result.moduleCount, 3)
  const app = codeOf(result, 'app.js')
  assert.match(app, /from "\.\/info\.js"/)
  assert.match(app, /from "\.\/utils\/thing\.js"/)
  assert.match(app, /from "@utils-extra\/pkg"/)
})

test('tsconfig paths: maps without config.alias, anchored at the project root', async () => {
  const files: Record<string, string> = {
    'src/app.ts': `import { info } from '@/info'\nimport { inner } from '@/nested/inner'\nexport const all = [info, inner]`,
    'src/info.ts': `export const info = 'info'`,
    'src/nested/inner.ts': `export const inner = 'inner'`,
    'tsconfig.json': pkgJsonOf({
      compilerOptions: { paths: { '@/*': ['./src/*'] } },
    }),
  }
  const result = await build({
    inputs: [{ name: 'app', path: 'src/app.ts' }],
    fs: memoryFs(files),
    hooks: [imports()],
  })
  assert.equal(result.moduleCount, 3)
  const app = codeOf(result, 'app.js')
  assert.match(app, /from "\.\/info\.js"/)
  assert.match(app, /from "\.\/nested\/inner\.js"/)
})

test('tsconfig with comments and trailing commas parses as JSONC, paths still work', async () => {
  const files: Record<string, string> = {
    'src/app.ts': `import { info } from '@/info'\nexport const all = [info]`,
    'src/info.ts': `export const info = 'info'`,
    'tsconfig.json': [
      `{`,
      `  // editor experience only, compilation does not read this`,
      `  "compilerOptions": {`,
      `    "paths": { "@/*": ["./src/*"] },`,
      `  }`,
      `}`,
    ].join('\n'),
  }
  const result = await build({
    inputs: [{ name: 'app', path: 'src/app.ts' }],
    fs: memoryFs(files),
    hooks: [imports()],
  })
  assert.equal(result.moduleCount, 2)
  assert.match(codeOf(result, 'app.js'), /from "\.\/info\.js"/)
})

test('alias target as package name re-dispatches the chain: react lands on preact, boundary does not swallow react-dom', async () => {
  const files: Record<string, string> = {
    'src/app.ts': [
      `import { render } from 'react'`,
      `import { dom } from 'react-dom'`,
      `export const all = [render, dom]`,
    ].join('\n'),
    'node_modules/preact/package.json': pkgJsonOf({ name: 'preact', main: './preact.js' }),
    'node_modules/preact/preact.js': `export const render = 'preact-render'`,
  }
  const result = await build({
    inputs: [{ name: 'app', path: 'src/app.ts' }],
    alias: { react: 'preact' },
    fs: memoryFs(files),
    hooks: [imports()],
  })
  assert.equal(result.moduleCount, 2)
  const app = codeOf(result, 'app.js')
  assert.match(app, /from "\.\/__shared\/preact\.js"/)
  assert.match(app, /from "react-dom"/)
  assert.match(codeOf(result, '__shared/preact.js'), /preact-render/)
})

test('alias hit but target unresolvable: throws loudly instead of silently externalizing', async () => {
  const files: Record<string, string> = {
    'src/app.ts': `import { gone } from '@/missing'\nexport const all = [gone]`,
    'src/info.ts': `export const info = 'info'`,
  }
  await assert.rejects(
    build({
      inputs: [{ name: 'app', path: 'src/app.ts' }],
      alias: { '@/': 'src/' },
      fs: memoryFs(files),
      hooks: [imports()],
    }),
    /cannot resolve import "@\/missing"/,
  )
})

test('bare specifier root fallback: project-root-relative paths are owned by the relative plugin', async () => {
  const files: Record<string, string> = {
    'src/app.ts': `import { label } from 'src/label'\nexport const all = [label]`,
    'src/label.ts': `export const label = 'page'`,
  }
  const result = await build({
    inputs: [{ name: 'app', path: 'src/app.ts' }],
    fs: memoryFs(files),
    hooks: [imports()],
  })
  assert.equal(result.moduleCount, 2)
  assert.match(codeOf(result, 'app.js'), /from "\.\/label\.js"/)
})
