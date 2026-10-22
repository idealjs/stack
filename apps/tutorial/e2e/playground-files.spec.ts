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
  await page.getByRole('button', { name: 'main.ts', exact: true }).click()
  const editor = page.getByLabel('模块代码')
  const mainCode = await editor.inputValue()
  expect(mainCode).toContain('hello, template')
  await page.getByRole('button', { name: 'utils.js', exact: true }).click()
  await expect(page.getByLabel('模块代码')).toHaveValue('export const one = 1')
})

test('删除文件：删活跃文件后切到首个剩余文件，配置文件固定不可删', async ({ page }) => {
  await page.goto('/practice.html')
  await addFile(page, 'utils.js')
  await page.getByRole('button', { name: '删除 utils.js' }).click()
  await expect(page.getByRole('button', { name: 'utils.js', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'index.html', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  )

  await page.getByRole('button', { name: '删除 index.html' }).click()
  await expect(page.getByRole('button', { name: 'index.html', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'main.ts', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await page.getByRole('button', { name: '删除 main.ts' }).click()
  await expect(page.getByRole('button', { name: 'main.ts', exact: true })).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'esbuild.config.json', exact: true }),
  ).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('button', { name: '删除 esbuild.config.json' })).toHaveCount(0)
})

test('文件名白名单：路径与非法字符被拒并提示', async ({ page }) => {
  await page.goto('/practice.html')
  await addFile(page, '../evil')
  await expect(page.getByTestId('file-name-error')).toContainText('文件名只能')
  await expect(page.getByRole('button', { name: 'evil', exact: true })).toHaveCount(0)
  await addFile(page, 'main.ts')
  await expect(page.getByTestId('file-name-error')).toContainText('同名文件已存在')
})
