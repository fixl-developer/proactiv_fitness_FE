'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface LayoutWrapperProps {
    children: React.ReactNode
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
    const pathname = usePathname()

    // Define routes that should not show header/footer (dashboard routes)
    const isDashboardRoute = pathname.startsWith('/admin') ||
        pathname.startsWith('/manager') ||
        pathname.startsWith('/coach') ||
        pathname.startsWith('/parent') ||
        pathname.startsWith('/partner') ||
        pathname.startsWith('/staff') ||
        pathname.startsWith('/auth')

    // Define routes that should not show main header (booking routes)
    const isBookingRoute = pathname.startsWith('/book-now') ||
        pathname.startsWith('/book-assessment') ||
        pathname === '/login'

    if (isDashboardRoute || isBookingRoute) {
        return <main className="min-h-screen">{children}</main>
    }

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    )
}

export default LayoutWrapper
