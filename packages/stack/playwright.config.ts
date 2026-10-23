import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL: 'http://localhost:5901' },
  webServer: {
    command: 'npx vite browser --port 5901 --strictPort',
    url: 'http://localhost:5901/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
