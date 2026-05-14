import { chromium } from 'playwright'
import { join, resolve, dirname } from 'path'
import { mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', '..', '.tmp-test', 'mobile-screenshots')
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/hp/AppData/Local/ms-playwright/chromium-1117/chrome-win/chrome.exe',
})
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
const page = await ctx.newPage()
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
await page.waitForTimeout(2000)
// Slowly scroll, animations fire
for (let y = 0; y <= 8000; y += 600) {
  await page.evaluate(yy => window.scrollTo({ top: yy, behavior: 'instant' }), y)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(OUT, `R-landing-y${String(y).padStart(4,'0')}.png`), fullPage: false })
}
await browser.close()
console.log('done')
