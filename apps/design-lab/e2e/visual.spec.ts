import { expect, test } from '@playwright/test'

/**
 * 像素级视觉回归基线——防止后续改动出现画面偏差。
 * 有意的设计变更：`yarn test:e2e -- --update-snapshots` 后提交新基线。
 */
const CASES: [name: string, path: string][] = [
  ['index', '/index.html'],
  ['colors', '/colors.html'],
  ['symbols', '/symbols.html'],
  ['components', '/components.html'],
  ['shelf', '/shelf.html'],
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
