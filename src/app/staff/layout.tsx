'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import NotificationBell from '@/components/shared/NotificationBell'
import {
    LayoutDashboard, Ticket, Settings, BarChart3,
    HelpCircle, MessageSquare, LogOut, Menu,
    Calendar, FileText, Zap,
    Headphones, UserCheck, TrendingUp, Mail,
    User, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', href: '/staff/tickets', icon: Ticket },
    { name: 'Inquiries', href: '/staff/inquiries', icon: MessageSquare },
    { name: 'Knowledge Base', href: '/staff/knowledge', icon: HelpCircle },
    { name: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
    { name: 'Live Chat', href: '/staff/live-chat', icon: Headphones },
    { name: 'Escalations', href: '/staff/escalations', icon: TrendingUp },
    { name: 'Schedules', href: '/staff/schedules', icon: Calendar },
    { name: 'Training', href: '/staff/training', icon: UserCheck },
    { name: 'Reports', href: '/staff/reports', icon: FileText },
    { name: 'Automation', href: '/staff/automation', icon: Zap },
    { name: 'Communication', href: '/staff/communication', icon: Mail },
    { name: 'Settings', href: '/staff/settings', icon: Settings },
]

const colors = {
    gradient: 'from-cyan-600 to-sky-600',
    bg: 'from-cyan-50 to-sky-50',
    text: 'text-cyan-600',
    activeBg: 'bg-cyan-50',
    hoverBg: 'hover:bg-cyan-50/60',
}

const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 72

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login/staff' })

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login/staff'
            return
        }

        const parsedUser = JSON.parse(userData)
        const roleStr = typeof parsedUser.role === 'object' ? parsedUser.role?.name : parsedUser.role
        parsedUser.role = roleStr

        const allowed = ['SUPPORT_STAFF', 'STAFF', 'ADMIN']
        if (!allowed.includes(String(roleStr).toUpperCase())) {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        )
    }

    const userName = user.name || 'Support Staff'
    const userEmail = user.email || ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-sky-50/50">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            {/* Sidebar - Fixed, hidden on mobile unless toggled */}
            <div
                className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200/50 z-50 transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <Headphones className="w-6 h-6 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-lg font-bold text-gray-900">Support Portal</h2>
                                <p className={`text-sm ${colors.text} font-medium`}>Support Staff</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Sidebar Menu - Scrollable */}
                <div className="flex-1 overflow-y-auto p-2">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <div key={item.name} className="relative">
                                    <button
                                        id="staff-layout-nav"
                                        onClick={() => { router.push(item.href); setMobileOpen(false) }}
                                        onMouseEnter={() => sidebarCollapsed && setHoveredItem(item.href)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 ${
                                            isActive
                                                ? `${colors.activeBg} ${colors.text} font-semibold`
                                                : `text-gray-700 ${colors.hoverBg} hover:text-gray-900`
                                        }`}
                                    >
                                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? colors.text : 'text-gray-600'}`} />
                                        {!sidebarCollapsed && (
                                            <span className="font-medium text-sm">{item.name}</span>
                                        )}
                                    </button>

                                    {/* Tooltip for collapsed state */}
                                    {sidebarCollapsed && hoveredItem === item.href && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-[100] shadow-lg">
                                            {item.name}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>


                {/* Sidebar Footer - User Info + Logout */}
                <div className="flex-shrink-0 border-t border-gray-200/50 bg-white px-3 pt-3 pb-2">
                    <div className="space-y-2">
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
                                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <Button
                                id="staff-layout-btn-logout"
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
            <div className="transition-all duration-300 ease-in-out" style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}>
                {/* Header - Fixed */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300 ease-in-out"
                    style={{ left: isMobile ? 0 : `${sidebarWidth}px`, right: 0 }}
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title={isMobile ? 'Toggle menu' : sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Support Dashboard</h1>
                                <p className="text-sm text-gray-500">Welcome back, {userName.split(' ')[0]}!</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <NotificationBell />
                            <Button id="staff-layout-btn-settings" variant="outline" size="sm" onClick={() => router.push('/staff/settings')}>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="pt-24 md:pt-28 p-4 md:p-6 min-h-screen">
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
