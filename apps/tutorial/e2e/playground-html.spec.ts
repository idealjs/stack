import { test, expect } from '@playwright/test'

test('回归守卫：去掉 html 字段即 console 模式，沙箱 iframe 保持不可见', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: 'esbuild.config.json', exact: true }).click()
  await page.getByLabel('模块代码').fill('{\n  "entry": "main.ts"\n}\n')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello, template', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
  const frame = page.locator('[data-testid="sandbox-frame"]')
  const box = await frame.boundingBox()
  expect(box ? box.height : 0).toBe(0)
})

test('ch7 实验室：template 跑起来，预览框可见且 #app 渲染', async ({ page }) => {
  await page.goto('/ch7.html')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello, template', { timeout: 30_000 })
  await expect(out).toContainText('✓ 执行完毕')

  const frame = page.locator('[data-testid="sandbox-frame"]')
  await expect(frame).toBeVisible()
  const box = await frame.boundingBox()
  expect(box ? box.height : 0).toBeGreaterThan(100)
  await expect(frame.contentFrame().getByText('hello, template')).toBeVisible()
})

test('html 配置校验：入口文档不存在则构建报错、不执行、不出预览', async ({ page }) => {
  await page.goto('/ch7.html')
  await page.getByRole('button', { name: 'esbuild.config.json', exact: true }).click()
  await page.getByLabel('模块代码').fill('{\n  "entry": "main.ts",\n  "html": "nope.html"\n}\n')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('入口文档不存在：nope.html')
  await expect(out).not.toContainText('✓ 执行完毕')
  await expect(page.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
})
