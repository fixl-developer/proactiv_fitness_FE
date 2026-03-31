'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    Bell,
    LogOut,
    User,
    Shield,
    UserCheck,
    Menu,
    MessageSquare,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    FileText,
    PanelLeftClose,
    PanelLeftOpen
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
        icon: FileText,
        label: 'Content Management',
        href: '/admin/cms',
        submenu: [
            { label: 'All Content', href: '/admin/cms' },
            { label: 'Hero Slides', href: '/admin/cms/hero-slides' },
            { label: 'Services', href: '/admin/cms/services' },
            { label: 'Testimonials', href: '/admin/cms/testimonials' },
            { label: 'Assessments', href: '/admin/cms/assessments' },
            { label: 'Class Sessions', href: '/admin/cms/classes' },
            { label: 'Party Packages', href: '/admin/cms/party-packages' },
            { label: 'Program Levels', href: '/admin/cms/programs' },
            { label: 'Camp Programs', href: '/admin/cms/camps' },
            { label: 'Blog Posts', href: '/admin/cms/blog' },
            { label: 'Locations', href: '/admin/cms/locations' },
            { label: 'Careers', href: '/admin/cms/careers' },
            { label: 'FAQs', href: '/admin/cms/faqs' },
            { label: 'About Page', href: '/admin/cms/about' },
            { label: 'Contact Info', href: '/admin/cms/contact' },
        ]
    },
    {
        icon: Users,
        label: 'User Management',
        href: '/admin/users',
        submenu: [
            { label: 'All Users', href: '/admin/users' },
            { label: 'Create User (any role)', href: '/admin/users/create' },
            { label: 'Role & Permissions', href: '/admin/users/roles' }
        ]
    },
    {
        icon: Settings,
        label: 'Business Config (BCMS)',
        href: '/admin/business-config',
        submenu: [
            { label: 'Countries & Regions', href: '/admin/business-config/regions' },
            { label: 'Business Units', href: '/admin/business-config/units' },
            { label: 'Locations & Rooms', href: '/admin/business-config/locations' },
            { label: 'Terms & Holidays', href: '/admin/business-config/terms' },
            { label: 'Payment Gateways', href: '/admin/business-config/payments' }
        ]
    },
    {
        icon: Calendar,
        label: 'Programs & Scheduling',
        href: '/admin/programs',
        submenu: [
            { label: 'Program Catalog', href: '/admin/programs/catalog' },
            { label: 'Schedule Management', href: '/admin/programs/schedule' },
            { label: 'Rules Engine', href: '/admin/programs/rules' }
        ]
    },
    {
        icon: UserCheck,
        label: 'Operations',
        href: '/admin/operations',
        submenu: [
            { label: 'Staff Management', href: '/admin/operations/staff' },
            { label: 'Attendance', href: '/admin/operations/attendance' },
            { label: 'Bookings', href: '/admin/operations/bookings' }
        ]
    },
    {
        icon: CreditCard,
        label: 'Finance',
        href: '/admin/finance',
        submenu: [
            { label: 'Payments & Billing', href: '/admin/finance/payments' },
            { label: 'Revenue Reports', href: '/admin/finance/revenue' },
            { label: 'Financial Ledger', href: '/admin/finance/ledger' }
        ]
    },
    {
        icon: BarChart3,
        label: 'Reports & Analytics',
        href: '/admin/reports',
        submenu: [
            { label: 'Enrollment Reports', href: '/admin/reports/enrollment' },
            { label: 'Performance Analytics', href: '/admin/reports/performance' },
            { label: 'Audit Logs', href: '/admin/reports/audit' }
        ]
    },
    {
        icon: MessageSquare,
        label: 'Communications',
        href: '/admin/communications',
        submenu: [
            { label: 'Notifications', href: '/admin/communications/notifications' },
            { label: 'Templates', href: '/admin/communications/templates' },
            { label: 'CRM', href: '/admin/communications/crm' }
        ]
    },
    {
        icon: Shield,
        label: 'System',
        href: '/admin/system',
        submenu: [
            { label: 'Security Center', href: '/admin/system/security' },
            { label: 'API Monitoring', href: '/admin/system/api' },
            { label: 'Database Health', href: '/admin/system/database' },
            { label: 'Feature Flags', href: '/admin/system/features' },
            { label: 'Integration Gateway', href: '/admin/system/integrations' },
            { label: 'System Logs', href: '/admin/system/logs' }
        ]
    },
    {
        icon: Bell,
        label: 'Support',
        href: '/admin/support',
        submenu: [
            { label: 'Tickets', href: '/admin/support/tickets' },
            { label: 'Knowledge Base', href: '/admin/support/knowledge' }
        ]
    }
]

