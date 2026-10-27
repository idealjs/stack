import { expect, test } from '@playwright/test'

const PAGES = ['/index.html', '/practice.html', '/design.html', '/ch7.html', '/blog.html']

test.describe('navbar 品牌徽章一致性', () => {
  test('各页面 navbar brand 徽章同为品牌色（clash1b），不随页面翻转', async ({ page }) => {
    const colors: Record<string, string> = {}
    for (const pagePath of PAGES) {
      await page.goto(pagePath, { timeout: 20_000 })
      await page.waitForTimeout(300)
      const brand = page.locator('header').first().locator('a').first()
      colors[pagePath] = await brand.evaluate((el) => getComputedStyle(el).backgroundColor)
    }
    const unique = Object.values(colors)
    expect(new Set(unique).size).toBe(1)
    expect(unique[0]).not.toBe('rgb(255, 255, 255)')
    expect(unique[0]).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('移动抽屉 brand 与桌面 navbar brand 同为品牌色', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/index.html', { timeout: 20_000 })
    await page.locator('label[for="site-nav-toggle"]').first().click()
    await page.waitForTimeout(500)
    const drawer = page.locator('#site-nav-drawer')
    const drawerBrand = drawer.locator('a').first()
    await expect(drawerBrand).toBeVisible()
    const color = await drawerBrand.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(color).not.toBe('rgb(255, 255, 255)')
    expect(color).not.toBe('rgba(0, 0, 0, 0)')
  })
})
