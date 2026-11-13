import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const chargeByWheel = async (page: Page, deltaY: number, steps = 20) => {
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, deltaY)
    await page.waitForTimeout(30)
  }
}

const isAtBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1

const surfaceSettled = () => {
  const surface = document.querySelector('[data-flip-surface]')
  return surface instanceof HTMLElement && surface.style.transform === ''
}

const edgeProgress = (side: 'next' | 'prev') => {
  const edge = document.querySelector(`[data-flip-edge="${side}"]`)
  return edge instanceof HTMLElement ? Number(edge.style.getPropertyValue('--flip-progress')) : -1
}

const edgeSettled = (side: 'next' | 'prev') => {
  const edge = document.querySelector(`[data-flip-edge="${side}"]`)
  return edge instanceof HTMLElement
    ? Number(edge.style.getPropertyValue('--flip-progress')) === 0
    : true
}

test('charge past threshold at bottom flips to next chapter', async ({ page }) => {
  await page.goto('./ch1.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
})

test('arrival momentum never flips; charge holds after wheel stops; reverse wheel clears it', async ({
  page,
}) => {
  await page.goto('./ch1.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 6000)
  await page.waitForFunction(isAtBottom)
  await page.waitForTimeout(300)
  expect(page.url()).toContain('ch1.html')

  await page.mouse.wheel(0, 200)
  await page.waitForTimeout(400)
  expect(await page.evaluate(edgeProgress, 'next')).toBeGreaterThan(0)
  expect(page.url()).toContain('ch1.html')

  await page.mouse.wheel(0, -200)
  await page.waitForFunction(edgeSettled, 'next')
  expect(await page.evaluate(edgeProgress, 'next')).toBe(0)
  expect(page.url()).toContain('ch1.html')

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(200)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
})

test('charge upward at top flips to previous chapter', async ({ page }) => {
  await page.goto('./ch2.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, -250)
  await page.waitForURL('**/ch1.html')
})

test('mid-page wheel keeps scrolling without flipping', async ({ page }) => {
  await page.goto('./ch3.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 1500)
  await page.waitForTimeout(600)
  expect(page.url()).toContain('ch3.html')
})

test('PageDown at bottom flips to next chapter', async ({ page }) => {
  await page.goto('./ch1.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.keyboard.press('PageDown')
  await page.waitForURL('**/ch2.html')
})

test('clicking the next-chapter badge jumps directly to the next chapter', async ({ page }) => {
  await page.goto('./ch1.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 250)
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: /翻到下一章/ }).click()
  await page.waitForURL('**/ch2.html')
})

test('reload returns to chapter top', async ({ page }) => {
  await page.goto('./ch2.html')
  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(200)
  await page.reload()
  await page.waitForTimeout(400)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('after flip the next chapter lands at top and first wheel scrolls', async ({ page }) => {
  await page.goto('./ch1.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
  await page.waitForFunction(() => window.scrollY === 0, undefined, {
    polling: 100,
    timeout: 10_000,
  })
  await page.waitForTimeout(400)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  await page.waitForTimeout(700)
  await page.mouse.wheel(0, 300)
  await page.waitForTimeout(300)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})

test('weak bottom charge holds next edge symbols on screen, reverse wheel springs them back', async ({
  page,
}) => {
  await page.goto('./ch1.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(300)
  expect(await page.evaluate(edgeProgress, 'next')).toBe(0)

  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 200)
  await page.waitForFunction(edgeProgress, 'next')
  await expect(page.locator('[data-flip-edge="next"] [data-flip-peek]')).toBeVisible()

  await page.waitForTimeout(400)
  expect(await page.evaluate(edgeProgress, 'next')).toBeGreaterThan(0)

  await page.mouse.wheel(0, -200)
  await page.waitForFunction(edgeSettled, 'next')
  expect(page.url()).toContain('ch1.html')
  expect(await page.evaluate(edgeProgress, 'next')).toBe(0)
})

test('weak top charge holds prev edge symbols on screen, reverse wheel springs them back', async ({
  page,
}) => {
  await page.goto('./ch2.html')
  await expect(page.locator('[data-flip-surface]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, -200)
  await page.waitForFunction(edgeProgress, 'prev')
  await expect(page.locator('[data-flip-edge="prev"] [data-flip-peek]')).toBeVisible()

  await page.waitForTimeout(400)
  expect(await page.evaluate(edgeProgress, 'prev')).toBeGreaterThan(0)

  await page.mouse.wheel(0, 200)
  await page.waitForFunction(edgeSettled, 'prev')
  expect(page.url()).toContain('ch2.html')
  expect(await page.evaluate(edgeProgress, 'prev')).toBe(0)
})
