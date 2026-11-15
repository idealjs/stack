import { chromium } from '@playwright/test'
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:8910/absproxy/8910/practice/')
  await page.waitForTimeout(5000)
  const status = await page.getByTestId('runtime-status').textContent()
  console.log('runtime-status:', status)
  await browser.close()
})().catch((e) => {
  console.error('ERR:', e.message.slice(0, 150))
  process.exit(1)
})
