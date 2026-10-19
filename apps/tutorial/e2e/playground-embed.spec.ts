// Playground 沙箱嵌入契约（教程站 practice 页承载 @stack/playground 宿主组件后，
// 自已删除的 apps/playground 独立 e2e 契约收敛至此）——只测跨源路：e2e 构建/预览
// 以 VITE_PLAYGROUND_RUNTIME_ORIGIN 指向独立源运行时（dev 5174 / 生产另一域名）。
// 安全模型四条：恰 allow-scripts；跨源隔离自证（opaque + 父窗口阻断）；hello world
// 经 Blob URL + import() 执行并回传；异常经 error 消息回传。
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
  await expect(status).toContainText(`运行时源：${RUNTIME_ORIGIN}（独立源部署）`, { timeout: 10_000 })
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
  await page.getByLabel('模块代码').fill(
    `export default {\n  init() {\n    throw new Error('boom from sandbox')\n  },\n}\n`,
  )
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('Error: boom from sandbox', { timeout: 10_000 })
})
