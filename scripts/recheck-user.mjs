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
const page = await ctx.newPage()

const b64u = (s) => Buffer.from(s).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const fakeToken = `${b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64u(JSON.stringify({
  sub: 'test', exp: Math.floor(Date.now()/1000)+86400, iat: Math.floor(Date.now()/1000)
}))}.sig`
await ctx.addInitScript(({ token }) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify({
    _id: 'test-user', name: 'Test User', firstName: 'Test', lastName: 'User',
    email: 'user@test.com', role: 'USER'
  }))
  localStorage.setItem('lastActivity', Date.now().toString())
}, { token: fakeToken })

const targets = [
  ['user-dashboard-recheck', '/user/dashboard'],
  ['user-browse-recheck', '/user/browse-classes'],
  ['user-bookings-recheck', '/user/bookings'],
  ['staff-dashboard-recheck', '/staff/dashboard'],
]

for (const [tag, url] of targets) {
  try {
    await page.goto('http://localhost:3000' + url, { waitUntil: 'domcontentloaded', timeout: 25000 })
    await page.waitForTimeout(2500)
    await page.screenshot({ path: join(OUT, tag + '.png'), fullPage: false })
    console.log('OK', tag, url)
  } catch (e) {
    console.log('FAIL', tag, url, e.message)
  }
}
await browser.close()