const colors = {
    gradient: 'from-red-600 to-pink-600',
    bg: 'from-red-50 to-pink-50',
    text: 'text-red-600'
}

const SIDEBAR_EXPANDED = 280
const SIDEBAR_COLLAPSED = 72

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    useAuth()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login/staff' })
    const [userName, setUserName] = useState('Admin User')
    const [userEmail, setUserEmail] = useState('admin@proactiv.com')

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

    // Load user data from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)
                setUserName(user.name || user.fullName || user.firstName + ' ' + user.lastName || 'Admin User')
                setUserEmail(user.email || 'admin@proactiv.com')
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    // Sub-admin routes have their own layout — skip parent chrome
    if (pathname?.startsWith('/admin/hq') || pathname?.startsWith('/admin/regional') || pathname?.startsWith('/admin/franchise') || pathname?.startsWith('/admin/location')) {
        return <>{children}</>
    }

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
        return pathname === href
    }

    const handleNavigation = (href: string, e: React.MouseEvent) => {
        e.preventDefault()
        router.push(href)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Sidebar - Fixed Position */}
            <div
                className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200/50 z-50 transition-all duration-300 ease-in-out"
                style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
                            <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            {!sidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-lg font-bold text-gray-900">ProActive Sports</h2>
                                    <p className={`text-sm ${colors.text} font-medium capitalize`}>
                                        Admin Portal
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Menu - Scrollable */}
                <div className="flex-1 overflow-y-auto p-2">
                    <nav className="space-y-1">
                        {adminMenuItems.map((item, index) => (
                            <div key={item.href} className="relative">
                                {item.submenu ? (
                                    // Menu item with submenu
                                    <div className="relative group">
                                        <button id="admin-layout-btn"
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
                                                ? `bg-gray-100 ${colors.text}`
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
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-1 ml-8 space-y-1 bg-gray-50 rounded-lg p-2 border border-gray-200"
                                            >
                                                {item.submenu?.map((subItem: { label: string; href: string }) => (
                                                    <button id="admin-layout-btn-2"
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
                                    <div className="relative group">
                                        <button id="admin-layout-btn-3"
                                            onClick={(e) => handleNavigation(item.href, e)}
                                            onMouseEnter={() => sidebarCollapsed && setHoveredItem(item.href)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${isActiveLink(item.href)
                                                ? `bg-gray-100 ${colors.text}`
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActiveLink(item.href) ? colors.text : 'text-gray-600'}`} />
                                            {!sidebarCollapsed && (
                                                <span className="font-medium text-sm">{item.label}</span>
                                            )}
                                        </button>

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

                {/* Collapse Toggle Button */}
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

                {/* Sidebar Footer - pinned to bottom */}
                <div className="flex-shrink-0 border-t border-gray-200/50 bg-white px-3 pt-3 pb-2">
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
                                            {userName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center">
                            <Button id="admin-layout-btn-5"
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
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Welcome back, {userName}!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <NotificationBell />
                            <Button id="admin-layout-btn-7" variant="outline" size="sm">
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
                        exit={{ opacity: 0, y: -20 }}
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
                userName={userName.split(' ')[0]}
                unsavedPages={unsavedPages}
            />
        </div>
    )
}
