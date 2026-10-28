import { expect, test } from '@playwright/test'
import { SCENARIOS } from '../test/scenarios.ts'

test('浏览器内跑通全部内存 FS 场景', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(String(error)))

  await page.goto('/')
  await page.waitForFunction(() => {
    const flag = (window as unknown as { __stackBrowserTestsDone?: boolean })
      .__stackBrowserTestsDone
    return flag === true
  })

  await expect(page.locator('body')).toHaveAttribute('data-state', 'passed')
  await expect(page.locator('#cases > li')).toHaveCount(SCENARIOS.length)
  await expect(page.locator('li[data-failed="true"]')).toHaveCount(0)
  expect(consoleErrors).toEqual([])
})

test('页面用例清单与共享场景单一事实源一一对应', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => {
    const flag = (window as unknown as { __stackBrowserTestsDone?: boolean })
      .__stackBrowserTestsDone
    return flag === true
  })
  const items = page.locator('#cases > li')
  await expect(items).toHaveCount(SCENARIOS.length)
  for (let index = 0; index < SCENARIOS.length; index += 1) {
    await expect(items.nth(index)).toContainText(SCENARIOS[index].name)
  }
})
