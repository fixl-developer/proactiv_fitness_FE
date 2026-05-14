// Mobile screenshot tour for admin / regional / franchise / location dashboards.
// Sets a JWT in localStorage with the appropriate role per URL so the layout
// role-guards accept us and the dashboard mounts.

import { chromium, devices } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'http://localhost:3001';
const OUT_DIR = '.tmp-test/mobile-screenshots';

const PAGES = [
    // Admin
    { name: 'admin-dashboard', url: '/admin/dashboard', role: 'ADMIN' },
    { name: 'admin-users', url: '/admin/users', role: 'ADMIN' },
    { name: 'admin-cms', url: '/admin/cms', role: 'ADMIN' },
    { name: 'admin-finance', url: '/admin/finance/payments', role: 'ADMIN' },
    // Regional
    { name: 'regional-dashboard', url: '/admin/regional/dashboard', role: 'REGIONAL_ADMIN' },
    { name: 'regional-locations', url: '/admin/regional/locations', role: 'REGIONAL_ADMIN' },
    { name: 'regional-staff', url: '/admin/regional/staff', role: 'REGIONAL_ADMIN' },
    { name: 'regional-approvals', url: '/admin/regional/approvals', role: 'REGIONAL_ADMIN' },
    // Franchise
    { name: 'franchise-dashboard', url: '/admin/franchise/dashboard', role: 'FRANCHISE_OWNER' },
    { name: 'franchise-locations', url: '/admin/franchise/locations', role: 'FRANCHISE_OWNER' },
    { name: 'franchise-staff', url: '/admin/franchise/staff', role: 'FRANCHISE_OWNER' },
    { name: 'franchise-financial', url: '/admin/franchise/financial-reports', role: 'FRANCHISE_OWNER' },
    // Location
    { name: 'location-dashboard', url: '/admin/location/dashboard', role: 'LOCATION_MANAGER' },
    { name: 'location-classes', url: '/admin/location/classes', role: 'LOCATION_MANAGER' },
    { name: 'location-bookings', url: '/admin/location/bookings', role: 'LOCATION_MANAGER' },
    { name: 'location-staff', url: '/admin/location/staff', role: 'LOCATION_MANAGER' },
];

(async () => {
    await mkdir(OUT_DIR, { recursive: true });
    const browser = await chromium.launch({
        headless: true,
        executablePath: 'C:/Users/hp/AppData/Local/ms-playwright/chromium-1117/chrome-win/chrome.exe',
    });
    const errors = [];

    for (const p of PAGES) {
        const context = await browser.newContext({
            ...devices['iPhone SE'],
            viewport: { width: 375, height: 667 },
            deviceScaleFactor: 1,
        });
        await context.addInitScript((role) => {
            const fakeUser = {
                id: 'mobile-test-admin',
                userId: 'mobile-test-admin',
                tenantId: 'proactiv-hq',
                name: 'Mobile Test',
                email: 'mobile@test.com',
                firstName: 'Mobile',
                lastName: 'Test',
                role,
                permissions: ['*'],
            };
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
                .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            const payload = btoa(JSON.stringify({
                sub: 'mobile-test-admin',
                email: 'mobile@test.com',
                role,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
            })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            const fakeJwt = `${header}.${payload}.mock`;
            localStorage.setItem('user', JSON.stringify(fakeUser));
            localStorage.setItem('token', fakeJwt);
            localStorage.setItem('accessToken', fakeJwt);
            localStorage.setItem('refreshToken', fakeJwt);
            localStorage.setItem('lastActivity', String(Date.now()));
            // Zustand auth-storage shape so ProtectedRoute / useAuthStore is satisfied
            localStorage.setItem('auth-storage', JSON.stringify({
                state: {
                    user: { ...fakeUser },
                    accessToken: fakeJwt,
                    refreshToken: fakeJwt,
                    isAuthenticated: true,
                },
                version: 0,
            }));
        }, p.role);

        const page = await context.newPage();
        page.on('pageerror', (e) => errors.push(`${p.name}: ${e.message}`));

        // Warm up by visiting / first so localStorage init script runs on real origin.
        try {
            await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch { /* */ }
        try {
            await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch {
            console.log(`  navigation timeout on ${p.name}`);
        }
        await page.waitForTimeout(6000);

        const file = join(OUT_DIR, `${p.name}-375px.png`);
        try {
            await page.screenshot({ path: file, fullPage: true, timeout: 15000, animations: 'disabled' });
        } catch (e) {
            console.log(`  screenshot timeout on ${p.name} — retrying clipped`);
            try {
                await page.screenshot({ path: file, timeout: 10000, animations: 'disabled' });
            } catch { /* give up */ }
        }

        const hasHorizontalOverflow = await page.evaluate(() =>
            document.documentElement.scrollWidth > window.innerWidth + 1
        );
        const finalUrl = page.url();
        const redirected = !finalUrl.endsWith(p.url);

        console.log(`${p.name.padEnd(28)} ${hasHorizontalOverflow ? '⚠️  H-OVERFLOW' : '✓ clean'}  ${redirected ? `→ ${finalUrl.replace(BASE_URL, '')}` : ''}`);

        await context.close();
    }

    if (errors.length) {
        console.log('\n--- Page errors observed:');
        errors.slice(0, 15).forEach((e) => console.log(`  ${e}`));
    }

    await browser.close();
})();
