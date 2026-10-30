import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const examplesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples')
const require = createRequire(import.meta.url)
const playwrightCli = join(dirname(require.resolve('playwright/package.json')), 'cli.js')

const fixtures = readdirSync(examplesRoot)
  .sort()
  .filter((name) => existsSync(join(examplesRoot, name, 'playwright.config.ts')))

if (fixtures.length === 0) {
  console.error('examples/ 下没有发现任何 playwright.config.ts 夹具')
  process.exit(1)
}

for (const name of fixtures) {
  console.log(`\n=== examples/${name} ===`)
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', '--config', join(examplesRoot, name, 'playwright.config.ts')],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) process.exit(result.status ?? 1)
}
