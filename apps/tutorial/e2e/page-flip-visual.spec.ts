import { expect, test } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'

const VT_FREEZE_CSS = `
html[data-vt]::view-transition-old(root),
html[data-vt]::view-transition-new(root) {
  animation-play-state: paused !important;
  animation-delay: -300ms !important;
}
`

async function openVisualPage(
  browser: Browser,
  baseURL: string | undefined,
  freezeVt: boolean,
  path = './ch1.html',
) {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'no-preference',
  })
  if (freezeVt) {
    await context.addInitScript((css) => {
      const style = document.createElement('style')
      style.textContent = css
      document.documentElement.append(style)
    }, VT_FREEZE_CSS)
  }
  const page = await context.newPage()
  await page.goto(path)
  await page.waitForFunction(
    () => document.querySelectorAll('[data-flip-edge="next"]').length === 1,
  )
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  return page
}

const chargeByWheel = async (page: Page, deltaY: number, steps = 20) => {
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.move(640, 450)
    await page.mouse.wheel(0, deltaY)
    await page.waitForTimeout(30)
  }
}

const scrollToBottom = async (page: Page) => {
  await page.evaluate(() => {
    const el = document.querySelector('[data-scroll-root]')
    if (el instanceof HTMLElement) el.scrollTo(0, el.scrollHeight)
  })
  await page.waitForTimeout(400)
}

test('翻页视觉 · 顶部紧凑条默认收起态', async ({ browser, baseURL }) => {
  const page = await openVisualPage(browser, baseURL, false)
  await expect(page).toHaveScreenshot('flip-collapsed-top.png', { maxDiffPixelRatio: 0.01 })
  await page.context().close()
})

test('翻页视觉 · toggle 展开导航网格浮层', async ({ browser, baseURL }) => {
  const page = await openVisualPage(browser, baseURL, false)
  await page.getByLabel('展开导航网格').click()
  await page.waitForTimeout(400)
  await expect(page).toHaveScreenshot('flip-nav-overlay.png', { maxDiffPixelRatio: 0.01 })
  await page.context().close()
})

test('翻页视觉 · 底部弱蓄力气泡与进度条', async ({ browser, baseURL }) => {
  const page = await openVisualPage(browser, baseURL, false)
  await scrollToBottom(page)
  await page.mouse.wheel(0, 300)
  await page.waitForTimeout(1000)
  await expect(page).toHaveScreenshot('flip-bubble-charge.png', { maxDiffPixelRatio: 0.01 })
  await page.context().close()
})

test('翻页视觉 · next 翻页 VT 中间帧（50% 冻结）', async ({ browser, baseURL }) => {
  const page = await openVisualPage(browser, baseURL, true)
  await scrollToBottom(page)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
  await page.waitForTimeout(300)
  await expect(page).toHaveScreenshot('flip-vt-next-mid.png', { maxDiffPixelRatio: 0.01 })
  await page.context().close()
})

test('翻页视觉 · prev 翻页 VT 中间帧（50% 冻结）', async ({ browser, baseURL }) => {
  const page = await openVisualPage(browser, baseURL, true, './ch2.html')
  await page.waitForTimeout(300)
  await chargeByWheel(page, -250)
  await page.waitForURL('**/ch1.html')
  await page.waitForTimeout(300)
  await expect(page).toHaveScreenshot('flip-vt-prev-mid.png', { maxDiffPixelRatio: 0.01 })
  await page.context().close()
})
