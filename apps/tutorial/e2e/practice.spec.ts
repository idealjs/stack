import { expect, test } from '@playwright/test'

const COACH_TAB = '[data-comp="coach-sticky"]'
const COACH_PANEL = '#coach-sticky-panel'
const CLIP = '[data-comp="checklist-clip"]'
const LIST_PANEL = '#checklist-dock-panel'
const CHECKLIST = '[data-comp="clipboard-checklist"]'
const FLOW = '[data-comp="data-flow-board"]'

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

  test('夹具纸条徽标实时显示核对进度，全勾盖章、取消撤章', async ({ page }) => {
    const clip = page.locator(CLIP)
    await expect(clip).toContainText('0/3')
    await clip.click()
    const panel = page.locator(LIST_PANEL)
    const checklist = panel.locator(CHECKLIST)
    await expect(checklist).toContainText('已核对 0 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)

    await checklist.getByRole('checkbox', { name: '预览页大标题显示名字' }).check()
    await expect(clip).toContainText('1/3')
    await checklist.getByRole('checkbox', { name: '介绍恰好 3 行' }).check()
    await checklist
      .getByRole('checkbox', { name: '只改了 src/App.tsx（可以让 agent 展示改动内容）' })
      .check()
    await expect(checklist).toContainText('已核对 3 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveText('✓已核对')
    await expect(clip).toContainText('3/3')

    await checklist.getByRole('checkbox', { name: '介绍恰好 3 行' }).uncheck()
    await expect(checklist).toContainText('已核对 2 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)
    await expect(clip).toContainText('2/3')
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

test.describe('练习场 · 右栏教程文本', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('练习任务区：标题、场景与预期以纯文本呈现，不再使用信封', async ({ page }) => {
    const brief = page.locator('#practice-brief')
    await expect(brief).toBeVisible()
    await expect(brief.locator('h2')).toContainText('练习任务 · 我的自我介绍卡')
    await expect(brief).toContainText('这是你第一次「指挥 agent」')
    await expect(brief).toContainText('预期：')
    await expect(brief).toContainText('大标题显示一个名字')
    await expect(page.locator('[data-comp="task-envelope"]')).toHaveCount(0)
  })

  test('操作流水线：数据流水线板在场，三步同源示例提示词，第一步为虚线起点', async ({ page }) => {
    const section = page.locator('#practice-flow')
    await expect(section.locator('h2')).toContainText('操作流水线')
    await expect(section).toContainText('脚手架')

    const board = section.locator(FLOW)
    await expect(board).toBeVisible()
    const steps = board.locator('.learning-flow-step')
    await expect(steps).toHaveCount(3)
    await expect(steps.first()).toHaveAttribute('data-input', 'true')
    await expect(board).toContainText('基础 · 一句话说清框架与语言')
    await expect(board).toContainText('进阶 · 把初始内容和约束一次说全')
    await expect(board).toContainText('对照 · 换个框架，对比差异')
    await expect(steps.locator('button')).toHaveCount(3)
  })

  test('点击流水线步骤：陪练面板自动展开，提示词填入输入框并聚焦，回车直达 Key 门', async ({
    page,
  }) => {
    const steps = page.locator(`${FLOW} .learning-flow-step`)
    await steps.first().locator('button').click()

    const panel = page.locator(COACH_PANEL)
    await expect(panel).toBeVisible()
    await expect(page.locator(COACH_TAB)).toHaveAttribute('aria-expanded', 'true')
    const input = panel.locator('textarea')
    await expect(input).toHaveValue('创建一个 vite 项目，使用 React 和 TypeScript，工程名叫 demo。')
    await expect(input).toBeFocused()

    await input.press('Enter')
    await expect(page.getByRole('heading', { name: '模型接入' })).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()

    await page.keyboard.press('Escape')
    await expect(page.locator(COACH_PANEL)).toBeHidden()
    await steps.nth(2).locator('button').click()
    await expect(input).toHaveValue(
      '创建一个 vite 项目，使用 Vue 和 TypeScript，工程名叫 vue-counter，初始同样带一个点按加一的计数器，同样不要引入 UI 库；建完把文件结构和 React 版的差异讲给我听。',
    )
  })
})

test.describe('练习场 · 左栏沙箱布局', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('web runner 在上、playground 编辑器在下，各自成卡', async ({ page }) => {
    const runner = page.locator('section[aria-label="web runner 沙箱预览"]')
    const editor = page.locator('section[aria-label="playground 编辑器"]')
    await expect(runner).toBeVisible()
    await expect(runner).toContainText('web runner · 沙箱预览')
    await expect(runner.locator('[data-testid="runtime-status"]')).toBeVisible()
    await expect(runner.locator('[data-testid="sandbox-frame"]')).toHaveCount(1)
    await expect(runner.getByRole('region', { name: '输出' })).toBeVisible()

    await expect(editor).toBeVisible()
    await expect(editor).toContainText('playground · 编辑器')
    await expect(editor.getByLabel('模块代码')).toBeVisible()
    await expect(editor.getByRole('button', { name: '运行 ▶' })).toBeVisible()

    const runnerBox = await runner.boundingBox()
    const editorBox = await editor.boundingBox()
    expect(runnerBox && editorBox ? editorBox.y : 0).toBeGreaterThan(
      runnerBox ? runnerBox.y + runnerBox.height : 0,
    )
  })

  test('运行前预览区展示占位说明，iframe 未运行时不显示', async ({ page }) => {
    const runner = page.locator('section[aria-label="web runner 沙箱预览"]')
    await expect(runner).toContainText('在下方编辑器点「运行 ▶」')
    await expect(runner.locator('[data-testid="sandbox-frame"]')).not.toBeVisible()
  })
})

test.describe('练习场 · 布局自查', () => {
  test('320/390/768/1280 无横向溢出，清单夹具停靠右上、陪练贴签停靠右下', async ({ page }) => {
    await page.goto('/practice.html')
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `宽度 ${width} 出现 ${overflow}px 横向溢出`).toBe(0)

      const clipBox = await page.locator(CLIP).boundingBox()
      expect(clipBox).not.toBeNull()
      expect(clipBox!.y, `宽度 ${width} 清单夹具距顶缘过大`).toBeLessThanOrEqual(12)
      expect(clipBox!.x, `宽度 ${width} 清单夹具越出左缘`).toBeGreaterThanOrEqual(0)
      expect(clipBox!.x + clipBox!.width, `宽度 ${width} 清单夹具越出右缘`).toBeLessThanOrEqual(
        width,
      )

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
    }
  })
})
