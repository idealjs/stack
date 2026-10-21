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
  webServer: [
    {
      command:
        'VITE_PLAYGROUND_RUNTIME_ORIGIN=http://localhost:5175 yarn build && yarn preview --port 4491 --strictPort',
      url: 'http://localhost:4491/index.html',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'yarn workspace @stack/playground dev:runtime --port 5175',
      url: 'http://localhost:5175/',
      reuseExistingServer: true,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
