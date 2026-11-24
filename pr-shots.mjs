import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const OUT_DIR = process.argv[2]
const BASE_URL = process.argv[3]
mkdirSync(OUT_DIR, { recursive: true })

const PAGES = [
  { name: 'index', path: '/index.html', fullPage: false },
  { name: 'design-components', path: '/design/components.html', fullPage: true },
  { name: 'learn', path: '/learn.html', fullPage: true },
]

const browser = await chromium.launch()
for (const target of PAGES) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  })
  await page.goto(`${BASE_URL}${target.path}`)
  await page.addStyleTag({
    content:
      '[data-scroll-root]{max-height:none!important;overflow:visible!important;height:auto!important}',
  })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT_DIR}/${target.name}.png`, fullPage: target.fullPage })
  await page.context().close()
  console.log('shot', target.name)
}
await browser.close()
