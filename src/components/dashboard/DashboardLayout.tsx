'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import LogoutModal from '@/components/ui/LogoutModal'
import {
    Home,
    Calendar,
    Users,
    Settings,
    BarChart3,
    CreditCard,
    Bell,
    LogOut,
    User,
    BookOpen,
    Clock,
    Star,
    Shield,
    UserCheck,
    Activity,
    Menu,
    Building2,
    MessageSquare,
    ChevronDown,
    ChevronRight
} from 'lucide-react'

interface MenuItem {
    icon: any
    label: string
    href: string
    submenu?: { label: string; href: string }[]
}

interface DashboardLayoutProps {
    children: ReactNode
    userRole: 'admin' | 'parent' | 'coach' | 'manager'
    userName?: string
    userEmail?: string
}

const roleMenuItems: Record<string, MenuItem[]> = {
    admin: [
        { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
        {
            icon: Building2,
            label: 'Organization',
            href: '/admin/organization',
            submenu: [
                { label: 'Business Units', href: '/admin/organization/business-units' },
                { label: 'Outlets', href: '/admin/organization/outlets' },
                { label: 'Locations', href: '/admin/locations' }
            ]
        },
        {
            icon: Users,
            label: 'Users & Roles',
            href: '/admin/users',
            submenu: [
                { label: 'All Users', href: '/admin/users' },
                { label: 'Roles & Permissions', href: '/admin/users/roles' }
            ]
        },
        {
            icon: UserCheck,
            label: 'Coaches & Staff',
            href: '/admin/staff',
            submenu: [
                { label: 'All Staff', href: '/admin/staff' },
                { label: 'Coach Profiles', href: '/admin/staff/coaches' },
                { label: 'Utilization', href: '/admin/staff/utilization' },
                { label: 'Performance', href: '/admin/staff/performance' }
            ]
        },
        {
            icon: Calendar,
            label: 'Scheduling & Classes',
            href: '/admin/schedule',
            submenu: [
                { label: 'Master Schedule', href: '/admin/schedule' },
                { label: 'Class Management', href: '/admin/schedule/classes' },
                { label: 'Scheduling Rules', href: '/admin/schedule/rules' },
                { label: 'Conflicts', href: '/admin/schedule/conflicts' }
            ]
        },
        {
            icon: Users,
            label: 'Customers & Assessments',
            href: '/admin/customers',
            submenu: [
                { label: 'Customer Database', href: '/admin/customers' },
                { label: 'Assessments', href: '/admin/customers/assessments' },
                { label: 'Student Profiles', href: '/admin/students' },
                { label: 'Parent Accounts', href: '/admin/customers/parents' }
            ]
        },
        {
            icon: CreditCard,
            label: 'Payments & Finance',
            href: '/admin/payments',
            submenu: [
                { label: 'Payment Dashboard', href: '/admin/payments' },
                { label: 'Invoices & Refunds', href: '/admin/payments/invoices' },
                { label: 'Gateway Management', href: '/admin/payments/gateways' },
                { label: 'Financial Reports', href: '/admin/payments/reports' }
            ]
        },
        {
            icon: BarChart3,
            label: 'Reports & Analytics',
            href: '/admin/analytics',
            submenu: [
                { label: 'Business Intelligence', href: '/admin/analytics' },
                { label: 'Conversion Reports', href: '/admin/analytics/conversion' },
                { label: 'Revenue Analysis', href: '/admin/analytics/revenue' },
                { label: 'Performance Metrics', href: '/admin/analytics/performance' }
            ]
        },
        {
            icon: MessageSquare,
            label: 'AI & SOP Hub',
            href: '/admin/ai',
            submenu: [
                { label: 'Chatbot Management', href: '/admin/ai/chatbot' },
                { label: 'SOP Documents', href: '/admin/ai/sop' },
                { label: 'Knowledge Base', href: '/admin/ai/knowledge' },
                { label: 'AI Analytics', href: '/admin/ai/analytics' }
            ]
        },
        {
            icon: Settings,
            label: 'System Settings',
            href: '/admin/settings',
            submenu: [
                { label: 'General Settings', href: '/admin/settings' },
                { label: 'Payment Gateways', href: '/admin/settings/payments' },
                { label: 'Notifications', href: '/admin/settings/notifications' },
                { label: 'Integrations', href: '/admin/settings/integrations' }
            ]
        },
        {
            icon: Shield,
            label: 'Audit Logs',
            href: '/admin/audit',
            submenu: [
                { label: 'System Logs', href: '/admin/audit/system' },
                { label: 'User Activity', href: '/admin/audit/users' },
                { label: 'Data Changes', href: '/admin/audit/data' },
                { label: 'Security Events', href: '/admin/audit/security' }
            ]
        }
    ],
    parent: [
        { icon: Home, label: 'Dashboard', href: '/book-now?section=dashboard' },
        { icon: Calendar, label: 'My Bookings', href: '/book-now?section=bookings' },
        { icon: BookOpen, label: 'Book Classes', href: '/book-now' },
        { icon: Star, label: 'Assessments', href: '/book-assessment' },
        { icon: Users, label: 'My Children', href: '/book-now?section=children' },
        { icon: CreditCard, label: 'Payments', href: '/book-now?section=payments' },
        { icon: Settings, label: 'Profile', href: '/book-now?section=profile' }
    ],
    coach: [
        { icon: Home, label: 'Dashboard', href: '/coach/dashboard' },
        { icon: Calendar, label: 'My Schedule', href: '/coach/schedule' },
        { icon: Users, label: 'My Students', href: '/coach/students' },
        { icon: Activity, label: 'Class Reports', href: '/coach/reports' },
        { icon: Clock, label: 'Availability', href: '/coach/availability' },
        { icon: Star, label: 'Feedback', href: '/coach/feedback' },
        { icon: Settings, label: 'Profile', href: '/coach/profile' }
    ],
    manager: [
        { icon: Home, label: 'Dashboard', href: '/manager/dashboard' },
        { icon: Calendar, label: 'Schedule & Classes', href: '/manager/schedule' },
        { icon: Users, label: 'Students & Assessments', href: '/manager/students' },
        { icon: UserCheck, label: 'Staff Management', href: '/manager/staff' },
        { icon: CreditCard, label: 'Payments & Follow-up', href: '/manager/payments' },
        { icon: BarChart3, label: 'Reports & Analytics', href: '/manager/reports' },
        { icon: Settings, label: 'Location Settings', href: '/manager/settings' }
    ]
}

const roleColors = {
    admin: {
        gradient: 'from-red-600 to-pink-600',
        bg: 'from-red-50 to-pink-50',
        text: 'text-red-600'
    },
    parent: {
        gradient: 'from-blue-600 to-cyan-600',
        bg: 'from-blue-50 to-cyan-50',
        text: 'text-blue-600'
    },
    coach: {
        gradient: 'from-green-600 to-emerald-600',
        bg: 'from-green-50 to-emerald-50',
        text: 'text-green-600'
    },
    manager: {
        gradient: 'from-purple-600 to-indigo-600',
        bg: 'from-purple-50 to-indigo-50',
        text: 'text-purple-600'
    }
}

export default function DashboardLayout({ children, userRole, userName, userEmail }: DashboardLayoutProps) {
    const menuItems = roleMenuItems[userRole]
    const colors = roleColors[userRole]
    const pathname = usePathname()
    const { logout, softLogout } = useAuth()
    const router = useRouter()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    // Toggle submenu expansion
    const toggleSubmenu = (href: string) => {
        setExpandedMenus(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    // Get current section from URL for parent role
    const getCurrentSection = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            return urlParams.get('section')
        }
        return null
    }

    const isActiveLink = (href: string) => {
        if (userRole === 'parent') {
            const currentSection = getCurrentSection()
            if (href.includes('?section=')) {
                const linkSection = href.split('?section=')[1]
                return currentSection === linkSection
            } else if (href === '/book-now') {
                return !currentSection || currentSection === ''
            }
        }
        return pathname === href
    }

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

    const handleSaveAndLogout = () => {
        // Save session FIRST before clearing anything
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        const savedRefreshToken = localStorage.getItem('refreshToken')
        if (savedUser && savedToken) {
            localStorage.setItem('savedSession', JSON.stringify({ user: savedUser, token: savedToken, refreshToken: savedRefreshToken, savedAt: Date.now() }))
        }
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('auth-storage')
        setShowLogoutModal(false)
        window.location.href = '/login/staff'
    }

    const handlePermanentLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('savedSession')
        localStorage.removeItem('lastActivity')
        localStorage.removeItem('auth-storage')
        setShowLogoutModal(false)
        window.location.href = '/login/staff'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Sidebar - Fixed Position */}
            <div
                className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200/50 z-50 flex flex-col"
                style={{ width: '280px' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3"
                    >
                        <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">ProActive Sports</h2>
                            <p className={`text-sm ${colors.text} font-medium capitalize`}>
                                {userRole} Portal
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Menu */}
                <div className="p-2 flex-1 overflow-y-auto">
                    <nav className="space-y-1">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {item.submenu ? (
                                    // Menu item with submenu
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu(item.href)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                ? `bg-gray-100 ${colors.text}`
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <item.icon className={`w-5 h-5 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                    ? colors.text
                                                    : 'text-gray-600'
                                                    }`} />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            {expandedMenus.includes(item.href) ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>

                                        {/* Submenu */}
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: expandedMenus.includes(item.href) ? 'auto' : 0,
                                                opacity: expandedMenus.includes(item.href) ? 1 : 0
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-8 mt-1 space-y-1">
                                                {item.submenu?.map((subItem: { label: string; href: string }, subIndex: number) => (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={`block p-2 rounded-md text-sm transition-all duration-200 hover:bg-gray-100 ${pathname === subItem.href
                                                            ? `bg-gray-100 ${colors.text} font-medium`
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </div>
                                ) : (
                                    // Regular menu item
                                    <Link
                                        href={item.href}
                                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${isActiveLink(item.href)
                                            ? `bg-gray-100 ${colors.text}`
                                            : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActiveLink(item.href) ? colors.text : 'text-gray-600'}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="flex-shrink-0 px-4 pt-3 pb-0 border-t border-gray-200/50 bg-white mt-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-2"
                    >
                        {/* User Info */}
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${colors.bg} border border-gray-200/50`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center`}>
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {userName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {userEmail || 'user@example.com'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-gray-600 hover:text-gray-900"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Alerts
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogoutClick}
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ marginLeft: '280px' }}>
                {/* Header - Fixed Position */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
                    style={{ left: '280px', right: 0 }}
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <Menu className="w-5 h-5 text-gray-600" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                                    {userRole} Dashboard
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Welcome back, {userName || 'User'}!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm">
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="pt-20 p-6 min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={userName?.split(' ')[0]}
            />
        </div>
    )
}
