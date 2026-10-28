import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL: 'http://localhost:5901' },
  webServer: {
    command: 'node bin/stack.mjs dev --config stack.config.ts --port 5901',
    url: 'http://localhost:5901/browser/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
