import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    // Authentication is handled client-side via AuthContext and layout-level checks.
    // This middleware only adds cache-control headers for protected pages.
    const { pathname } = request.nextUrl

    const protectedRoutes = ['/admin', '/manager', '/coach', '/superadmin', '/staff', '/partner', '/parent']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute) {
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
        '/coach/:path*',
        '/superadmin/:path*',
        '/staff/:path*',
        '/partner/:path*',
        '/parent/:path*'
    ]
}
