import { expect, test } from '@playwright/test'

const CASES: [name: string, path: string][] = [
  ['design', '/design.html'],
  ['design-colors', '/design-colors.html'],
  ['design-symbols', '/design-symbols.html'],
  ['design-components', '/design-components.html'],
  ['design-shadow', '/design-shadow.html'],
]

for (const [name, path] of CASES) {
  test(`视觉基线 · ${name}`, async ({ page }) => {
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01, // 允许 1% 以内的字体渲染差异
      animations: 'disabled',
    })
  })
}
