import { expect, test } from '@playwright/test'

test.describe('教程首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learn.html')
  })

  test('成品演示可增删、勾选；空白输入不产生任务，刷新回到示例', async ({ page }) => {
    const demo = page.getByRole('group', { name: '待办应用演示' })
    const input = demo.getByRole('textbox', { name: '新的待办' })
    await expect(demo.getByRole('status')).toHaveText('2 件 · 完成 1')
    await input.fill('   ')
    await input.press('Enter')
    await expect(demo.getByRole('listitem')).toHaveCount(2)
    await input.fill('  散步十分钟  ')
    await input.press('Enter')
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
    const task = demo.getByRole('checkbox', { name: '散步十分钟', exact: true })
    await task.check()
    await expect(demo.getByRole('status')).toHaveText('3 件 · 完成 2')
    await expect(task.locator('+ span')).toHaveCSS('text-decoration-line', 'line-through')
    await task.uncheck()
    await expect(demo.getByRole('status')).toHaveText('3 件 · 完成 1')
    await demo.getByRole('button', { name: '删除散步十分钟', exact: true }).click()
    await expect(task).toHaveCount(0)
    await demo.getByRole('button', { name: '删除读十页书', exact: true }).click()
    await demo.getByRole('button', { name: '删除买牛奶', exact: true }).click()
    await expect(demo.getByRole('status')).toHaveText('0 件 · 完成 0')
    await expect(demo).toContainText('清单空了')
    await page.reload()
    await expect(demo.getByRole('status')).toHaveText('2 件 · 完成 1')
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
    await close.click()
    await expect(drawer).toBeHidden()
    await expect(open).toBeVisible()
    await expect(open).toHaveAttribute('aria-expanded', 'false')
  })

  test('技术用途直接可读，键盘能展开详情并使用实际学习入口', async ({ page }) => {
    const toolbox = page.locator('[data-comp="brick-toolbox"]')
    await expect(toolbox).toContainText('搭出输入框、列表和按钮。')
    const html = toolbox.locator('details').first()
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
          '.learn-copy',
          '.learn-actions',
          '.learn-preview',
          '.learn-core',
          '.learn-time',
        ].map(top)
      })
      if (width >= 768) {
        const [copy, actions, preview, core, note] = tops
        expect(Math.abs(copy - preview)).toBeLessThanOrEqual(1)
        expect(actions).toBeGreaterThan(copy)
        expect(Math.abs(core - note)).toBeLessThanOrEqual(1)
        expect(core).toBeGreaterThan(actions)
      } else {
        expect(tops).toEqual([...tops].sort((a, b) => a - b))
      }

      if (width >= 768) {
        const edges = await page.evaluate(() => {
          const right = (selector: string) => {
            const element = document.querySelector(selector)
            return element ? element.getBoundingClientRect().right : Number.NaN
          }
          return { preview: right('.learn-preview'), note: right('.learn-time') }
        })
        expect(Math.abs(edges.preview - edges.note)).toBeLessThanOrEqual(1)
      }
    })
  }
})
