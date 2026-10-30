import { expect, test } from '@playwright/test'

const COACH_TAB = '[data-comp="coach-sticky"]'
const COACH_PANEL = '#coach-sticky-panel'
const CLIP = '[data-comp="checklist-clip"]'
const LIST_PANEL = '#checklist-dock-panel'
const CHECKLIST = '[data-comp="clipboard-checklist"]'
const FLOW = '[data-comp="data-flow-board"]'
const EDITOR_TAB = '[data-comp="editor-dock-tab"]'
const EDITOR_PANEL = '#editor-dock-panel'
const TIPS = '[data-comp="tips-dock-trigger"]'
const TIPS_PANEL = '#tips-dock-panel'

test.describe('练习场 · 陪练 agent 贴签（右下角）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('停靠右下角，aria 关系正确；点击展开、再点与 Esc 收起', async ({ page }) => {
    const coach = page.locator(COACH_TAB)
    await expect(coach).toBeVisible()
    await expect(coach).toContainText('陪练 agent')
    await expect(coach).toHaveAttribute('aria-expanded', 'false')
    await expect(coach).toHaveAttribute('aria-controls', 'coach-sticky-panel')
    await expect(page.locator(COACH_PANEL)).toBeHidden()

    await coach.click()
    await expect(coach).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator(COACH_PANEL)
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('陪练 agent')

    await coach.click()
    await expect(page.locator(COACH_PANEL)).toBeHidden()
    await expect(coach).toHaveAttribute('aria-expanded', 'false')

    await coach.click()
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator(COACH_PANEL)).toBeHidden()
    await expect(coach).toHaveAttribute('aria-expanded', 'false')
  })

  test('展开面板直接进入对话：无开场提示词，输入区与发送动作在场', async ({ page }) => {
    await page.locator(COACH_TAB).click()
    const panel = page.locator(COACH_PANEL)
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('当前任务')
    const input = panel.locator('textarea')
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('')
    await expect(panel.getByRole('button', { name: '发送' })).toBeVisible()
  })
})

