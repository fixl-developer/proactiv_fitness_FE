/** @type {import('next').NextConfig} */
// Resolves the backend host for SSR/edge rewrites. BACKEND_URL (server-only)
// takes precedence; otherwise the public client URL is reused; otherwise we
// fall back to the deployed Render backend (matches utils/apiBaseUrl.ts).
function resolveBackendOrigin() {
    const explicit = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
    if (explicit) {
        // Strip any trailing /api or /api/v1 to get the bare origin.
        return explicit.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/$/, '')
    }
    return 'https://proactiv-fitness-be-new.onrender.com'
}

const BACKEND_ORIGIN = resolveBackendOrigin()

const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: '**' },
        ],
        unoptimized: false,
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
    async redirects() {
        return [
            { source: '/programs/gymnastics', destination: '/school-gymnastics', permanent: false },
            { source: '/programs/camps', destination: '/camps/gymnastics', permanent: false },
            { source: '/programs/multi-activity', destination: '/camps/multi-activity', permanent: false },
        ]
    },
    // Safety net for any code path that calls a relative /api/v1/* URL — the
    // request hits the Next.js server which proxies it to the configured
    // backend. Without this, relative API calls from production would hit the
    // frontend host (which has no API) and silently fail. Set BACKEND_URL on
    // the deploy platform to override the default.
    async rewrites() {
        return [
            { source: '/api/v1/:path*', destination: `${BACKEND_ORIGIN}/api/v1/:path*` },
        ]
    },
}

module.exports = nextConfig
