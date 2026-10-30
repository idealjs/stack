import assert from 'node:assert/strict'
import test from 'node:test'
import { imports, pkgResolve } from '../src/builtins.ts'
import { memoryFs } from '../src/core/memoryFs.ts'
import { type BuildResult, build, type StackHook } from '../src/index.ts'

const pkgJsonOf = (json: Record<string, unknown>): string => JSON.stringify(json)

const files: Record<string, string> = {
  'src/main.js': [
    `import { dualSide } from 'dual'`,
    `import { which as legacyWhich } from 'legacy'`,
    `import { which as esmWhich } from 'legacy-esm'`,
    `import { which as widgetWhich } from '@scope/widget'`,
    `import { which as exactWhich } from 'subpath/exact'`,
    `import { which as deepWhich } from 'subpath/feat/deep'`,
    `import { which as shimWhich } from 'shimmed'`,
    `export const all = [dualSide, legacyWhich, esmWhich, widgetWhich, exactWhich, deepWhich, shimWhich]`,
  ].join('\n'),
  'src/web/main.js': [`import { dualSide } from 'dual'`, `export const webSide = dualSide`].join(
    '\n',
  ),
  'src/ext.js': `import { which } from 'not-installed'\nexport const extWhich = which`,
  'node_modules/dual/package.json': pkgJsonOf({
    name: 'dual',
    exports: {
      '.': {
        browser: './browser.js',
        node: './node.js',
        production: './prod.js',
        default: './default.js',
      },
    },
  }),
  'node_modules/dual/browser.js': `export const dualSide = 'dual-browser'`,
  'node_modules/dual/node.js': `export const dualSide = 'dual-node'`,
  'node_modules/dual/prod.js': `export const dualSide = 'dual-prod'`,
  'node_modules/dual/default.js': `export const dualSide = 'dual-default'`,
  'node_modules/subpath/package.json': pkgJsonOf({
    name: 'subpath',
    exports: { './exact': './src/exact.js', './feat/*': './src/feat/*.js' },
  }),
  'node_modules/subpath/src/exact.js': `export const which = 'subpath-exact'`,
  'node_modules/subpath/src/feat/deep.js': `export const which = 'subpath-deep'`,
  'node_modules/legacy/package.json': pkgJsonOf({
    name: 'legacy',
    main: './legacy-main.js',
    module: './es/main.js',
    browser: './browser-main.js',
  }),
  'node_modules/legacy/legacy-main.js': `export const which = 'legacy-main'`,
  'node_modules/legacy/es/main.js': `export const which = 'legacy-es'`,
  'node_modules/legacy/browser-main.js': `export const which = 'legacy-browser'`,
  'node_modules/legacy-esm/package.json': pkgJsonOf({
    name: 'legacy-esm',
    main: './cjs-main.js',
    module: './es/main.js',
  }),
  'node_modules/legacy-esm/cjs-main.js': `module.exports = { which: 'legacy-esm-cjs' }`,
  'node_modules/legacy-esm/es/main.js': `export const which = 'legacy-esm-es'`,
  'node_modules/@scope/widget/package.json': pkgJsonOf({
    name: '@scope/widget',
    exports: { '.': './widget.js', './inner': './src/inner.js' },
  }),
  'node_modules/@scope/widget/widget.js': `export const which = 'widget-root'`,
  'node_modules/@scope/widget/src/inner.js': `export const which = 'widget-inner'`,
  'node_modules/shimmed/package.json': pkgJsonOf({
    name: 'shimmed',
    main: './index.js',
    browser: {
      './node-only.js': './browser-only.js',
      fs: './fs-shim.js',
      './drop.js': false,
    },
  }),
  'node_modules/shimmed/index.js': [
    `import { which } from './node-only.js'`,
    `import { which as fsWhich } from 'fs'`,
    `import './drop.js'`,
    `export const merged = [which, fsWhich]`,
  ].join('\n'),
  'node_modules/shimmed/node-only.js': `export const which = 'shimmed-node'`,
  'node_modules/shimmed/browser-only.js': `export const which = 'shimmed-browser'`,
  'node_modules/shimmed/fs-shim.js': `export const which = 'fs-shim'`,
  'node_modules/shimmed/drop.js': `export const which = 'shimmed-drop'`,
}

