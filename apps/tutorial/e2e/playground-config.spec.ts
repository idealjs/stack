import { expect, test } from '@playwright/test'

test('模板预置 stack.config.ts：文件栏三件套，esbuild.config.json 不存在', async ({ page }) => {
  await page.goto('/practice.html')
  await expect(page.getByRole('button', { name: 'index.html', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'main.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'stack.config.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'esbuild.config.json', exact: true })).toHaveCount(
    0,
  )
})

test('入口推导兜底：删掉 stack.config.ts 后 script src 指向不存在文件报错不执行', async ({
  page,
}) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: '删除 stack.config.ts' }).click()
  await page.getByRole('button', { name: 'index.html', exact: true }).click()
  await page.getByLabel('模块代码').fill('<script type="module" src="./nope.ts"></script>')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('入口文件不存在：nope.ts')
  await expect(out).not.toContainText('✓ 执行完毕')
})

test('改写 script src 指向新建文件：无配置时入口推导兜底走新入口', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: '删除 stack.config.ts' }).click()
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

test('stack.config.ts 的 entry 指向新建文件：运行走配置入口', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByLabel('新文件名').fill('hello.ts')
  await page.getByRole('button', { name: '新建文件', exact: true }).click()
  await page.getByRole('button', { name: 'hello.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill("console.log('hello from config entry')\n")
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill("export default {\n  entry: 'hello.ts',\n}\n")
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello from config entry', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
})

test('stack.config.ts 指向不存在的文件：报错不执行', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill("export default {\n  entry: 'nope.ts',\n}\n")
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('stack.config.ts 的 entry 指向不存在的文件：nope.ts')
  await expect(out).not.toContainText('✓ 执行完毕')
})

test('stack.config.ts 语法错误：构建徽章报错，不执行不出预览', async ({ page }) => {
  await page.goto('/practice.html')
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill('const = ;\n')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('构建', { timeout: 20_000 })
  await expect(out).toContainText('error:')
  await expect(out).not.toContainText('✓ 执行完毕')
  await expect(page.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
})
