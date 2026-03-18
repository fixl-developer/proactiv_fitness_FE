'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import AIChatbot from '@/components/ai/AIChatbot'

const FloatingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
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

    return (
        <>
            {/* Floating Chatbot Icon - Bottom Right */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse Animation */}
                {!isOpen && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-purple-500"
                        animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.button>

            {/* Chatbot Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <AIChatbot />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default FloatingChatbot
