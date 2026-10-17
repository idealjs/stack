import { expect, test } from '@playwright/test'

/** 拟物学习组件交互契约（自 design-lab 迁入；标本为 design-system 共享的 LearningKitGallery）。 */
test.describe('拟物学习组件', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design-components.html')
  })

  test('展示 13 类可复用组件，卡片继续沿用统一硬投影', async ({ page }) => {
    const gallery = page.getByTestId('learning-kit-gallery')
    const kinds = await gallery.locator('[data-comp]').evaluateAll((elements) =>
      [...new Set(elements.map((element) => element.getAttribute('data-comp')))].sort())
    expect(kinds).toEqual([
      'bookmark', 'brick-toolbox', 'clipboard-checklist', 'comparison-board', 'data-flow-board', 'delivery-manifest',
      'experiment-frame', 'flash-card', 'folder-tabs', 'output-receipt', 'stamp', 'sticky-note', 'task-envelope',
    ])
    for (const kind of ['clipboard-checklist', 'flash-card', 'experiment-frame', 'task-envelope', 'brick-toolbox', 'delivery-manifest', 'data-flow-board']) {
      const shadow = await gallery.locator(`[data-comp="${kind}"]`).evaluate((element) => getComputedStyle(element).boxShadow)
      expect(shadow).toBe('rgb(17, 17, 17) 5px 5px 0px 0px')
    }
    // 清单类分组：夹板与装箱单归入；装箱单与验收印章组合盖印
    await expect(gallery.getByRole('navigation')).toContainText('清单类')
    const listGroup = page.locator('#learning-kit-list')
    await expect(listGroup.locator('[data-comp="clipboard-checklist"]')).toContainText('第一个网页，跑起来了吗？')
    const manifestStamps = listGroup.locator('[data-comp="delivery-manifest"] [data-comp="stamp"]')
    await expect(manifestStamps).toHaveCount(3)
    await expect(manifestStamps.first()).toContainText('已备齐')
    await expect(manifestStamps.first()).toHaveAttribute('data-status', 'done')
    const flow = page.locator('[data-comp="data-flow-board"]')
    await expect(flow.getByRole('listitem')).toHaveCount(4)
    await expect(flow.locator('.learning-flow-title')).toHaveText(['用户操作', '更新数据', '更新界面', '保存数据'])
    await expect(flow.locator('.learning-flow-step').first()).toHaveAttribute('data-input', 'true')
  })

  test('逐项核对，全部完成才盖章，取消勾选后撤回印章', async ({ page }) => {
    const checklist = page.locator('[data-comp="clipboard-checklist"]')
    await expect(checklist).toContainText('已核对 1 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)
    await checklist.getByRole('checkbox', { name: /地址栏是 localhost/ }).check()
    await checklist.getByRole('checkbox', { name: /Network 返回 200/ }).check()
    await expect(checklist).toContainText('已核对 3 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveText('✓已核对')
    await checklist.getByRole('checkbox', { name: /Network 返回 200/ }).uncheck()
    await expect(checklist).toContainText('已核对 2 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)
  })

  test('文件夹支持点击与方向键切换，只有当前内容可读可聚焦', async ({ page }) => {
    const folder = page.locator('[data-comp="folder-tabs"]')
    const steps = folder.getByRole('tab', { name: '步骤', exact: true })
    const bricks = folder.getByRole('tab', { name: '积木', exact: true })
    const practice = folder.getByRole('tab', { name: '练习', exact: true })
    await practice.click()
    await expect(practice).toHaveAttribute('aria-selected', 'true')
    await expect(folder.getByRole('tabpanel')).toContainText('给 todo 加一个筛选器')
    await practice.press('ArrowLeft')
    await expect(bricks).toBeFocused()
    await expect(folder.getByRole('tabpanel')).toContainText('这章的四块积木')
    await bricks.press('Home')
    await expect(steps).toBeFocused()
    await expect(folder.getByRole('tabpanel')).toHaveCount(1)
    await expect(folder.getByRole('tabpanel')).toContainText('用组件拼出 todo')
    await steps.press('ArrowLeft')
    await expect(practice).toBeFocused()
  })

  test('知识卡翻面后可返回问题，书签可用键盘标记与取消', async ({ page }) => {
    const card = page.locator('[data-comp="flash-card"]')
    await expect(card).toContainText('分别由谁决定')
    await expect(card).not.toContainText('由父组件传入')
    await card.getByRole('button', { name: '翻面看答案' }).click()
    await expect(card).toContainText('由父组件传入')
    await card.getByRole('button', { name: '返回问题' }).click()
    await expect(card).toContainText('分别由谁决定')
    const bookmark = page.getByRole('button', { name: '这一节，待复习' })
    await bookmark.focus()
    await bookmark.press('Space')
    await expect(bookmark).toHaveAttribute('aria-pressed', 'true')
    await bookmark.press('Enter')
    await expect(bookmark).toHaveAttribute('aria-pressed', 'false')
  })

  test('信封、回执与积木使用原生展开控件，隐藏内容不占据阅读顺序', async ({ page }) => {
    const envelope = page.locator('[data-comp="task-envelope"]')
    await expect(envelope.locator('.learning-envelope-letter')).toBeHidden()
    await envelope.locator('summary').click()
    await expect(envelope.locator('.learning-envelope-letter')).toBeVisible()
    await expect(envelope.locator('.learning-envelope-letter')).toContainText('建立 React + TypeScript 的 Vite 工程。')
    await envelope.locator('summary').click()
    await expect(envelope.locator('.learning-envelope-letter')).toBeHidden()
    const receipt = page.locator('[data-comp="output-receipt"]')
    await expect(receipt.locator('pre')).toBeVisible()
    await receipt.locator('summary').click()
    await expect(receipt.locator('pre')).toBeHidden()
    await receipt.locator('summary').click()
    await expect(receipt.locator('pre')).toContainText('HTTP/1.1 200 OK')
    const brick = page.locator('[data-comp="brick-toolbox"] details').first()
    await brick.locator('summary').click()
    await expect(brick.locator('dl')).toContainText('同族还有 WebSocket')
    await brick.locator('summary').click()
    await expect(brick.locator('dl')).toBeHidden()
  })

  test('窄屏不会裁切组件，展开后仍保持单列；减少动态效果偏好关闭动画', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const gallery = page.getByTestId('learning-kit-gallery')
    await page.locator('[data-comp="task-envelope"] summary').click()
    await page.locator('[data-comp="brick-toolbox"] summary').first().click()
    const geometry = await gallery.locator('[data-comp]').evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return { kind: element.getAttribute('data-comp'), left: rect.left, right: rect.right }
    }))
    expect(geometry.filter((rect) => rect.left < 0 || rect.right > 390)).toEqual([])
    const pages = page.locator('.learning-comparison-page')
    const first = await pages.nth(0).boundingBox()
    const second = await pages.nth(1).boundingBox()
    expect(second!.y).toBeGreaterThan(first!.y + first!.height)
    const animation = await page.locator('.learning-flashcard-face').evaluate((element) => getComputedStyle(element).animationName)
    expect(animation).toBe('none')
  })
})
