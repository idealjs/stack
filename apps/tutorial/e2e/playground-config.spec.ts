import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const openEditor = async (page: Page) => {
  await page.locator('[data-comp="editor-dock-tab"]').click()
  await expect(page.locator('#playground-dock-panel')).toBeVisible()
}

test('模板预置 stack.config.ts：文件栏三件套，esbuild.config.json 不存在', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
  await expect(page.getByRole('button', { name: 'index.html', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'main.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'stack.config.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'esbuild.config.json', exact: true })).toHaveCount(
    0,
  )
})

test('无配置回退：删掉 stack.config.ts 后 script src 指向不存在文件报错不执行', async ({
  page,
}) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: '删除 stack.config.ts' }).click()
  await page.getByRole('button', { name: 'index.html', exact: true }).click()
  await page.getByLabel('模块代码').fill('<script type="module" src="./nope.ts"></script>')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('入口文件不存在：nope.ts')
  await expect(out).not.toContainText('✓ 执行完毕')
})

test('无配置回退：改写 script src 指向新建文件，运行走新入口', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
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

test('inputs 含 index.html：script src 指向 main.ts，运行走 main.ts 闭包', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page
    .getByLabel('模块代码')
    .fill("export default {\n  inputs: [{ name: 'page', path: 'index.html' }],\n}\n")
  await page.getByRole('button', { name: 'main.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill("console.log('hello from html inputs')\n")
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello from html inputs', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
})

test('inputs 含 index.html：改写 body 文本后预览框渲染改后文本——index.html 被沙盒应用', async ({
  page,
}) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: 'index.html', exact: true }).click()
  await page
    .getByLabel('模块代码')
    .fill(
      '<!DOCTYPE html>\n<html lang="zh-CN">\n  <head>\n    <meta charset="UTF-8" />\n    <title>mpa template</title>\n  </head>\n  <body>\n    <p>身体文本证据</p>\n    <div id="app"></div>\n    <script type="module" src="./main.ts"></script>\n  </body>\n</html>\n',
    )
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello, template', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
  const frame = page.locator('[data-testid="sandbox-frame"]')
  await expect(frame).toBeVisible()
  await expect(frame.contentFrame().getByText('身体文本证据')).toBeVisible()
  await expect(frame.contentFrame().getByText('hello, template')).toBeVisible()
})

test('inputs 与 entry 同时出现：inputs 优先，entry 不再消费', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page
    .getByLabel('模块代码')
    .fill(
      "export default {\n  inputs: [{ name: 'page', path: 'index.html' }],\n  entry: 'nope.ts',\n}\n",
    )
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('hello, template', { timeout: 20_000 })
  await expect(out).toContainText('✓ 执行完毕')
  await expect(out).not.toContainText('nope.ts')
})

test('stack.config.ts 改 entry（旧形态兼容）：运行走 entry', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
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

test('inputs 指向不存在的文件：报错不执行', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page
    .getByLabel('模块代码')
    .fill("export default {\n  inputs: [{ name: 'page', path: 'nope.html' }],\n}\n")
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('stack.config.ts 的 inputs 指向不存在的文件：nope.html')
  await expect(out).not.toContainText('✓ 执行完毕')
  await expect(page.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
})

test('stack.config.ts 的 entry 指向不存在的文件：报错不执行', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill("export default {\n  entry: 'nope.ts',\n}\n")
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('stack.config.ts 的 entry 指向不存在的文件：nope.ts')
  await expect(out).not.toContainText('✓ 执行完毕')
})

test('stack.config.ts 语法错误：构建徽章报错，不执行不出预览', async ({ page }) => {
  await page.goto('/practice/')
  await openEditor(page)
  await page.getByRole('button', { name: 'stack.config.ts', exact: true }).click()
  await page.getByLabel('模块代码').fill('const = ;\n')
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const out = page.getByRole('region', { name: '输出' })
  await expect(out).toContainText('构建', { timeout: 20_000 })
  await expect(out).toContainText('error:')
  await expect(out).not.toContainText('✓ 执行完毕')
  await expect(page.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
})
