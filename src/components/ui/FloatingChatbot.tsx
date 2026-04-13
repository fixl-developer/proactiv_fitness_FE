'use client'

import { usePathname } from 'next/navigation'
import AIChatbot from '@/components/ai/AIChatbot'

const FloatingChatbot = () => {
    const pathname = usePathname()

    // Don't show chatbot on dashboard routes, auth pages, or booking pages
    const shouldHideChatbot = pathname.startsWith('/admin') ||
        pathname.startsWith('/manager') ||
        pathname.startsWith('/coach') ||
        pathname.startsWith('/parent') ||
        pathname.startsWith('/user') ||
        pathname.startsWith('/staff') ||
        pathname.startsWith('/partner') ||
        pathname.startsWith('/superadmin') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/account') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/forgot-password') ||
        pathname === '/book-now' ||
        pathname === '/book-assessment'

    if (shouldHideChatbot) {
        return null
    }

    // AIChatbot is self-contained with its own toggle button and chat window
    return <AIChatbot />
}

export default FloatingChatbot
