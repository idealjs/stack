import { expect, test } from '@playwright/test'

const TAB = '[data-comp="coach-sticky"]'
const PANEL = '#coach-sticky-panel'
const ENVELOPE = '[data-comp="task-envelope"]'
const CHECKLIST = '[data-comp="clipboard-checklist"]'

test.describe('练习场 · 陪练 agent 便签', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('折叠态停靠右下角，aria 关系正确；点击展开、再点与 Esc 收起', async ({ page }) => {
    const tab = page.locator(TAB)
    await expect(tab).toBeVisible()
    await expect(tab).toContainText('陪练 agent')
    await expect(tab).toContainText('react-starter')
    await expect(tab).toHaveAttribute('aria-expanded', 'false')
    await expect(tab).toHaveAttribute('aria-controls', 'coach-sticky-panel')
    await expect(page.locator(PANEL)).toBeHidden()

    await tab.click()
    await expect(tab).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('陪练 agent')

    await tab.click()
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(tab).toHaveAttribute('aria-expanded', 'false')

    await tab.click()
    await expect(page.locator(PANEL)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(tab).toHaveAttribute('aria-expanded', 'false')
  })

  test('展开后可见当前任务 opener，复制/发给陪练动作在场', async ({ page }) => {
    const tab = page.locator(TAB)
    await expect(page.getByTestId('coach-opener')).toBeHidden()
    await tab.click()
    const opener = page.getByTestId('coach-opener')
    await expect(opener).toBeVisible()
    await expect(opener).toContainText('开场提示词')
    await expect(opener).toContainText('自我介绍卡')
    await expect(opener.getByRole('button', { name: '复制' })).toBeVisible()
    const sendOpener = opener.getByRole('button', { name: '发给陪练' })
    await expect(sendOpener).toBeVisible()
    await expect(sendOpener).toBeEnabled()
    await sendOpener.click()
    await expect(page.getByRole('presentation')).toContainText('模型接入')
  })
})

test.describe('练习场 · 任务卡拟物组件', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('任务信封：封面为任务名与摘要，拆开可见与 TASK.md 同源的完整任务', async ({ page }) => {
    const envelope = page.locator(ENVELOPE)
    await expect(envelope).toContainText('练习任务 · 我的自我介绍卡')
    await expect(envelope.locator('summary')).toContainText('TO / 你的 Agent')
    const letter = envelope.locator('.learning-envelope-letter')
    await expect(letter).toBeHidden()
    await envelope.locator('summary').click()
    await expect(letter).toBeVisible()
    await expect(letter).toContainText('# 练习任务 · 我的自我介绍卡')
    await expect(letter).toContainText('## 验收清单')
    await expect(letter).toContainText('预览页大标题显示名字')
    await envelope.locator('summary').click()
    await expect(letter).toBeHidden()
  })

  test('夹板清单：条目来自任务卡，全勾盖章、取消撤章', async ({ page }) => {
    const checklist = page.locator(CHECKLIST)
    await expect(checklist).toContainText('已核对 0 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)
    await checklist.getByRole('checkbox', { name: '预览页大标题显示名字' }).check()
    await checklist.getByRole('checkbox', { name: '介绍恰好 3 行' }).check()
    await checklist
      .getByRole('checkbox', { name: '只改了 src/App.tsx（可以让 agent 展示改动内容）' })
      .check()
    await expect(checklist).toContainText('已核对 3 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveText('✓已核对')
    await checklist.getByRole('checkbox', { name: '介绍恰好 3 行' }).uncheck()
    await expect(checklist).toContainText('已核对 2 / 3')
    await expect(checklist.locator('[data-comp="stamp"]')).toHaveCount(0)
  })
})

test.describe('练习场 · 创建项目板块', () => {
  const SECTION = '[data-testid="create-project"]'
  const SENTENCE = '创建一个 vite 项目，使用'
  const IDS = ['basic', 'counter', 'compare']

  test.beforeEach(async ({ page }) => {
    await page.goto('/practice.html')
  })

  test('板块在场：标题 + 教学文案（四要素加粗词）+ 文件夹页签；三条示例都在 DOM 且同句式', async ({
    page,
  }) => {
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await expect(section.locator('h2')).toContainText('创建项目')
    await expect(section).toContainText('下一步——让 agent 从零建一个工程')
    for (const word of ['脚手架', '框架与语言', '有什么', '约束']) {
      await expect(section.locator('p').filter({ hasText: word }).first()).toBeVisible()
    }

    const prompts = section.locator('[data-testid^="create-prompt-"]')
    await expect(prompts).toHaveCount(3)

    for (const id of IDS) {
      await expect(page.getByTestId(`create-prompt-${id}`)).toContainText(SENTENCE)
    }

    await expect(page.getByTestId('create-prompt-basic')).toBeVisible()
    await expect(page.getByTestId('create-prompt-counter')).toBeHidden()
    await expect(page.getByTestId('create-prompt-compare')).toBeHidden()
  })

  test('逐条示例：页签切换后复制/发给陪练在场，发送保持可用', async ({ page }) => {
    const section = page.locator(SECTION)
    const tabs = section.getByRole('tab')
    await expect(tabs).toHaveCount(3)

    for (let i = 0; i < IDS.length; i++) {
      await tabs.nth(i).click()
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true')
      const strip = page.getByTestId(`create-prompt-${IDS[i]}`)
      await expect(strip).toBeVisible()
      await expect(strip).toContainText(SENTENCE)
      await expect(strip.getByRole('button', { name: '复制' })).toBeVisible()
      const send = strip.getByRole('button', { name: '发给陪练' })
      await expect(send).toBeVisible()
      await expect(send).toBeEnabled()
    }

    await tabs.nth(0).click()
    await tabs.nth(0).press('ArrowRight')
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByTestId('create-prompt-counter')).toBeVisible()
  })

  test('复制动作可用：点击后按钮进入「已复制」态', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-write'])
    const strip = page.getByTestId('create-prompt-basic')
    await strip.getByRole('button', { name: '复制' }).click()
    await expect(strip.getByRole('button', { name: '已复制' })).toBeVisible()
  })
})

test.describe('练习场 · 布局自查', () => {
  test('320/390/768/1280 无横向溢出，便签停靠不压说明条', async ({ page }) => {
    await page.goto('/practice.html')
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `宽度 ${width} 出现 ${overflow}px 横向溢出`).toBe(0)
      await page.locator(TAB).click()
      await expect(page.locator(PANEL)).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.locator(PANEL)).toBeHidden()

      const tabBox = await page.locator(TAB).boundingBox()
      expect(tabBox).not.toBeNull()
      expect(
        900 - (tabBox!.y + tabBox!.height),
        `宽度 ${width} 便签距底缘过大`,
      ).toBeLessThanOrEqual(24)
      expect(
        width - (tabBox!.x + tabBox!.width),
        `宽度 ${width} 便签距右缘过大`,
      ).toBeLessThanOrEqual(24)
    }
  })
})
