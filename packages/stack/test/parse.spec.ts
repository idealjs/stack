import assert from 'node:assert/strict'
import test from 'node:test'
import { parseModuleImports } from '../src/core/parse.ts'
import { parseHtmlAssets } from '../src/core/parseHtml.ts'

const sourcesOf = (code: string): string[] => parseModuleImports(code).map((entry) => entry.source)

test('collects static import and re-export sources', () => {
  const code = [
    "import defaultExport from './a'",
    "import { named } from '../b.ts'",
    "import 'side-effect'",
    "export { reexported } from './c'",
    "export * from './d'",
    'export const local = 1',
  ].join('\n')
  assert.deepEqual(sourcesOf(code), ['./a', '../b.ts', 'side-effect', './c', './d'])
})

test('collects dynamic import string literals at any depth', () => {
  const code = [
    'const loadLazy = () => import("./lazy")',
    'async function main() {',
    '  const late = await import("./late")',
    '  return [loadLazy, late]',
    '}',
  ].join('\n')
  assert.deepEqual(sourcesOf(code), ['./lazy', './late'])
})

test('ignores non-literal dynamic imports', () => {
  const code = [
    "const name = './variable'",
    'const viaVariable = import(name)',
    'const viaTemplate = import(`./template`)',
  ].join('\n')
  assert.deepEqual(sourcesOf(code), [])
})

test('exposes literal ranges so callers can splice specifiers', () => {
  const code = 'import value from "./rewrite-me"\n'
  const [first] = parseModuleImports(code)
  assert.equal(code.slice(first.start, first.end), '"./rewrite-me"')
})

test('parseHtmlAssets 收集 script[src] 与 link[stylesheet][href] 并给出属性值区间', () => {
  const html = [
    '<head>',
    '  <link rel="stylesheet" href="./theme/site.css" />',
    '  <script type="module" src=\'./entry/main\'></script>',
    '</head>',
  ].join('\n')
  const assets = parseHtmlAssets(html)
  assert.deepEqual(
    assets.map((asset) => [asset.kind, asset.specifier]),
    [
      ['stylesheet', './theme/site.css'],
      ['script', './entry/main'],
    ],
  )
  for (const asset of assets) {
    assert.equal(html.slice(asset.start, asset.end), asset.specifier)
  }
})

test('parseHtmlAssets 只认 rel=stylesheet，忽略 preload 与内联 script', () => {
  const html = [
    '<link rel="preload" href="./font.woff2" as="font" />',
    '<link REL="STYLESHEET" HREF="./late.css">',
    '<script>console.log("./inline.ts")</script>',
    '<script defer src=unquoted.ts></script>',
  ].join('\n')
  const assets = parseHtmlAssets(html)
  assert.deepEqual(
    assets.map((asset) => [asset.kind, asset.specifier]),
    [
      ['stylesheet', './late.css'],
      ['script', 'unquoted.ts'],
    ],
  )
})
