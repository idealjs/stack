import { test, expect } from '@playwright/test'

const CONFIG_TAB = 'esbuild.config.json'

function configTab(page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: CONFIG_TAB, exact: true })
}

test('配置文件预览与编辑：进文件栏、可切换、改动切换后保留', async ({ page }) => {
  await page.goto('/practice.html')
  await expect(configTab(page)).toBeVisible()
  await configTab(page).click()
  const editor = page.getByLabel('模块代码')
  await expect(editor).toHaveValue(/"entry": "main\.ts"/)
  await editor.fill('{\n  "entry": "main.ts",\n  "minify": true\n}\n')
  await page.getByRole('button', { name: 'main.ts', exact: true }).click()
  await configTab(page).click()
  await expect(page.getByLabel('模块代码')).toHaveValue(
    '{\n  "entry": "main.ts",\n  "minify": true\n}\n',
  )
})

test('配置生效：define 注入被构建加载，输出回传注入值', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: 'main.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill('console.log(GREETING)\n')
  await configTab(page).click()
  await page
    .getByLabel('模块代码')
    .fill('{\n  "define": { "GREETING": "\\"hello from config\\"" }\n}\n')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello from config', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
})

test('非法配置：构建错误显示，不进入执行', async ({ page }) => {
  await page.goto('/practice.html')
  await configTab(page).click()
  await page.getByLabel('模块代码').fill('{ oops\n')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('构建')
  await expect(out).toContainText('不是合法 JSON')
  await expect(out).not.toContainText('✓ 执行完毕')
})

test('配置校验：白名单外字段与不存在的入口被拒', async ({ page }) => {
  await page.goto('/practice.html')
  await configTab(page).click()
  const editor = page.getByLabel('模块代码')
  const out = page.getByRole('region', { name: '输出' })
  const run = page.getByRole('button', { name: '运行 ▶' })

  await editor.fill('{\n  "entryPoint": "main.ts"\n}\n')
  await run.click()
  await expect(out).toContainText('配置字段白名单')

  await editor.fill('{\n  "entry": "nope.ts"\n}\n')
  await run.click()
  await expect(out).toContainText('入口文件不存在：nope.ts')
})
