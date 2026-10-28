import { expect, test } from '@playwright/test'

const SIDEBAR = '#site-sidebar-drawer'
const OPENER = 'label[for="site-sidebar-toggle"][aria-label="打开侧栏导航"]'
const OVERLAY = 'label[for="site-sidebar-toggle"][aria-hidden="true"]'

async function clickAnchorAndAssertScroll(
  page: import('@playwright/test').Page,
  click: () => Promise<void>,
  maxY: number,
) {
  const before = await page.evaluate(() => window.scrollY)
  await click()
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100)
  const box = await page.locator('#practice-sandbox').boundingBox()
  expect(box?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(maxY)
}

test.describe('练习场 · sidebar 导航（唯一导航形态）', () => {
  test('桌面：顶部 navbar 退场，侧栏常驻在场', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/practice.html', { timeout: 20_000 })
    await expect(page.locator('header')).toHaveCount(0)
    const sidebar = page.locator(SIDEBAR)
    await expect(sidebar).toBeVisible()
    await expect(sidebar.locator('a').first()).toContainText('idealjs stack')
    for (const label of ['全栈教程', '博客', '设计系统', '在线练习', '本页']) {
      await expect(sidebar.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('桌面：brand 徽章 ghost 同款（无背景填充＋3px 阴影），在线练习组高亮', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/practice.html', { timeout: 20_000 })
    const brand = page.locator(`${SIDEBAR} a`).first()
    await expect(brand).toHaveText('idealjs stack')
    const background = await brand.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(background).toBe('rgba(0, 0, 0, 0)')
    const shadow = await brand.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(shadow).toContain('3px')
    const rowShadow = await page
      .locator(`${SIDEBAR} a`, { hasText: '在线练习' })
      .evaluate((el) => getComputedStyle(el).boxShadow)
    expect(rowShadow).toContain('inset')
  })

  test('桌面：本页锚点点击滚动到位', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/practice.html', { timeout: 20_000 })
    await clickAnchorAndAssertScroll(
      page,
      () => page.locator(SIDEBAR).getByText('代码沙箱', { exact: true }).click(),
      900,
    )
  })

  test('移动：抽屉开合，brand 同款，遮罩点按收起', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/practice.html', { timeout: 20_000 })
    const sidebar = page.locator(SIDEBAR)
    await expect(sidebar).toBeHidden()
    await page.locator(OPENER).click()
    await expect(sidebar).toBeVisible()
    const brand = sidebar.locator('a').first()
    await expect(brand).toHaveText('idealjs stack')
    await expect
      .poll(async () => brand.evaluate((el) => getComputedStyle(el).boxShadow))
      .toContain('3px')
    await page.locator(OVERLAY).click({ position: { x: 370, y: 100 } })
    await expect(sidebar).toBeHidden()
    await page.locator(OPENER).click()
    await expect(sidebar).toBeVisible()
    await sidebar.getByLabel('收起侧栏导航', { exact: true }).click()
    await expect(sidebar).toBeHidden()
  })

  test('移动：抽屉打开后可点本页锚点滚动到位', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/practice.html', { timeout: 20_000 })
    await page.locator(OPENER).click()
    const sidebar = page.locator(SIDEBAR)
    await expect(sidebar).toBeVisible()
    await clickAnchorAndAssertScroll(
      page,
      () => sidebar.getByText('代码沙箱', { exact: true }).click(),
      844,
    )
  })
})
