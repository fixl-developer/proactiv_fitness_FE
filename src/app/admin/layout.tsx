'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
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
    Shield,
    UserCheck,
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

interface AdminLayoutProps {
    children: ReactNode
}

const adminMenuItems: MenuItem[] = [
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
            { label: 'Role Management', href: '/admin/users/roles' },
            { label: 'Permissions', href: '/admin/users/permissions' }
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
        label: 'Customers',
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
]

const colors = {
    gradient: 'from-red-600 to-pink-600',
    bg: 'from-red-50 to-pink-50',
    text: 'text-red-600'
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout } = useAuth()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    const [userName] = useState('Admin User')
    const [userEmail] = useState('admin@progym.hk')

    // Auto-expand menus based on current path
    useEffect(() => {
        const currentPath = pathname
        adminMenuItems.forEach(item => {
            if (item.submenu && currentPath.startsWith(item.href)) {
                setExpandedMenus(prev =>
                    prev.includes(item.href) ? prev : [...prev, item.href]
                )
            }
        })
    }, [pathname])

    // Toggle submenu expansion
    const toggleSubmenu = (href: string) => {
        setExpandedMenus(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    const isActiveLink = (href: string) => {
        return pathname === href
    }

    const handleNavigation = (href: string, e: React.MouseEvent) => {
        e.preventDefault()
        router.push(href)
    }

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Sidebar - Fixed Position */}
            <div
                className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200/50 z-50 flex flex-col"
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
                                Admin Portal
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Menu - Scrollable */}
                <div className="flex-1 overflow-y-auto p-2">
                    <nav className="space-y-1">
                        {adminMenuItems.map((item, index) => (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {item.submenu ? (
                                    // Menu item with submenu
                                    <div className="relative">
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
                                        {expandedMenus.includes(item.href) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-2 ml-8 space-y-1 bg-gray-50 rounded-lg p-2 border border-gray-200"
                                            >
                                                {item.submenu?.map((subItem: { label: string; href: string }) => (
                                                    <button
                                                        key={subItem.href}
                                                        onClick={(e) => handleNavigation(subItem.href, e)}
                                                        className={`w-full text-left block p-2 rounded-md text-sm transition-all duration-200 hover:bg-white hover:shadow-sm ${pathname === subItem.href
                                                            ? `bg-white ${colors.text} font-medium shadow-sm`
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    // Regular menu item
                                    <button
                                        onClick={(e) => handleNavigation(item.href, e)}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${isActiveLink(item.href)
                                            ? `bg-gray-100 ${colors.text}`
                                            : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActiveLink(item.href) ? colors.text : 'text-gray-600'}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer - Always at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        {/* User Info */}
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${colors.bg} border border-gray-200/50`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center`}>
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {userName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {userEmail}
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
                                onClick={handleLogout}
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
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Welcome back, {userName}!
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
                        key={pathname} // This will trigger animation on route change
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
