// Playground 文件管理契约（practice 页承载 @stack/playground 宿主组件）：
// 新建/切换/删除文件与文件名白名单。执行语义仍是「活跃文件单模块 Blob URL」——
// 跨文件 import 的解析等 esbuild-wasm 打包阶段（刻意靠后），本契约不涉及。
import { test, expect } from '@playwright/test'

async function addFile(page: import('@playwright/test').Page, name: string) {
  await page.getByTestId('new-file-name').fill(name)
  await page.getByRole('button', { name: '新建文件' }).click()
}

test('新建文件：进列表并自动激活', async ({ page }) => {
  await page.goto('/practice.html')
  await addFile(page, 'utils.js')
  const tab = page.getByRole('button', { name: 'utils.js', exact: true })
  await expect(tab).toBeVisible()
  await expect(tab).toHaveAttribute('aria-current', 'true')
})

test('切换文件：两份代码互不串', async ({ page }) => {
  await page.goto('/practice.html')
  await addFile(page, 'utils.js')
  await page.getByLabel('模块代码').fill('export const one = 1')
  await page.getByRole('button', { name: 'main.js', exact: true }).click()
  const editor = page.getByLabel('模块代码')
  const mainCode = await editor.inputValue()
  expect(mainCode).toContain('hello, playground')
  await page.getByRole('button', { name: 'utils.js', exact: true }).click()
  await expect(page.getByLabel('模块代码')).toHaveValue('export const one = 1')
})

test('删除文件：删活跃文件后切到首个剩余文件，且不可删到零', async ({ page }) => {
  await page.goto('/practice.html')
  await addFile(page, 'utils.js')
  await page.getByRole('button', { name: '删除 utils.js' }).click()
  await expect(page.getByRole('button', { name: 'utils.js', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'main.js', exact: true })).toHaveAttribute('aria-current', 'true')
  // 只剩一份时不提供删除入口
  await expect(page.getByRole('button', { name: '删除 main.js' })).toHaveCount(0)
})

test('文件名白名单：路径与非法字符被拒并提示', async ({ page }) => {
  await page.goto('/practice.html')
  await addFile(page, '../evil')
  await expect(page.getByTestId('file-name-error')).toContainText('文件名只能')
  await expect(page.getByRole('button', { name: 'evil', exact: true })).toHaveCount(0)
  await addFile(page, 'main.js')
  await expect(page.getByTestId('file-name-error')).toContainText('同名文件已存在')
})
