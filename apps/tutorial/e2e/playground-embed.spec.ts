import { test, expect } from '@playwright/test'

const RUNTIME_ORIGIN = 'http://localhost:5174'

test('iframe 恰为 allow-scripts，src 指向独立源运行时', async ({ page }) => {
  await page.goto('/practice.html')
  const frame = page.locator('[data-testid="sandbox-frame"]')
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts')
  await expect(frame).toHaveAttribute('src', `${RUNTIME_ORIGIN}/`)
})

test('握手自证：独立源部署＋父窗口访问已阻断，无隔离异常', async ({ page }) => {
  await page.goto('/practice.html')
  const status = page.locator('[data-testid="runtime-status"]')
  await expect(status).toContainText(`运行时源：${RUNTIME_ORIGIN}（独立源部署）`, {
    timeout: 10_000,
  })
  await expect(status).toContainText('父窗口访问已阻断')
  await expect(status).not.toContainText('隔离异常')
  await expect(status).not.toContainText('隔离失效')
})

test('运行预置示例：输出面板回传 hello, playground 并收尾', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello, playground', { timeout: 10_000 })
  await expect(out).toContainText('✓ 执行完毕')
})

test('异常回传：init 抛错以 error 级别显示', async ({ page }) => {
  await page.goto('/practice.html')
  await page
    .getByLabel('模块代码')
    .fill(`export default {\n  init() {\n    throw new Error('boom from sandbox')\n  },\n}\n`)
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('Error: boom from sandbox', { timeout: 10_000 })
})
