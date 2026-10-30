import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL: 'http://localhost:4175' },
  webServer: {
    command: 'stack && stack dev --no-watch --port 4175',
    url: 'http://localhost:4175/pages/index.html',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
