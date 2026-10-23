import assert from 'node:assert/strict'
import test from 'node:test'
import { parseModuleImports } from '../src/core/parse.ts'

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
