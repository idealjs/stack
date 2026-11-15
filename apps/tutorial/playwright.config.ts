process.env.TMPDIR ??= `${process.env.HOME}/.cache/pw-tmp`

import { mkdirSync } from 'node:fs'

mkdirSync(process.env.TMPDIR, { recursive: true })

import { defineConfig, devices } from '@playwright/test'

const previewPort = Number(process.env.PW_PREVIEW_PORT ?? 9910)

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1, // 并行全页截图在 headless-shell 下偶发 runtime 崩溃，串行换稳定
  fullyParallel: true,
  use: {
    baseURL: `http://localhost:${previewPort}`,

    contextOptions: { reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } },
  },
  webServer: [
    {
      command: `export VITE_STACK_RUNTIME_ORIGIN=http://localhost:9912 && yarn build && yarn stack preview --port ${previewPort}`,
      url: `http://localhost:${previewPort}/index.html`,
      reuseExistingServer: true,
      timeout: 300_000,
    },
    {
      command:
        'yarn workspace @stack/web-runner build:runtime && yarn workspace @stack/web-runner exec stack preview --port 9912',
      url: 'http://localhost:9912/',
      reuseExistingServer: true,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
