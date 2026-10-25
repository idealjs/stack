import { expect, test } from '@playwright/test'

test('无配置文件：文件栏只有 index.html 与 main.ts', async ({ page }) => {
  await page.goto('/practice.html')
  await expect(page.getByRole('button', { name: 'index.html', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'main.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'esbuild.config.json', exact: true })).toHaveCount(
    0,
  )
})

test('入口由 index.html 的 script src 推导：指向不存在文件即报错不执行', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: 'index.html', exact: true }).click()
  await page.getByLabel('模块代码').fill('<script type="module" src="./nope.ts"></script>')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('入口文件不存在：nope.ts')
  await expect(out).not.toContainText('✓ 执行完毕')
})

test('改写 script src 指向新建文件：运行走新入口', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByLabel('新文件名').fill('hello.ts')
  await page.getByRole('button', { name: '新建文件', exact: true }).click()
  await page.getByRole('button', { name: 'hello.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill("console.log('hello from new entry')\n")
  await page.getByRole('button', { name: 'index.html', exact: true }).click()
  await page.getByLabel('模块代码').fill('<script type="module" src="./hello.ts"></script>')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello from new entry', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
})
