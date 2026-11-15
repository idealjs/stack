import { expect, test } from '@playwright/test'

const FRAMES = [
  {
    name: '定宽取景框',
    url: 'https://stack.dev/design/components',
    content: '你好，取景框',
  },
  {
    name: '宽幅取景框',
    url: 'https://stack.dev/learn',
    content: '在取景框里排你的页面',
  },
] as const

test.describe('组件册 · BrowserMockup 浏览器取景框', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design/components.html')
  })

  test('标本就位：两件取景框可见，地址栏与视口内容齐全', async ({ page }) => {
    const frames = page.locator('[data-comp="browser-mockup"]')
    await expect(frames).toHaveCount(2)
    for (const { url, content } of FRAMES) {
      const frame = frames.filter({ hasText: url })
      await expect(frame).toBeVisible()
      await expect(frame).toContainText(content)
    }
  })

  test('chrome 结构：工具栏三圆点、地址栏药丸含放大镜与 URL', async ({ page }) => {
    const frame = page.locator('[data-comp="browser-mockup"]').first()
    await expect(frame.locator('i')).toHaveCount(3)
    await expect(frame.locator('svg[aria-hidden]')).toBeVisible()
    const urlText = frame.locator('span[dir="ltr"]')
    await expect(urlText).toHaveText(FRAMES[0].url)
  })
})
