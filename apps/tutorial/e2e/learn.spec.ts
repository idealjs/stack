import { expect, test } from '@playwright/test'

test.describe('教程首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learn.html')
  })

  test('成品演示可增删、勾选；空白输入不产生任务，刷新回到示例', async ({ page }) => {
    const demo = page.getByRole('region', { name: '待办应用演示' })
    const input = demo.getByRole('textbox', { name: '新的待办' })
    await expect(demo.getByRole('status')).toHaveText('5 件 · 完成 1')
    await input.fill('   ')
    await input.press('Enter')
    await expect(demo.getByRole('listitem')).toHaveCount(5)
    await input.fill('  散步十分钟  ')
    await input.press('Enter')
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
    const task = demo.getByRole('checkbox', { name: '散步十分钟', exact: true })
    await task.check()
    await expect(demo.getByRole('status')).toHaveText('6 件 · 完成 2')
    await expect(task.locator('+ span')).toHaveCSS('text-decoration-line', 'line-through')
    await task.uncheck()
    await expect(demo.getByRole('status')).toHaveText('6 件 · 完成 1')
    await demo.getByRole('button', { name: '删除散步十分钟', exact: true }).click()
    await expect(task).toHaveCount(0)
    for (const name of [
      '删除读十页书',
      '删除整理房间',
      '删除回复邮件',
      '删除慢跑 30 分钟',
      '删除预约体检',
    ]) {
      await demo.getByRole('button', { name, exact: true }).click()
    }
    await expect(demo.getByRole('status')).toHaveText('0 件 · 完成 0')
    await expect(demo).toContainText('清单空了')
    await page.reload()
    await expect(demo.getByRole('status')).toHaveText('5 件 · 完成 1')
  })

  test('站头恒为完整四行：四个行首与各条目在任何页面不缩减', async ({ page }) => {
    const header = page.locator('main > header')

    for (const label of ['全栈教程', '博客', '设计系统', '在线练习']) {
      await expect(header.getByRole('link', { name: label, exact: true })).toHaveCount(1)
    }

    await expect(header.getByRole('link', { name: '快速开始', exact: true })).toBeVisible()
    await expect(header.getByRole('link', { name: /20\d{2}-\d{2}/ }).first()).toBeVisible()
    await expect(header.getByRole('link', { name: '颜色', exact: true })).toBeVisible()
    await expect(header.getByRole('link', { name: '组件', exact: true })).toBeVisible()
    await expect(header.getByRole('link', { name: '重建中', exact: true })).toBeVisible()
  })

  test('移动端导航抽屉：对称触发器的 aria-expanded 随纯 CSS 开合翻转', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/learn.html')
    const open = page.locator('label[aria-label="打开导航菜单"]')
    const close = page.locator('label[aria-label="收起导航菜单"]')
    const overlay = page.locator('label[for="site-nav-toggle"][aria-hidden="true"]')
    const drawer = page.locator('#site-nav-drawer')

    await expect(open).toBeVisible()
    await expect(open).toHaveAttribute('aria-expanded', 'false')
    await expect(close).toBeHidden()
    await expect(drawer).toBeHidden()
    await open.click()

    await expect(drawer).toBeVisible()
    await expect(open).toBeHidden()
    await expect(close).toBeVisible()
    await expect(close).toHaveAttribute('aria-expanded', 'true')
    await overlay.click({ position: { x: 350, y: 400 } })
    await expect(drawer).toBeHidden()
    await expect(open).toBeVisible()
    await expect(open).toHaveAttribute('aria-expanded', 'false')
  })

  test('技术用途直接可读，键盘能展开详情并使用实际学习入口', async ({ page }) => {
    const toolbox = page.locator('[data-comp="brick-toolbox"]')
    const tray = toolbox.locator('.learning-toolbox-tray')
    await expect(toolbox).toContainText('项目里的技术积木')
    await expect(tray).toBeHidden()
    const fold = toolbox.locator('summary.learning-toolbox-header')
    await fold.focus()
    await fold.press('Enter')
    await expect(tray).toBeVisible()
    const html = toolbox.locator('details.learning-brick').first()
    await expect(html.getByText('描述网页结构的标记语言。', { exact: false })).toBeHidden()
    await html.locator('summary').focus()
    await html.locator('summary').press('Enter')
    await expect(html.getByText('描述网页结构的标记语言。', { exact: false })).toBeVisible()
    await html.locator('summary').press('Enter')
    await expect(html.locator('dl')).toBeHidden()
    await page.getByRole('link', { name: '从第一个网页开始' }).click()
    await expect(page).toHaveURL(/\/ch1\.html$/)
    await expect(page.getByRole('heading', { name: /快速开始/ }).first()).toBeVisible()
  })

  for (const width of [320, 390, 768, 1280]) {
    test(`概览及展开内容在 ${width}px 下可完整阅读`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.locator('[data-comp="brick-toolbox"] summary').first().click()
      await page
        .locator('[data-comp="brick-toolbox"] details.learning-brick summary')
        .first()
        .click()
      const input = page.getByRole('textbox', { name: '新的待办' })
      await input.fill('LongUnbrokenTodo'.repeat(5))
      await input.press('Enter')
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        content: [
          ...document.querySelectorAll(
            '.learn-top, .learning-flow, .learning-brick, .learning-comparison-page',
          ),
        ].map((element) => {
          const rect = element.getBoundingClientRect()
          return { left: rect.left, right: rect.right }
        }),
      }))
      expect(dimensions.document).toBe(dimensions.viewport)
      expect(dimensions.content.filter((rect) => rect.left < 0 || rect.right > width)).toEqual([])

      const tops = await page.evaluate(() => {
        const top = (selector: string) => {
          const element = document.querySelector(selector)
          return element ? element.getBoundingClientRect().top + scrollY : Number.NaN
        }
        return [
          '.learn-preview',
          '.learn-copy',
          '.learn-actions',
          '.learn-core',
          '.learn-time',
        ].map(top)
      })
      if (width >= 768) {
        const [preview, copy, actions, core, note] = tops
        expect(preview).toBeLessThan(copy)
        expect(actions).toBeGreaterThan(copy)
        expect(Math.abs(note - copy)).toBeLessThanOrEqual(1)
        expect(core).toBeGreaterThan(actions)
      } else {
        expect(tops).toEqual([...tops].sort((a, b) => a - b))
      }
    })
  }

  test('新手引导：添加→搜索→勾选→删除全程气泡内操作，动作即时响应，可关闭跳过', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/learn.html')
    const trigger = page.getByRole('button', { name: /30 秒上手这个待办应用/ })
    const tooltip = page.locator('.react-joyride__tooltip')
    const demo = page.getByRole('region', { name: '待办应用演示' })

    await trigger.click()
    await expect(tooltip).toContainText('先别急着读文字')
    await page.getByRole('button', { name: '跳过' }).click()
    await expect(page.locator('.react-joyride__tooltip')).toHaveCount(0)

    await trigger.click()
    await expect(tooltip).toContainText('先别急着读文字')
    await page.getByRole('button', { name: '关闭引导' }).click()
    await expect(page.locator('.react-joyride__tooltip')).toHaveCount(0)

    await trigger.click()
    await expect(tooltip).toContainText('先别急着读文字')
    await page.getByRole('button', { name: '开始体验' }).click()
    await expect(tooltip).toContainText('增：点下面按钮，把「买牛奶」填入输入框')
    await expect(demo.getByRole('textbox', { name: '新的待办' })).toBeFocused()
    await page.getByRole('button', { name: /填入「买牛奶」/ }).click()
    await expect(demo.getByRole('textbox', { name: '新的待办' })).toHaveValue('买牛奶')
    await page.waitForTimeout(100)
    await expect(tooltip).toContainText('把输入框里的待办加入清单')
    await tooltip.getByRole('button', { name: '加入清单', exact: true }).click()
    await expect(demo.getByRole('listitem')).toHaveCount(6)
    await page.waitForTimeout(100)
    await expect(tooltip).toContainText('查：点下面按钮，自动填入关键字「牛奶」')
    await expect(demo.getByRole('textbox', { name: '搜索待办' })).toBeFocused()

    await page.getByRole('button', { name: /填入「牛奶」/ }).click()
    await expect(demo.getByRole('textbox', { name: '搜索待办' })).toHaveValue('牛奶')
    await expect(demo.getByRole('textbox', { name: '搜索待办' })).not.toBeFocused()
    await expect(page.locator('.learn-todo-items li')).toHaveCount(1)
    await page.waitForTimeout(100)
    await expect(tooltip).toContainText('改：点下面按钮，勾选「买牛奶」')

    await page.getByRole('button', { name: /勾选「买牛奶」/ }).click()
    await expect(demo.getByRole('status')).toHaveText('6 件 · 完成 2')
    await page.waitForTimeout(100)
    await expect(tooltip).toContainText('删：点下面按钮，把「买牛奶」从清单里删掉')

    await page.getByRole('button', { name: /删除「买牛奶」/ }).click()
    await expect(tooltip).toContainText('件数和完成数都实时变化')
    await expect(demo.getByRole('status')).toHaveText('5 件 · 完成 1')

    await page.getByRole('button', { name: '完成', exact: true }).click()
    await expect(page.locator('.react-joyride__tooltip')).toHaveCount(0)
    await expect(page.getByText('先别急着读文字')).toBeHidden()
  })

  test('新手引导：绕过气泡按钮手动操作待办，每一步仍可推进不卡死', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/learn.html')
    const trigger = page.getByRole('button', { name: /30 秒上手这个待办应用/ })
    const tooltip = page.locator('.react-joyride__tooltip')
    const demo = page.getByRole('region', { name: '待办应用演示' })

    await trigger.click()
    await expect(tooltip).toContainText('先别急着读文字')
    const input = demo.getByRole('textbox', { name: '新的待办' })
    await input.fill('深呼吸')
    await input.press('Enter')
    await expect(demo.getByRole('listitem')).toHaveCount(6)
    await demo.getByRole('button', { name: '删除整理房间', exact: true }).click()
    await expect(demo.getByRole('listitem')).toHaveCount(5)
    await expect(tooltip).toContainText('先别急着读文字')

    await page.getByRole('button', { name: '开始体验' }).click()
    await expect(tooltip).toContainText('增：点下面按钮，把「买牛奶」填入输入框')
    await expect(input).toBeFocused()
    await input.fill('买牛奶')
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('已加入清单！数据变了，界面立刻跟上')
    await demo.getByRole('button', { name: '添加待办', exact: true }).click()
    await expect(demo.getByRole('listitem')).toHaveCount(6)
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('查：点下面按钮，自动填入关键字「牛奶」')
    await expect(demo.getByRole('textbox', { name: '搜索待办' })).toBeFocused()
    await demo.getByRole('textbox', { name: '搜索待办' }).fill('深呼吸')
    await expect(page.locator('.learn-todo-items li')).toHaveCount(1)
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('改：点下面按钮，勾选「买牛奶」')
    await expect(demo.getByRole('textbox', { name: '搜索待办' })).toHaveValue('')

    await demo.getByRole('checkbox', { name: '买牛奶', exact: true }).check()
    await expect(demo.getByRole('status')).toHaveText('6 件 · 完成 2')
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('删：点下面按钮，把「买牛奶」从清单里删掉')

    await demo.getByRole('button', { name: '删除买牛奶', exact: true }).click()
    await expect(tooltip).toContainText('件数和完成数都实时变化')
    await expect(demo.getByRole('status')).toHaveText('5 件 · 完成 1')

    await page.getByRole('button', { name: '完成', exact: true }).click()
    await expect(page.locator('.react-joyride__tooltip')).toHaveCount(0)
  })

  test('新手引导：开场就删光待办，改删两步自动跳过直达总结不卡死', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/learn.html')
    const trigger = page.getByRole('button', { name: /30 秒上手这个待办应用/ })
    const tooltip = page.locator('.react-joyride__tooltip')
    const demo = page.getByRole('region', { name: '待办应用演示' })

    await trigger.click()
    await expect(tooltip).toContainText('先别急着读文字')
    for (const name of [
      '删除读十页书',
      '删除整理房间',
      '删除回复邮件',
      '删除慢跑 30 分钟',
      '删除预约体检',
    ]) {
      await demo.getByRole('button', { name, exact: true }).click()
    }
    await expect(demo).toContainText('清单空了')

    await page.getByRole('button', { name: '开始体验' }).click()
    await expect(tooltip).toContainText('增：点下面按钮，把「买牛奶」填入输入框')
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('把输入框里的待办加入清单')
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('查：点下面按钮，自动填入关键字「牛奶」')
    await expect(demo.getByRole('textbox', { name: '搜索待办' })).toBeFocused()
    await page.getByRole('button', { name: '下一步' }).click()
    await expect(tooltip).toContainText('件数和完成数都实时变化')
    await expect(demo.getByRole('status')).toHaveText('0 件 · 完成 0')

    await page.getByRole('button', { name: '完成', exact: true }).click()
    await expect(page.locator('.react-joyride__tooltip')).toHaveCount(0)
  })

  test('待办演示：搜索实时过滤，可一键清空，无匹配时给出提示', async ({ page }) => {
    await page.goto('/learn.html')
    const search = page.getByRole('textbox', { name: '搜索待办' })
    await search.fill('房间')
    await expect(page.locator('.learn-todo-items li')).toHaveCount(1)
    await expect(page.locator('.learn-todo-items li')).toContainText('整理房间')
    await page.getByRole('button', { name: '清空搜索' }).click()
    await expect(search).toHaveValue('')
    await expect(page.locator('.learn-todo-items li')).toHaveCount(5)
    await search.fill('不存在的待办')
    await expect(page.locator('.learn-todo-empty')).toContainText('没有匹配的待办')
    await search.fill(' ')
    await expect(page.locator('.learn-todo-items li')).toHaveCount(5)
  })
})
