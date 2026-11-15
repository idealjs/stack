import { expect, test } from '@playwright/test'

const SPECS = [
  {
    name: '向下 · tips 形',
    comp: 'dropdown-demo-down',
    panelId: 'dropdown-demo-down-panel',
    panelText: 'tips 贴签面板',
    placement: 'bottom',
  },
  {
    name: '向上 · agent 形',
    comp: 'dropdown-demo-up',
    panelId: 'dropdown-demo-up-panel',
    panelText: '陪练弹层面板',
    placement: 'top',
  },
] as const

test.describe('组件册 · Dropdown 下拉基件', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design/components.html')
  })

  for (const { name, comp, panelId, panelText, placement } of SPECS) {
    test(`${name}：aria 关系正确，点击展开、Esc 与点面板外收起，面板锚定贴签`, async ({ page }) => {
      const trigger = page.locator(`[data-comp="${comp}"]`)
      const panel = page.locator(`#${panelId}`)
      const heading = page.getByRole('heading', { name: /Dropdown · 下拉基件/ })
      await expect(trigger).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toHaveAttribute('aria-controls', panelId)
      await expect(panel).toBeHidden()

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(panel).toBeVisible()
      await expect(panel).toContainText(panelText)

      const tBox = await trigger.boundingBox()
      const wrapper = panel.locator('..')
      const wBox = await wrapper.boundingBox()
      const pBox = await panel.boundingBox()
      expect(wBox.height).toBeGreaterThan(100)
      expect(Math.abs(wBox.x + wBox.width - (tBox.x + tBox.width))).toBeLessThanOrEqual(1)
      if (placement === 'bottom') {
        expect(wBox.y).toBeGreaterThanOrEqual(tBox.y + tBox.height - 1)
      } else {
        expect(wBox.y + wBox.height).toBeLessThanOrEqual(tBox.y + 1)
      }
      expect(pBox.height).toBeGreaterThan(100)

      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await trigger.click()
      await expect(panel).toBeVisible()
      await heading.click()
      await expect(panel).toBeHidden()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  }

  test('双形态互不联动，各自独立开合', async ({ page }) => {
    const down = page.locator('[data-comp="dropdown-demo-down"]')
    const up = page.locator('[data-comp="dropdown-demo-up"]')
    await down.click()
    await expect(page.locator('#dropdown-demo-down-panel')).toBeVisible()
    await expect(page.locator('#dropdown-demo-up-panel')).toBeHidden()
    await up.click()
    await expect(page.locator('#dropdown-demo-up-panel')).toBeVisible()
    await expect(page.locator('#dropdown-demo-down-panel')).toBeHidden()
  })
})