test.describe('练习场 · 验收清单夹板（顶部右上）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('夹具停靠页面右上，aria 关系正确；点击拉出清单、再点与 Esc 收回', async ({ page }) => {
    const clip = page.locator(CLIP)
    await expect(clip).toBeVisible()
    await expect(clip).toHaveAttribute('aria-expanded', 'false')
    await expect(clip).toHaveAttribute('aria-controls', 'checklist-dock-panel')
    await expect(page.locator(LIST_PANEL)).toBeHidden()

    await clip.click()
    await expect(clip).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator(LIST_PANEL)
    await expect(panel).toBeVisible()
    await expect(panel.locator(CHECKLIST)).toContainText('CHECK / 验收清单')

    await clip.click()
    await expect(page.locator(LIST_PANEL)).toBeHidden()
    await expect(clip).toHaveAttribute('aria-expanded', 'false')

    await clip.click()
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator(LIST_PANEL)).toBeHidden()
    await expect(clip).toHaveAttribute('aria-expanded', 'false')
  })

  test('夹板展开后核对进度与盖章联动，夹具金属条随进度变色', async ({ page }) => {
    const clip = page.locator(CLIP)
    await expect(clip).toHaveAttribute('data-progress', 'none')
    await clip.click()
    const panel = page.locator(LIST_PANEL)
    const checklist = panel.locator(CHECKLIST)
    await expect(checklist).toContainText('已核对 0 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)

    await checklist.getByRole('checkbox', { name: '预览页大标题显示名字' }).check()
    await expect(clip).toHaveAttribute('data-progress', 'partial')
    await checklist.getByRole('checkbox', { name: '介绍恰好 3 行' }).check()
    await checklist
      .getByRole('checkbox', { name: '只改了 src/App.tsx（可以让 agent 展示改动内容）' })
      .check()
    await expect(checklist).toContainText('已核对 3 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveText('✓已核对')
    await expect(clip).toHaveAttribute('data-progress', 'all')

    await checklist.getByRole('checkbox', { name: '介绍恰好 3 行' }).uncheck()
    await expect(checklist).toContainText('已核对 2 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)
    await expect(clip).toHaveAttribute('data-progress', 'partial')
  })

  test('与陪练贴签全局互斥：开一块收另一块，清单在顶、对话在底', async ({ page }) => {
    await page.locator(CLIP).click()
    await expect(page.locator(LIST_PANEL)).toBeVisible()
    await page.locator(COACH_TAB).click()
    await expect(page.locator(COACH_PANEL)).toBeVisible()
    await expect(page.locator(LIST_PANEL)).toBeHidden()
    await page.locator(CLIP).click()
    await expect(page.locator(LIST_PANEL)).toBeVisible()
    await expect(page.locator(COACH_PANEL)).toBeHidden()
  })
})

test.describe('练习场 · tips 喂给陪练（右上角）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('tips 贴签停靠右上角，默认收起；点击展开流水线板、再点与 Esc 收起，与验收夹具互斥', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const tips = page.locator(TIPS)
    await expect(tips).toBeVisible()
    await expect(tips).toHaveAttribute('aria-label', 'tips · 喂给陪练')
    await expect(tips).toHaveAttribute('aria-expanded', 'false')
    await expect(tips).toHaveAttribute('aria-controls', 'tips-dock-panel')
    await expect(page.locator(TIPS_PANEL)).toBeHidden()

    const chipBox = await tips.boundingBox()
    expect(chipBox).not.toBeNull()
    expect(chipBox!.y, 'tips 贴签应停靠顶缘').toBeLessThanOrEqual(20)
    expect(1280 - (chipBox!.x + chipBox!.width), 'tips 贴签应停靠右缘').toBeLessThanOrEqual(24)

    await tips.click()
    await expect(tips).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator(TIPS_PANEL)
    await expect(panel).toBeVisible()
    const board = panel.locator(FLOW)
    await expect(board).toBeVisible()
    await expect(board.locator('h3')).toContainText('点一步，喂给陪练')

    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(tips).toHaveAttribute('aria-expanded', 'false')

    await tips.click()
    await expect(panel).toBeVisible()
    await page.locator(CLIP).click()
    await expect(page.locator(LIST_PANEL)).toBeVisible()
    await expect(panel).toBeHidden()
    await expect(tips).toHaveAttribute('aria-expanded', 'false')
  })

  test('流水线板收进面板：主区不再有板，三步同源提示词，第一步为虚线起点', async ({ page }) => {
    await expect(page.locator('#practice-sandbox').locator(FLOW)).toHaveCount(0)
    await expect(page.locator('main > #practice-flow')).toHaveCount(0)

    await page.locator(TIPS).click()
    const board = page.locator(TIPS_PANEL).locator(FLOW)
    await expect(board).toBeVisible()
    await expect(board).toContainText('脚手架')

    const steps = board.locator('.learning-flow-step')
    await expect(steps).toHaveCount(3)
    await expect(steps.first()).toHaveAttribute('data-input', 'true')
    await expect(board).toContainText('基础 · 一句话说清框架与语言')
    await expect(board).toContainText('进阶 · 把初始内容和约束一次说全')
    await expect(board).toContainText('对照 · 换个框架，对比差异')
    await expect(steps.locator('button')).toHaveCount(3)
  })

  test('点击流水线步骤：陪练面板自动展开且 tips 收起，提示词填入输入框并聚焦，回车直达 Key 门', async ({
    page,
  }) => {
    await page.locator(TIPS).click()
    const steps = page.locator(`${TIPS_PANEL} ${FLOW} .learning-flow-step`)
    await steps.first().locator('button').click()

    const panel = page.locator(COACH_PANEL)
    await expect(panel).toBeVisible()
    await expect(page.locator(TIPS_PANEL)).toBeHidden()
    await expect(page.locator(COACH_TAB)).toHaveAttribute('aria-expanded', 'true')
    const input = panel.locator('textarea')
    await expect(input).toHaveValue('创建一个 vite 项目，使用 React 和 TypeScript，工程名叫 demo。')
    await expect(input).toBeFocused()

    await input.press('Enter')
    await expect(page.getByRole('heading', { name: '模型接入' })).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()

    await page.keyboard.press('Escape')
    await expect(page.locator(COACH_PANEL)).toBeHidden()

    await page.locator(TIPS).click()
    await steps.nth(2).locator('button').click()
    await expect(input).toHaveValue(
      '创建一个 vite 项目，使用 Vue 和 TypeScript，工程名叫 vue-counter，初始同样带一个点按加一的计数器，同样不要引入 UI 库；建完把文件结构和 React 版的差异讲给我听。',
    )
  })
})

test.describe('练习场 · 主区布局', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('沙箱独占主区，大屏下沙箱栏独立滚动', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const runner = page.locator('section[aria-label="web runner 沙箱预览"]')
    await expect(runner).toBeVisible()
    await expect(runner).toContainText('web runner · 沙箱预览')
    await expect(runner.locator('[data-testid="runtime-status"]')).toBeVisible()
    await expect(runner.locator('[data-testid="sandbox-frame"]')).toHaveCount(1)
    await expect(runner.getByRole('region', { name: '输出' })).toBeVisible()

    const sandboxOverflow = await page
      .locator('#practice-sandbox')
      .evaluate((el) => getComputedStyle(el).overflowY)
    expect(sandboxOverflow, '沙箱栏应是独立滚动容器').toBe('auto')
  })

  test('运行前预览区展示占位说明，iframe 未运行时不显示，编辑器收成固定贴签不占排版', async ({
    page,
  }) => {
    const runner = page.locator('section[aria-label="web runner 沙箱预览"]')
    await expect(runner).toContainText('点右缘「编辑器」')
    await expect(runner.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
    const editor = page.locator('section[aria-label="playground 编辑器"]')
    await expect(editor).toBeHidden()
    await expect(editor).toHaveCSS('position', 'fixed')
  })
})