const buildFiles = async (hooks: StackHook[]): Promise<BuildResult> => {
  return build({
    inputs: [
      { name: 'main', path: './src/main.js' },
      { name: 'web', path: './src/web/main.js' },
      { name: 'ext', path: './src/ext.js' },
    ],
    fs: memoryFs(files),
    hooks,
  })
}

const codeOf = (result: BuildResult, path: string): string => {
  const output = result.outputs.find((candidate) => candidate.name === 'default')
  assert.ok(output !== undefined, '缺少 default 产物')
  const file = output.files.find((candidate) => candidate.path === path)
  assert.ok(
    file !== undefined,
    `缺少产物文件 ${path}（现有：${output.files.map((f) => f.path).join('、')}）`,
  )
  return file.code
}

const codeOfSuffix = (result: BuildResult, suffix: string): string => {
  const output = result.outputs.find((candidate) => candidate.name === 'default')
  assert.ok(output !== undefined, '缺少 default 产物')
  const file = output.files.find(
    (candidate) => candidate.path === suffix || candidate.path.endsWith(`/${suffix}`),
  )
  assert.ok(
    file !== undefined,
    `缺少产物文件 *${suffix}（现有：${output.files.map((f) => f.path).join('、')}）`,
  )
  return file.code
}

test('browser 策略：exports browser 条件、legacy browser/module/main、模式子路径、browser 映射与桩', async () => {
  const result = await buildFiles([imports(), pkgResolve({ platform: 'browser' })])
  const main = codeOf(result, 'main.js')
  assert.match(main, /"[^"]*dual\/browser\.js"/)
  assert.match(main, /"[^"]*legacy\/browser-main\.js"/)
  assert.match(main, /"[^"]*legacy-esm\/es\/main\.js"/)
  assert.match(main, /"[^"]*@scope\/widget\/widget\.js"/)
  assert.match(main, /"[^"]*subpath\/src\/exact\.js"/)
  assert.match(main, /"[^"]*subpath\/src\/feat\/deep\.js"/)
  assert.match(main, /"[^"]*shimmed\/index\.js"/)
  assert.doesNotMatch(main, /node-only\.js/)
  const shimmed = codeOfSuffix(result, 'shimmed/index.js')
  assert.match(shimmed, /from "\.\/browser-only\.js"/)
  assert.match(shimmed, /from "\.\/fs-shim\.js"/)
  assert.match(shimmed, /virtual:pkg-stub:node_modules\/shimmed\/drop\.js/)
  const web = codeOf(result, 'web/main.js')
  assert.match(web, /"[^"]*dual\/browser\.js"/)
  const ext = codeOf(result, 'ext.js')
  assert.match(ext, /from "not-installed"/)
})

test('node 策略：exports node 条件、main 字段回退、browser 映射不生效、缺失包保持 external', async () => {
  const result = await buildFiles([imports(), pkgResolve({ platform: 'node' })])
  const main = codeOf(result, 'main.js')
  assert.match(main, /"[^"]*dual\/node\.js"/)
  assert.match(main, /"[^"]*legacy\/legacy-main\.js"/)
  assert.match(main, /"[^"]*legacy-esm\/cjs-main\.js"/)
  assert.match(main, /"[^"]*@scope\/widget\/widget\.js"/)
  assert.doesNotMatch(main, /browser-main\.js/)
  const shimmed = codeOfSuffix(result, 'shimmed/index.js')
  assert.match(shimmed, /from "\.\/node-only\.js"/)
  assert.match(shimmed, /from "fs"/)
  assert.doesNotMatch(shimmed, /fs-shim/)
  const ext = codeOf(result, 'ext.js')
  assert.match(ext, /from "not-installed"/)
})

test('自定义 conditions 覆盖预设：production 条件命中且 legacy 回退关闭', async () => {
  const result = await buildFiles([
    imports(),
    pkgResolve({ conditions: ['production'], legacyFields: [], browserMap: false }),
  ])
  const main = codeOf(result, 'main.js')
  assert.match(main, /"[^"]*dual\/prod\.js"/)
  const ext = codeOf(result, 'ext.js')
  assert.match(ext, /from "not-installed"/)
})
