import { expect, test } from '@playwright/test'

/**
 * Playground 沙箱契约（默认 srcdoc 退化路径，无额外常驻进程）：
 * 1. iframe sandbox＝"allow-scripts"，绝不含 allow-same-origin 等放权位；
 * 2. 宿主与运行时不同源——经协议 ready 消息回传 opaque 证据（origin "null"＋父窗口访问阻断）；
 * 3. 运行预置示例后输出面板出现 hello, playground；
 * 4. 宿主收到的每条协议消息都带版本字段 v=1。
 */

/** 每次导航前注入消息嗅探器：协议 v1 消息只经 postMessage 进宿主窗口，init script
 * 先于页面脚本挂上监听，自发 ready 一条不漏；捕获数组挂 window 供断言回收。 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __protoMsgs: Record<string, unknown>[] }
    w.__protoMsgs = []
    window.addEventListener('message', (event) => {
      const d = event.data as Record<string, unknown> | null
      if (!d || typeof d !== 'object') return
      w.__protoMsgs.push({ v: d.v, type: d.type, origin: d.origin, parentBlocked: d.parentBlocked })
    })
  })
  await page.goto('/index.html')
  // 运行时 ready 报到后状态条才回填（宿主 ping 兜底，启动竞态已收敛为确定性问答）
  await expect(page.getByTestId('runtime-status')).toContainText('父窗口访问已阻断')
})

const readMsgs = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    (window as unknown as { __protoMsgs: { v: number; type: string; origin?: string; parentBlocked?: boolean }[] })
      .__protoMsgs,
  )

test('沙箱 iframe 只有 allow-scripts，不含任何放权位', async ({ page }) => {
  const frame = page.getByTestId('sandbox-frame')
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts')
  const sandbox = (await frame.getAttribute('sandbox')) ?? ''
  for (const forbidden of ['allow-same-origin', 'allow-top-navigation', 'allow-popups', 'allow-forms', 'allow-modals']) {
    expect(sandbox).not.toContain(forbidden)
  }
})

test('运行时与宿主不同源：ready 消息回传 opaque 证据（origin "null"＋父窗口阻断）', async ({ page }) => {
  // 状态条即 ready 消息的渲染（beforeEach 已断言阻断）；这里再核协议字段本身
  await expect(page.getByTestId('runtime-status')).toContainText('null（opaque origin，srcdoc 退化）')
  const ready = (await readMsgs(page)).find((m) => m.type === 'ready')
  expect(ready).toBeTruthy()
  expect(ready!.v).toBe(1)
  expect(ready!.origin).toBe('null')
  expect(ready!.parentBlocked).toBe(true)
})

test('运行 hello world：输出面板出现预期文本，done 收尾', async ({ page }) => {
  await page.getByRole('button', { name: '运行 ▶' }).click()
  const output = page.getByRole('region', { name: '输出' })
  await expect(output).toContainText('hello, playground')
  await expect(output).toContainText('执行完毕')
})

test('协议消息全部带版本字段 v=1', async ({ page }) => {
  await page.getByRole('button', { name: '运行 ▶' }).click()
  await expect(page.getByRole('region', { name: '输出' })).toContainText('hello, playground')
  const msgs = await readMsgs(page)
  expect(msgs.length).toBeGreaterThan(0)
  for (const m of msgs) {
    expect(m.v).toBe(1)
    expect(['ready', 'console', 'error', 'done']).toContain(m.type)
  }
  expect(msgs.some((m) => m.type === 'console')).toBe(true)
  expect(msgs.some((m) => m.type === 'done')).toBe(true)
})
