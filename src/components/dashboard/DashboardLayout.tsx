'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import NotificationBell from '@/components/shared/NotificationBell'
import {
    Home,
    Calendar,
    Users,
    Settings,
    BarChart3,
    CreditCard,
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
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
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
        { icon: Home, label: 'Dashboard', href: '/parent/dashboard' },
        { icon: Users, label: 'My Children', href: '/parent/children' },
        { icon: Calendar, label: 'My Bookings', href: '/parent/bookings' },
        { icon: BookOpen, label: 'Browse Classes', href: '/parent/browse-classes' },
        { icon: Activity, label: 'Nutrition', href: '/parent/nutrition' },
        { icon: CreditCard, label: 'Payments', href: '/parent/payments' },
        { icon: Clock, label: 'Waitlist', href: '/parent/waitlist' },
        { icon: Star, label: 'Makeup Credits', href: '/parent/makeup-credits' },
        { icon: Settings, label: 'Profile', href: '/parent/profile' }
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
        text: 'text-red-600',
        activeBg: 'bg-red-50',
        hoverBg: 'hover:bg-red-50/60',
    },
    parent: {
        gradient: 'from-blue-600 to-cyan-600',
        bg: 'from-blue-50 to-cyan-50',
        text: 'text-blue-600',
        activeBg: 'bg-blue-50',
        hoverBg: 'hover:bg-blue-50/60',
    },
    coach: {
        gradient: 'from-green-600 to-emerald-600',
        bg: 'from-green-50 to-emerald-50',
        text: 'text-green-600',
        activeBg: 'bg-green-50',
        hoverBg: 'hover:bg-green-50/60',
    },
    manager: {
        gradient: 'from-purple-600 to-indigo-600',
        bg: 'from-purple-50 to-indigo-50',
        text: 'text-purple-600',
        activeBg: 'bg-purple-50',
        hoverBg: 'hover:bg-purple-50/60',
    }
}

const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 72

export default function DashboardLayout({ children, userRole, userName, userEmail }: DashboardLayoutProps) {
    const menuItems = roleMenuItems[userRole]
    const colors = roleColors[userRole]
    const pathname = usePathname()
    useAuth()
    const router = useRouter()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login/staff' })

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

    // Auto-expand menus based on current path
    useEffect(() => {
        if (sidebarCollapsed) return
        menuItems.forEach(item => {
            if (item.submenu && pathname.startsWith(item.href)) {
                setExpandedMenus(prev =>
                    prev.includes(item.href) ? prev : [...prev, item.href]
                )
            }
        })
    }, [pathname, sidebarCollapsed])

    // Collapse submenus when sidebar collapses
    useEffect(() => {
        if (sidebarCollapsed) {
            setExpandedMenus([])
        }
    }, [sidebarCollapsed])

    // Toggle submenu expansion
    const toggleSubmenu = (href: string) => {
        setExpandedMenus(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    const isActiveLink = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Sidebar - Fixed Position */}
            <div
                className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200/50 z-50 transition-all duration-300 ease-in-out"
                style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-lg font-bold text-gray-900">ProActive Sports</h2>
                                <p className={`text-sm ${colors.text} font-medium capitalize`}>
                                    {userRole} Portal
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Sidebar Menu */}
                <div className="p-2 flex-1 overflow-y-auto">
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.href} className="relative">
                                {item.submenu ? (
                                    // Menu item with submenu
                                    <div className="relative group">
                                        <button id="dashboard-dashboard-layout-btn"
                                            onClick={() => {
                                                if (sidebarCollapsed) {
                                                    setSidebarCollapsed(false)
                                                    setTimeout(() => toggleSubmenu(item.href), 300)
                                                } else {
                                                    toggleSubmenu(item.href)
                                                }
                                            }}
                                            onMouseEnter={() => sidebarCollapsed && setHoveredItem(item.href)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                ? `${colors.activeBg} ${colors.text}`
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'}`}>
                                                <item.icon className={`w-5 h-5 flex-shrink-0 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                    ? colors.text
                                                    : 'text-gray-600'
                                                    }`} />
                                                {!sidebarCollapsed && (
                                                    <span className="font-medium text-sm">{item.label}</span>
                                                )}
                                            </div>
                                            {!sidebarCollapsed && (
                                                expandedMenus.includes(item.href) ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )
                                            )}
                                        </button>

                                        {/* Tooltip for collapsed state */}
                                        {sidebarCollapsed && hoveredItem === item.href && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-[100] shadow-lg">
                                                {item.label}
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                            </div>
                                        )}

                                        {/* Submenu - only when expanded */}
                                        {!sidebarCollapsed && expandedMenus.includes(item.href) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-1 ml-8 space-y-1 bg-gray-50 rounded-lg p-2 border border-gray-200"
                                            >
                                                {item.submenu?.map((subItem: { label: string; href: string }) => (
                                                    <Link id="dashboard-dashboard-layout-nav"
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={`block p-2 rounded-md text-sm transition-all duration-200 hover:bg-white hover:shadow-sm ${pathname === subItem.href
                                                            ? `bg-white ${colors.text} font-medium shadow-sm`
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    // Regular menu item
                                    <div className="relative group">
                                        <Link id="dashboard-dashboard-layout-nav-2"
                                            href={item.href}
                                            onMouseEnter={() => sidebarCollapsed && setHoveredItem(item.href)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 ${isActiveLink(item.href)
                                                ? `${colors.activeBg} ${colors.text}`
                                                : `text-gray-700 ${colors.hoverBg} hover:text-gray-900`
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActiveLink(item.href) ? colors.text : 'text-gray-600'}`} />
                                            {!sidebarCollapsed && (
                                                <span className="font-medium text-sm">{item.label}</span>
                                            )}
                                        </Link>

                                        {/* Tooltip for collapsed state */}
                                        {sidebarCollapsed && hoveredItem === item.href && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-[100] shadow-lg">
                                                {item.label}
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Collapse Toggle */}
                <div className="flex-shrink-0 px-2 py-2 border-t border-gray-200/50">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen className="w-5 h-5" />
                        ) : (
                            <div className="flex items-center space-x-2 w-full justify-center">
                                <PanelLeftClose className="w-5 h-5" />
                                <span className="text-sm font-medium">Collapse</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Sidebar Footer */}
                <div className="flex-shrink-0 px-3 pt-3 pb-2 border-t border-gray-200/50 bg-white">
                    <div className="space-y-2">
                        {/* User Info */}
                        {sidebarCollapsed ? (
                            <div className="flex justify-center">
                                <div className={`w-9 h-9 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${colors.bg} border border-gray-200/50`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
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
                        )}

                        {/* Logout Button */}
                        <div className="flex justify-center">
                            <Button id="dashboard-dashboard-layout-btn-3"
                                variant="outline"
                                size="sm"
                                onClick={handleLogoutClick}
                                className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${sidebarCollapsed ? 'w-9 h-9 p-0' : 'flex-1'}`}
                            >
                                <LogOut className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
                                {!sidebarCollapsed && 'Logout'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="transition-all duration-300 ease-in-out" style={{ marginLeft: `${sidebarWidth}px` }}>
                {/* Header - Fixed Position */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300 ease-in-out"
                    style={{ left: `${sidebarWidth}px`, right: 0 }}
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
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
                            <NotificationBell />
                            <Button id="dashboard-dashboard-layout-btn-5" variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="pt-20 p-6 min-h-screen">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={closeLogoutModal}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={userName?.split(' ')[0]}
                unsavedPages={unsavedPages}
            />
        </div>
    )
}
