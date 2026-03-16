import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Protected admin routes
    const adminRoutes = ['/admin', '/manager', '/coach']
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute) {
        // Check if user is authenticated and has proper role
        const authToken = request.cookies.get('authToken')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '')

        // If no auth token, redirect to login
        if (!authToken) {
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Add cache control headers to prevent back button access
        const response = NextResponse.next()
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')

        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/manager/:path*',
        '/coach/:path*'
    ]
}