test.describe('练习场 · 编辑器侧栏（右缘）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('大屏与窄屏默认都收起；点击展开成大区域，Esc 与 ✕ 收起', async ({ page }) => {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      const tab = page.locator(EDITOR_TAB)
      const panel = page.locator(EDITOR_PANEL)
      await expect(tab).toBeVisible()
      await expect(tab).toContainText('playground · 编辑器')
      await expect(tab).toHaveAttribute('aria-expanded', 'false')
      await expect(tab).toHaveAttribute('aria-controls', 'editor-dock-panel')
      await expect(panel).toBeHidden()

      await tab.click()
      await expect(tab).toHaveAttribute('aria-expanded', 'true')
      await expect(panel).toBeVisible()
      await expect(panel).toContainText('playground · 编辑器')
      await expect(panel.getByLabel('项目文件')).toBeVisible()
      await expect(panel.getByLabel('模块代码')).toBeVisible()
      await expect(panel.getByRole('button', { name: '运行 ▶' })).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(tab).toHaveAttribute('aria-expanded', 'false')

      await tab.click()
      await expect(panel).toBeVisible()
      await panel.getByRole('button', { name: '收起编辑器' }).click()
      await expect(panel).toBeHidden()
    }
  })

  test('展开区域比原卡片区更大：大屏面板 ≥520px 宽，内部独立滚动', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.locator(EDITOR_TAB).click()
    const panel = page.locator(EDITOR_PANEL)
    await expect(panel).toBeVisible()
    const panelBox = await panel.boundingBox()
    expect(panelBox?.width ?? 0).toBeGreaterThanOrEqual(520)
    expect(panelBox?.height ?? 0).toBeGreaterThanOrEqual(800)
    const bodyOverflow = await panel
      .locator('> div')
      .last()
      .evaluate((el) => getComputedStyle(el).overflowY)
    expect(bodyOverflow).toBe('auto')
  })
})

test.describe('练习场 · 布局自查', () => {
  test('320/390/768/1280 无横向溢出，清单夹具与 tips 贴签停靠右上、陪练贴签右下、编辑器签右缘', async ({
    page,
  }) => {
    await page.goto('/practice.html')
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `宽度 ${width} 出现 ${overflow}px 横向溢出`).toBe(0)

      const clipBox = await page.locator(CLIP).boundingBox()
      expect(clipBox).not.toBeNull()
      expect(clipBox!.y, `宽度 ${width} 清单夹具距顶缘过大`).toBeLessThanOrEqual(20)
      expect(clipBox!.x, `宽度 ${width} 清单夹具越出左缘`).toBeGreaterThanOrEqual(0)
      expect(clipBox!.x + clipBox!.width, `宽度 ${width} 清单夹具越出右缘`).toBeLessThanOrEqual(
        width,
      )

      const tipsBox = await page.locator(TIPS).boundingBox()
      expect(tipsBox).not.toBeNull()
      expect(tipsBox!.y, `宽度 ${width} tips 贴签距顶缘过大`).toBeLessThanOrEqual(60)
      expect(
        width - (tipsBox!.x + tipsBox!.width),
        `宽度 ${width} tips 贴签越出右缘`,
      ).toBeLessThanOrEqual(24)
      const clearOfClip =
        tipsBox!.y > clipBox!.y + clipBox!.height || tipsBox!.x > clipBox!.x + clipBox!.width
      expect(clearOfClip, `宽度 ${width} tips 贴签与清单夹具重叠`).toBe(true)

      await page.locator(CLIP).click()
      await expect(page.locator(LIST_PANEL)).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.locator(LIST_PANEL)).toBeHidden()

      const coachBox = await page.locator(COACH_TAB).boundingBox()
      expect(coachBox).not.toBeNull()
      expect(
        900 - (coachBox!.y + coachBox!.height),
        `宽度 ${width} 陪练贴签距底缘过大`,
      ).toBeLessThanOrEqual(24)
      expect(
        width - (coachBox!.x + coachBox!.width),
        `宽度 ${width} 陪练贴签距右缘过大`,
      ).toBeLessThanOrEqual(24)

      const editorBox = await page.locator(EDITOR_TAB).boundingBox()
      expect(editorBox).not.toBeNull()
      expect(
        width - (editorBox!.x + editorBox!.width),
        `宽度 ${width} 编辑器签距右缘过大`,
      ).toBeLessThanOrEqual(2)

      await page.locator(EDITOR_TAB).click()
      await expect(page.locator(EDITOR_PANEL)).toBeVisible()
      const panelOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(panelOverflow, `宽度 ${width} 编辑器展开后出现横向溢出`).toBe(0)
      await page.keyboard.press('Escape')
      await expect(page.locator(EDITOR_PANEL)).toBeHidden()

      await page.locator(TIPS).click()
      await expect(page.locator(TIPS_PANEL)).toBeVisible()
      const tipsOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(tipsOverflow, `宽度 ${width} tips 展开后出现横向溢出`).toBe(0)
      await page.keyboard.press('Escape')
      await expect(page.locator(TIPS_PANEL)).toBeHidden()
    }
  })
})
