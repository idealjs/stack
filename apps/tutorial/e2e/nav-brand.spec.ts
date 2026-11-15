import { expect, test } from '@playwright/test'

const PAGES = ['/index.html', '/design/', '/tutorial/ch7.html', '/blog/']

test.describe('navbar 品牌徽章一致性', () => {
  test('各页面 brand 徽章：无背景填充、同款 3px 阴影（logo 恒定，不随页面翻转）', async ({
    page,
  }) => {
    const shadows: string[] = []
    const backgrounds: string[] = []
    for (const pagePath of PAGES) {
      await page.goto(pagePath, { timeout: 20_000 })
      await page.waitForTimeout(300)
      const brand = page.locator('header a').first()
      backgrounds.push(await brand.evaluate((el) => getComputedStyle(el).backgroundColor))
      shadows.push(await brand.evaluate((el) => getComputedStyle(el).boxShadow))
    }
    expect(new Set(backgrounds)).toEqual(new Set(['rgba(0, 0, 0, 0)']))
    expect(new Set(shadows).size).toBe(1)
    expect(shadows[0]).toContain('3px')
  })

  test('hover 抬升：阴影从 3px 变 5px', async ({ page }) => {
    await page.goto('/index.html', { timeout: 20_000 })
    const brand = page.locator('header a').first()
    const rest = await brand.evaluate((el) => getComputedStyle(el).boxShadow)
    await brand.hover()
    expect(rest).toContain('3px')
    await expect
      .poll(async () => brand.evaluate((el) => getComputedStyle(el).boxShadow))
      .toContain('5px')
  })

  test('移动抽屉 brand 同款阴影', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/index.html', { timeout: 20_000 })
    await page.locator('label[for="site-nav-toggle"]').first().click()
    const drawerBrand = page.locator('#site-nav-drawer a').first()
    await expect(drawerBrand).toBeVisible()
    const shadow = await drawerBrand.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(shadow).toContain('3px')
  })
})
