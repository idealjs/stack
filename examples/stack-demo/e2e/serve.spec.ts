import { expect, test } from '@playwright/test'

test('html 输入经构建重写后从产物目录伺服', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(String(error)))

  await page.goto('/pages/index.html')
  await expect(page.locator('h1')).toHaveText('stack-demo')
  const css = await page.request.get('/site.css')
  expect(css.ok()).toBe(true)
  expect(consoleErrors).toEqual([])
})

test('alias 与相对路径模块图在浏览器内执行', async ({ page }) => {
  const logs: string[] = []
  page.on('console', (message) => logs.push(message.text()))

  await page.goto('/pages/index.html')
  await expect
    .poll(() => logs.some((text) => text.includes('[stack-demo/preserve-ESM]')))
    .toBe(true)
  await expect.poll(() => logs.some((text) => text.includes('INPUTS:2 | OUTPUTS:3'))).toBe(true)
})
