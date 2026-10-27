const { chromium } = require('@playwright/test')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/absproxy/5173/practice.html')
  await page.waitForTimeout(5000)
  const status = await page.getByTestId('runtime-status').textContent()
  console.log('runtime-status:', status)
  await browser.close()
})().catch((e) => {
  console.error('ERR:', e.message.slice(0, 150))
  process.exit(1)
})
