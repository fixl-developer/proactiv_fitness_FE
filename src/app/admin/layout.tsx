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
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    bg: 'from-violet-50 via-purple-50 to-fuchsia-50',
    text: 'text-violet-600',
    accent: 'from-cyan-500 to-blue-500',
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    sidebar: 'from-slate-900 via-purple-900 to-slate-900',
    card: 'from-white/80 to-white/60'
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout } = useAuth()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    const [userName] = useState('Admin User')
    const [userEmail] = useState('admin@progym.hk')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

    const sidebarWidth = sidebarCollapsed ? '80px' : '280px'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-fuchsia-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Sidebar - Fixed Position with Glass Effect */}
            <motion.div
                className="fixed left-0 top-0 h-screen bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl border-r border-violet-200/50 z-50 flex flex-col shadow-2xl"
                style={{ width: sidebarWidth }}
                animate={{ width: sidebarWidth }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-violet-200/50 flex-shrink-0">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${colors.gradient} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 ai-glow`}>
                                <Shield className="w-7 h-7 text-white animate-pulse" />
                            </div>
                            {!sidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">ProActive Sports</h2>
                                    <p className={`text-sm ${colors.text} font-medium capitalize animate-bounce-gentle`}>
                                        Admin Portal
                                    </p>
                                </motion.div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-violet-100 rounded-lg transition-all duration-300"
                        >
                            <Menu className="w-5 h-5 text-violet-600" />
                        </Button>
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
                                            onClick={() => !sidebarCollapsed && toggleSubmenu(item.href)}
                                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-100 hover:to-purple-100 hover:shadow-md transform hover:scale-105 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                ? `bg-gradient-to-r from-violet-100 to-purple-100 ${colors.text} shadow-md scale-105`
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600'
                                                    } transition-all duration-300`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                {!sidebarCollapsed && (
                                                    <motion.span
                                                        className="font-medium"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </div>
                                            {!sidebarCollapsed && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {expandedMenus.includes(item.href) ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </motion.div>
                                            )}
                                        </button>

                                        {/* Submenu */}
                                        {!sidebarCollapsed && expandedMenus.includes(item.href) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-2 ml-8 space-y-1 bg-gradient-to-r from-violet-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-3 border border-violet-200/50 shadow-lg"
                                            >
                                                {item.submenu?.map((subItem: { label: string; href: string }) => (
                                                    <button
                                                        key={subItem.href}
                                                        onClick={(e) => handleNavigation(subItem.href, e)}
                                                        className={`w-full text-left block p-3 rounded-lg text-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md transform hover:scale-105 ${pathname === subItem.href
                                                            ? `bg-white/90 ${colors.text} font-medium shadow-md scale-105 border border-violet-200`
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
                                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-100 hover:to-purple-100 hover:shadow-md transform hover:scale-105 ${isActiveLink(item.href)
                                            ? `bg-gradient-to-r from-violet-100 to-purple-100 ${colors.text} shadow-md scale-105`
                                            : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActiveLink(item.href)
                                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600'
                                            } transition-all duration-300`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        {!sidebarCollapsed && (
                                            <motion.span
                                                className="font-medium"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer - Always at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-violet-200/50 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        {/* User Info */}
                        <div className={`p-4 rounded-xl bg-gradient-to-r ${colors.bg} border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center shadow-lg animate-ai-pulse`}>
                                    <User className="w-5 h-5 text-white" />
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
                                className="flex-1 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 border-violet-200 transition-all duration-300 transform hover:scale-105"
                            >
                                <Bell className="w-4 h-4 mr-2 animate-bounce-gentle" />
                                Alerts
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all duration-300 transform hover:scale-105"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div style={{ marginLeft: '280px' }}>
                {/* Header - Fixed Position */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-violet-200/50 shadow-lg"
                    style={{ left: '280px', right: 0 }}
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg">
                                <Menu className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Welcome back, <span className="font-medium text-violet-600">{userName}</span>!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm" className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 border-violet-200 transition-all duration-300 transform hover:scale-105">
                                <Bell className="w-4 h-4 mr-2 animate-bounce-gentle" />
                                Notifications
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 border-violet-200 transition-all duration-300 transform hover:scale-105">
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
        </div >
    )
}