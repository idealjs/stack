// /tmp 常有配额限制：Chromium 子进程写临时 profile 失败会以 session closed 崩溃，
// 统一重定向到用户缓存盘（与 tutorial 同源的教训）
process.env.TMPDIR ??= `${process.env.HOME}/.cache/pw-tmp`
import { mkdirSync } from 'node:fs'
mkdirSync(process.env.TMPDIR, { recursive: true })

import { defineConfig, devices } from '@playwright/test'

/**
 * Playground E2E（自带独立 preview 端口，不依赖 tutorial 的服务）：
 * - 沙箱安全契约：iframe sandbox 仅 allow-scripts、运行时与宿主不同源（srcdoc 退化路径
 *   断言 opaque 证据）、postMessage 协议版本字段
 * - hello world：预置示例经 Blob URL + import() 执行，输出面板可见
 * 默认走 srcdoc 退化路径（构建不设 VITE_PLAYGROUND_RUNTIME_ORIGIN），无额外常驻进程。
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1, // 与 tutorial 同款：串行换稳定
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4493',
    contextOptions: { reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } },
  },
  webServer: {
    command: 'yarn preview --port 4493 --strictPort',
    url: 'http://localhost:4493/index.html',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
