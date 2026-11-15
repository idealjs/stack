import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const chargeByWheel = async (page: Page, deltaY: number, steps = 20) => {
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, deltaY)
    await page.waitForTimeout(30)
  }
}

const scrollToBottom = () => {
  const el = document.querySelector('[data-scroll-root]')
  if (el instanceof HTMLElement) el.scrollTo(0, el.scrollHeight)
}

const rootScrollTop = () => {
  const el = document.querySelector('[data-scroll-root]')
  return el instanceof HTMLElement ? el.scrollTop : window.scrollY
}

const isAtBottom = () => {
  const el = document.querySelector('[data-scroll-root]')
  if (!(el instanceof HTMLElement)) return false
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 1
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
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
  await expect(page.locator('html')).toHaveAttribute('data-vt', 'next')
  expect(await page.evaluate(() => sessionStorage.getItem('vt'))).toBeNull()
})

test('arrival momentum never flips; charge holds after wheel stops; reverse wheel clears it', async ({
  page,
}) => {
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
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

  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(200)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
})

test('charge upward at top flips to previous chapter', async ({ page }) => {
  await page.goto('/tutorial/ch2.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, -250)
  await page.waitForURL('**/ch1.html')
  await expect(page.locator('html')).toHaveAttribute('data-vt', 'prev')
})

test('mid-page wheel keeps scrolling without flipping', async ({ page }) => {
  await page.goto('/tutorial/ch3.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 1500)
  await page.waitForTimeout(600)
  expect(page.url()).toContain('ch3.html')
})

test('PageDown at bottom flips to next chapter', async ({ page }) => {
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.keyboard.press('PageDown')
  await page.waitForURL('**/ch2.html')
})

test('clicking the next-chapter badge jumps directly to the next chapter', async ({ page }) => {
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 250)
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: /下一页：第 2 章/ }).click()
  await page.waitForURL('**/ch2.html')
})

test('reload returns to chapter top', async ({ page }) => {
  await page.goto('/tutorial/ch2.html')
  await page.evaluate(() => {
    const el = document.querySelector('[data-scroll-root]')
    if (el instanceof HTMLElement) el.scrollTop = 600
  })
  await page.waitForTimeout(200)
  await page.reload()
  await page.waitForTimeout(400)
  expect(await page.evaluate(rootScrollTop)).toBe(0)
})

test('after flip the next chapter lands at top and first wheel scrolls', async ({ page }) => {
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/ch2.html')
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-scroll-root]')
      return (el instanceof HTMLElement ? el.scrollTop : window.scrollY) === 0
    },
    undefined,
    {
      polling: 100,
      timeout: 10_000,
    },
  )
  await page.waitForTimeout(400)
  expect(await page.evaluate(rootScrollTop)).toBe(0)

  await page.waitForTimeout(700)
  await page.mouse.wheel(0, 300)
  await page.waitForTimeout(300)
  expect(await page.evaluate(rootScrollTop)).toBeGreaterThan(0)
})

test('weak bottom charge holds next edge symbols on screen, reverse wheel springs them back', async ({
  page,
}) => {
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(300)
  expect(await page.evaluate(edgeProgress, 'next')).toBe(0)

  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 200)
  await page.waitForFunction(edgeProgress, 'next')
  await expect(page.locator('[data-flip-edge="next"] button')).toBeVisible()

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
  await page.goto('/tutorial/ch2.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, -200)
  await page.waitForFunction(edgeProgress, 'prev')
  await expect(page.locator('[data-flip-edge="prev"] button')).toBeVisible()

  await page.waitForTimeout(400)
  expect(await page.evaluate(edgeProgress, 'prev')).toBeGreaterThan(0)

  await page.mouse.wheel(0, 200)
  await page.waitForFunction(edgeSettled, 'prev')
  expect(page.url()).toContain('ch2.html')
  expect(await page.evaluate(edgeProgress, 'prev')).toBe(0)
})

test('navbar stays collapsed by default; toggle expands an overlay without squeezing content', async ({
  page,
}) => {
  await page.goto('/tutorial/ch1.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  const grid = page.locator('#site-nav-drawer')
  await expect(grid).toBeHidden()

  await page.evaluate(() => {
    const el = document.querySelector('[data-scroll-root]')
    if (el instanceof HTMLElement) el.scrollTop = 400
  })
  await page.waitForTimeout(300)
  await expect(grid).toBeHidden()

  const heightBefore = await page.evaluate(() => {
    const el = document.querySelector('[data-scroll-root]')
    return el instanceof HTMLElement ? el.clientHeight : 0
  })
  await page.getByLabel('展开导航网格').click()
  await expect(grid).toBeVisible()

  const heightAfter = await page.evaluate(() => {
    const el = document.querySelector('[data-scroll-root]')
    return el instanceof HTMLElement ? el.clientHeight : 0
  })
  expect(heightAfter).toBe(heightBefore)

  await page.getByLabel('收起导航网格').click()
  await expect(grid).toBeHidden()
})

test('charging at index bottom flips into the tutorial hub with next direction', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/tutorial/index.html')
  await expect(page.locator('html')).toHaveAttribute('data-vt', 'next')
})

test('charging at ch7 bottom crosses into the skills section', async ({ page }) => {
  await page.goto('/tutorial/ch7.html')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(scrollToBottom)
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/skills/html.html')
  await expect(page.locator('html')).toHaveAttribute('data-vt', 'next')
})

test('charging at practice bottom loops back to the index page', async ({ page }) => {
  await page.goto('/practice/')
  await expect(page.locator('[data-flip-edge="next"]')).toHaveCount(1)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(200)
  await page.mouse.move(640, 450)
  await chargeByWheel(page, 250)
  await page.waitForURL('**/index.html')
  await expect(page.locator('html')).toHaveAttribute('data-vt', 'next')
})
