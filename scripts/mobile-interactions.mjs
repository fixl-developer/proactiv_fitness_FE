import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', '..', '.tmp-test', 'mobile-screenshots')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/hp/AppData/Local/ms-playwright/chromium-1117/chrome-win/chrome.exe',
})
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
await ctx.route('**/api/v1/**', r => r.abort())
await ctx.route('**://api.proactiv*/**', r => r.abort())

const b64u = (s) => Buffer.from(s).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const token = `${b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64u(JSON.stringify({
  sub: 'test', exp: Math.floor(Date.now()/1000)+86400, iat: Math.floor(Date.now()/1000)
}))}.sig`

await ctx.addInitScript(({ token }) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify({
    _id: 'test-admin', name: 'Admin Test', firstName: 'Admin', lastName: 'Test',
    email: 'admin@test.com', role: 'ADMIN'
  }))
  localStorage.setItem('lastActivity', Date.now().toString())
}, { token })

const page = await ctx.newPage()

// 1. Admin dashboard — open the mobile sidebar drawer and screenshot
console.log('→ Test: admin sidebar drawer')
await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2500)
const hamburger = page.locator('header button').first()
await hamburger.click().catch(e => console.log('  hamburger click failed', e.message))
await page.waitForTimeout(800)
await page.screenshot({ path: join(OUT, 'A1-admin-sidebar-open.png'), fullPage: false })
console.log('  saved A1-admin-sidebar-open.png')

// 2. Click Create User to test SlideInDrawer at mobile width
console.log('→ Test: admin SlideInDrawer (Create User)')
await page.goto('http://localhost:3000/admin/users', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2500)
const addBtn = page.locator('button:has-text("Add User")').first()
if (await addBtn.count() > 0) {
  await addBtn.click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: join(OUT, 'A2-admin-add-user-drawer.png'), fullPage: false })
  console.log('  saved A2-admin-add-user-drawer.png')
} else {
  console.log('  Add User button not found')
}

// 3. Landing page — scroll through sections and screenshot
console.log('→ Test: landing page sections')
await ctx.addInitScript(() => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
})
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2500)
const positions = [0, 800, 1600, 2400, 3200, 4000, 4800, 5600, 6400]
for (let i = 0; i < positions.length; i++) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), positions[i])
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, `L${String(i+1).padStart(2,'0')}-landing-scroll-${positions[i]}.png`), fullPage: false })
}
console.log('  saved 9 landing scroll captures')

// 4. Mobile menu on landing
console.log('→ Test: landing header mobile menu')
await page.evaluate(() => window.scrollTo(0,0))
await page.waitForTimeout(300)
const burger = page.locator('header button[aria-label="Toggle menu"]').first()
if (await burger.count() > 0) {
  await burger.click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: join(OUT, 'L99-landing-mobile-menu.png'), fullPage: false })
  console.log('  saved L99-landing-mobile-menu.png')
}

await browser.close()
console.log('\nDone.')
