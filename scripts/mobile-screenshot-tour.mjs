import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', '..', '.tmp-test', 'mobile-screenshots')
mkdirSync(OUT_DIR, { recursive: true })

const BASE = 'http://localhost:3000'

// iPhone SE viewport — common worst-case mobile width.
const VIEWPORT = { width: 375, height: 812 }

// Build a JWT whose payload includes an `exp` 24 hours from now so
// tokenManager.isTokenValid() returns true. The signature isn't checked client-side.
const b64u = (s) => Buffer.from(s).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const buildToken = () => {
  const header = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = b64u(JSON.stringify({
    sub: 'test',
    exp: Math.floor(Date.now() / 1000) + 86400,
    iat: Math.floor(Date.now() / 1000),
  }))
  return `${header}.${payload}.test-signature`
}
const fakeToken = buildToken()

const tours = [
  { name: '01-landing', url: '/', role: null },
  { name: '02-landing-camps', url: '/camps', role: null },
  { name: '03-landing-about', url: '/about', role: null },
  { name: '04-landing-blog', url: '/blog', role: null },
  { name: '05-landing-contact', url: '/contact', role: null },
  { name: '06-book-now', url: '/book-now', role: null },
  { name: '10-admin-dashboard', url: '/admin/dashboard', role: 'ADMIN', name_field: 'Admin Tester', email: 'admin@proactiv.com' },
  { name: '11-admin-users', url: '/admin/users', role: 'ADMIN' },
  { name: '12-admin-cms', url: '/admin/cms', role: 'ADMIN' },
  { name: '13-admin-programs', url: '/admin/programs/catalog', role: 'ADMIN' },
  { name: '14-admin-finance', url: '/admin/finance/payments', role: 'ADMIN' },
  { name: '20-regional-dashboard', url: '/admin/regional/dashboard', role: 'REGIONAL_ADMIN' },
  { name: '21-regional-locations', url: '/admin/regional/locations', role: 'REGIONAL_ADMIN' },
  { name: '30-franchise-dashboard', url: '/admin/franchise/dashboard', role: 'FRANCHISE_OWNER' },
  { name: '31-franchise-staff', url: '/admin/franchise/staff', role: 'FRANCHISE_OWNER' },
  { name: '40-location-dashboard', url: '/admin/location/dashboard', role: 'LOCATION_MANAGER' },
  { name: '41-location-bookings', url: '/admin/location/bookings', role: 'LOCATION_MANAGER' },
  { name: '50-parent-dashboard', url: '/parent/dashboard', role: 'PARENT' },
  { name: '51-parent-children', url: '/parent/children', role: 'PARENT' },
  { name: '52-parent-browse-classes', url: '/parent/browse-classes', role: 'PARENT' },
  { name: '53-parent-bookings', url: '/parent/bookings', role: 'PARENT' },
  { name: '60-coach-dashboard', url: '/coach/dashboard', role: 'COACH' },
  { name: '61-coach-schedule', url: '/coach/schedule', role: 'COACH' },
  { name: '70-manager-dashboard', url: '/manager/dashboard', role: 'MANAGER' },
  { name: '71-manager-staff', url: '/manager/staff', role: 'MANAGER' },
  { name: '80-staff-dashboard', url: '/staff/dashboard', role: 'SUPPORT_STAFF' },
  { name: '81-staff-tickets', url: '/staff/tickets', role: 'SUPPORT_STAFF' },
  { name: '90-user-dashboard', url: '/user/dashboard', role: 'USER' },
  { name: '91-user-browse', url: '/user/browse-classes', role: 'USER' },
  { name: '92-user-bookings', url: '/user/bookings', role: 'USER' },
  { name: '95-partner-dashboard', url: '/partner/dashboard', role: 'PARTNER_ADMIN' },
]

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/hp/AppData/Local/ms-playwright/chromium-1117/chrome-win/chrome.exe',
})
const ctx = await browser.newContext({ viewport: VIEWPORT })
const page = await ctx.newPage()

const issues = []
page.on('pageerror', err => issues.push({ type: 'pageerror', text: err.message }))
page.on('console', msg => { if (msg.type() === 'error') issues.push({ type: 'console.error', text: msg.text() }) })

// Block the backend (Render) — none of the dashboard pages have it running locally,
// so we don't want the screenshots to be 30s of spinners. Faster fail = layout shows.
await ctx.route('**/api/v1/**', route => route.abort())
await ctx.route('**://api.proactiv*/**', route => route.abort())

for (const t of tours) {
  const turnIssues = []
  const tag = t.name
  const tagFile = `${tag.padStart(2, '0')}.png`
  try {
    if (t.role) {
      const fakeUser = {
        _id: 'test-' + t.role.toLowerCase(),
        name: t.name_field || (t.role.charAt(0) + t.role.slice(1).toLowerCase() + ' Test'),
        firstName: 'Test',
        lastName: 'User',
        email: t.email || `${t.role.toLowerCase()}@test.com`,
        role: t.role,
      }
      await ctx.addInitScript(({ token, user }) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('lastActivity', Date.now().toString())
      }, { token: fakeToken, user: fakeUser })
    } else {
      await ctx.addInitScript(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
    }
    await page.goto(BASE + t.url, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(1500) // allow client transitions + skeleton to settle
    await page.screenshot({ path: join(OUT_DIR, tagFile), fullPage: false })
    // Also full-page for content audit
    await page.screenshot({ path: join(OUT_DIR, tag + '-full.png'), fullPage: true })
    console.log(`  OK   ${tag} → ${t.url}`)
  } catch (e) {
    console.log(`  FAIL ${tag} → ${t.url}: ${e.message}`)
    turnIssues.push({ tag, url: t.url, error: e.message })
  }
  if (turnIssues.length) issues.push(...turnIssues)
}

await browser.close()

if (issues.length) {
  console.log('\nISSUES:')
  for (const i of issues) console.log(' -', JSON.stringify(i))
} else {
  console.log('\nAll screenshots captured cleanly.')
}

console.log(`\nScreenshots saved to: ${OUT_DIR}`)
