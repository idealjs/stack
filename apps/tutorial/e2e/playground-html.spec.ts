import { expect, test } from '@playwright/test'

async function openEditor(page: import('@playwright/test').Page) {
  await page.locator('[data-comp="editor-dock-tab"]').click()
  await expect(page.locator('#editor-dock-panel')).toBeVisible()
}

test('html 身体注入：运行后预览框渲染 #app 文本', async ({ page }) => {
  await page.goto('/practice.html')
  await openEditor(page)
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello, template', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
  const frame = page.locator('[data-testid="sandbox-frame"]')
  await expect(frame).toBeVisible()
  await expect(frame.contentFrame().getByText('hello, template')).toBeVisible()
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

test('入口文档被删：运行报错、不执行、不出预览', async ({ page }) => {
  await page.goto('/practice.html')
  await openEditor(page)
  await page.getByRole('button', { name: '删除 index.html' }).click()
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('入口文档不存在：index.html')
  await expect(out).not.toContainText('✓ 执行完毕')
  await expect(page.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
})
