// Single source of truth for the backend base URL.
//
// The deployed Next.js build bakes in NEXT_PUBLIC_* env vars at BUILD time.
// If Vercel's build doesn't have NEXT_PUBLIC_API_BASE_URL set, the bundle
// shipped to the browser would otherwise fall back to localhost:5000 — which
// breaks every API call from production. This resolver detects a deployed
// hostname and switches to the Render backend so the UI works without
// requiring env vars to be perfectly configured on every deploy.

const PROD_API_URL = 'https://proactiv-fitness-backend.onrender.com/api/v1'
const PROD_SOCKET_URL = 'https://proactiv-fitness-backend.onrender.com'
const LOCAL_API_URL = 'http://localhost:5000/api/v1'
const LOCAL_SOCKET_URL = 'http://localhost:5000'

const isLocalHostname = (h: string) =>
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h.endsWith('.local') ||
    h.startsWith('192.168.') ||
    h.startsWith('10.') ||
    h.startsWith('172.16.') ||
    h.startsWith('172.17.') ||
    h.startsWith('172.18.') ||
    h.startsWith('172.19.') ||
    h.startsWith('172.2') ||
    h.startsWith('172.30.') ||
    h.startsWith('172.31.')

export function getApiBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
    if (envUrl) {
        if (typeof window !== 'undefined') {
            const onLocalHost = isLocalHostname(window.location.hostname)
            const envIsLocal = /localhost|127\.0\.0\.1/.test(envUrl)
            if (!onLocalHost && envIsLocal) return PROD_API_URL
        }
        return envUrl
    }
    if (typeof window === 'undefined') return LOCAL_API_URL
    return isLocalHostname(window.location.hostname) ? LOCAL_API_URL : PROD_API_URL
}

export function getSocketUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL
    if (envUrl) {
        if (typeof window !== 'undefined') {
            const onLocalHost = isLocalHostname(window.location.hostname)
            const envIsLocal = /localhost|127\.0\.0\.1/.test(envUrl)
            if (!onLocalHost && envIsLocal) return PROD_SOCKET_URL
        }
        return envUrl
    }
    if (typeof window === 'undefined') return LOCAL_SOCKET_URL
    return isLocalHostname(window.location.hostname) ? LOCAL_SOCKET_URL : PROD_SOCKET_URL
}
