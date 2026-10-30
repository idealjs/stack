import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL: 'http://localhost:4174' },
  webServer: {
    command: 'stack && stack dev --no-watch --port 4174',
    url: 'http://localhost:4174/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
