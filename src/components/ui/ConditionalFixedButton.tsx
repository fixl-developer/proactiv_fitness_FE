'use client'

import { usePathname } from 'next/navigation'
import FixedBookNowButton from './FixedBookNowButton'

const ConditionalFixedButton = () => {
    const pathname = usePathname()

    // Don't show the button on dashboard routes, auth pages, or booking pages
    const shouldHideButton = pathname.startsWith('/admin') ||
        pathname.startsWith('/manager') ||
        pathname.startsWith('/coach') ||
        pathname.startsWith('/parent') ||
        pathname.startsWith('/auth') ||
        pathname === '/book-now' ||
        pathname === '/book-assessment'

    if (shouldHideButton) {
        return null
    }

    return <FixedBookNowButton />
}

export default ConditionalFixedButton