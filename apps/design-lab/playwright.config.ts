import { defineConfig, devices } from '@playwright/test'

/**
 * 设计系统 E2E：防止后续改动出现画面偏差。
 * - pages.spec：结构契约断言（规格级：描边/投影/比例/半嵌坐标）
 * - visual.spec：整页截图基线（像素级回归）
 * 截图基线在 e2e/__screenshots__/，需随代码一起提交；
 * 有意的设计变更请运行 `yarn test:e2e -- --update-snapshots` 后提交新基线。
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4490',
    // 卡片尊重 prefers-reduced-motion：翻转关闭、动画停用，截图才稳定
    contextOptions: { reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } },
  },
  webServer: {
    command: 'yarn preview --port 4490 --strictPort',
    url: 'http://localhost:4490/index.html',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
