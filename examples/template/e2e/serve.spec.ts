import { expect, test } from '@playwright/test'

test('构建产物伺服出渲染完成的模板页', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(String(error)))

  await page.goto('/')
  await expect(page.locator('#app')).toHaveText('hello, template')
  expect(consoleErrors).toEqual([])
})
