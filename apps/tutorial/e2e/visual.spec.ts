import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const PAGES = [
  'index.html',
  'design/',
  'design/colors.html',
  'design/typography.html',
  'design/symbols.html',
  'design/components.html',
  'design/shadow.html',
  'tutorial/index.html',
  'tutorial/ch1.html',
  'tutorial/ch2.html',
  'tutorial/ch3.html',
  'tutorial/ch4.html',
  'tutorial/ch5.html',
  'tutorial/ch6.html',
  'tutorial/ch7.html',
  'skills/html.html',
  'skills/css.html',
  'skills/javascript.html',
  'blog/index.html',
  'blog/2025-07.html',
  'blog/2026-08.html',
  'blog/gorzil.html',
  'blog/sapling-transformer.html',
  'practice/index.html',
]

const MOBILE = ['index.html', 'tutorial/ch1.html', 'design/components.html', 'practice/index.html']

const DRAWER_TOGGLES = ['site-nav-toggle', 'site-sidebar-toggle']

const nameOf = (path: string) =>
  path
    .replace(/\.html$/, '')
    .replaceAll('/', '-')
    .replace(/-$/, '')

const flattenPage = (page: Page) =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll<HTMLElement>('*')) {
      if (getComputedStyle(el).position === 'sticky') el.style.position = 'relative'
    }
    for (const el of document.querySelectorAll<HTMLElement>('[data-scroll-root]')) {
      el.style.height = 'auto'
      el.style.overflow = 'visible'
    }
    document.documentElement.style.height = 'auto'
    document.body.style.height = 'auto'
  })

const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
}

const baseline = (page: Page, name: string) =>
  expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.001,
    animations: 'disabled',
  })

for (const path of PAGES) {
  test(`视觉基线 · 整页 · ${nameOf(path)}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`/${path}`)
    await settle(page)
    await flattenPage(page)
    await baseline(page, nameOf(path))
  })
}

for (const path of MOBILE) {
  test(`视觉基线 · 移动端 · ${nameOf(path)}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/${path}`)
    await settle(page)
    await baseline(page, `m-${nameOf(path)}`)

    const toggle = page.locator(DRAWER_TOGGLES.map((id) => `label[for="${id}"]`).join(', ')).first()
    if ((await toggle.count()) === 0) return
    await toggle.click()
    await baseline(page, `m-${nameOf(path)}-drawer`)
  })
}
