process.env.TMPDIR ??= `${process.env.HOME}/.cache/pw-tmp`
import { mkdirSync } from 'node:fs'
mkdirSync(process.env.TMPDIR, { recursive: true })

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1, // 并行全页截图在 headless-shell 下偶发 runtime 崩溃，串行换稳定
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4491',

    contextOptions: { reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } },
  },
  webServer: {
    command: 'yarn preview --port 4491 --strictPort',
    url: 'http://localhost:4491/index.html',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
