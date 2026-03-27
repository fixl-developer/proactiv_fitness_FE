'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    Home,
    Calendar,
    Users,
    Settings,
    CreditCard,
    BookOpen,
    Star,
    User,
    LogOut
} from 'lucide-react'

interface BookingDashboardLayoutProps {
    children: ReactNode
    currentSection?: string
}

const parentMenuItems = [
    { icon: Home, label: 'Dashboard', section: 'dashboard' },
    { icon: Calendar, label: 'My Bookings', section: 'bookings' },
    { icon: BookOpen, label: 'Book Classes', href: '/book-now' },
    { icon: Star, label: 'Assessments', href: '/book-assessment' },
    { icon: Users, label: 'My Children', section: 'children' },
    { icon: CreditCard, label: 'Payments', section: 'payments' },
    { icon: Settings, label: 'Profile', section: 'profile' }
]

export default function BookingDashboardLayout({ children, currentSection }: BookingDashboardLayoutProps) {
    const router = useRouter()
    const { user, logout } = useAuth()

    const handleNavigation = (section: string | null, href?: string) => {
        if (href) {
            router.push(href)
            return
        }

        // Determine current page
        const currentPath = window.location.pathname
        const baseUrl = currentPath // Keep current page (book-now or book-assessment)

        const currentUrl = new URL(window.location.href)
        if (section) {
            currentUrl.searchParams.set('section', section)
        } else {
            currentUrl.searchParams.delete('section')
        }
        router.push(baseUrl + currentUrl.search)
    }

    const isActiveSection = (section: string | null, href?: string) => {
        if (href) {
            return window.location.pathname === href
        }

        if (section === null) {
            return !currentSection
        }
        return currentSection === section
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" style={{ paddingTop: '64px' }}>
            {/* Sidebar - Fixed Position */}
            <div
                className="fixed left-0 bg-white border-r border-gray-200/50 z-40 overflow-y-auto shadow-lg"
                style={{
                    width: '280px',
                    top: '64px', // Start below BookingHeader
                    height: 'calc(100vh - 64px)' // Full height minus header
                }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Parent Portal</h2>
                            <p className="text-sm text-blue-600 font-medium">
                                {user?.name || 'Parent'}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Menu */}
                <div className="p-2">
                    <nav className="space-y-1">
                        {parentMenuItems.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <button id="dashboard-booking-dashboard-layout-btn"
                                    onClick={() => handleNavigation(item.section, item.href)}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${isActiveSection(item.section, item.href)
                                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActiveSection(item.section, item.href) ? 'text-blue-600' : 'text-gray-600'
                                        }`} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </motion.div>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        {/* User Info */}
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200/50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user?.name || 'Parent User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email || 'parent@example.com'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button id="dashboard-booking-dashboard-layout-btn-3"
                                onClick={logout}
                                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                <main className="p-6 min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
