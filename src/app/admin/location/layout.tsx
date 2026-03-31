'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard, Building2, Users, Settings, BarChart3,
    Calendar, LogOut, Menu, UserCheck, Clock, Phone, User,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import NotificationBell from '@/components/shared/NotificationBell'

const navigation = [
    { name: 'Dashboard', href: '/admin/location/dashboard', icon: LayoutDashboard },
    { name: 'Classes', href: '/admin/location/classes', icon: Calendar },
    { name: 'Staff', href: '/admin/location/staff', icon: Users },
    { name: 'Attendance', href: '/admin/location/attendance', icon: UserCheck },
    { name: 'Waitlist', href: '/admin/location/waitlist', icon: Clock },
    { name: 'Facilities', href: '/admin/location/facilities', icon: Building2 },
    { name: 'Emergency Contacts', href: '/admin/location/emergency-contacts', icon: Phone },
    { name: 'Analytics', href: '/admin/location/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/location/settings', icon: Settings },
]

const colors = {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'from-orange-50 to-amber-50',
    text: 'text-orange-600',
    activeBg: 'bg-orange-50',
    hoverBg: 'hover:bg-orange-50/60',
}

const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 72

export default function LocationManagerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login/staff' })

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login/staff'
            return
        }

        const parsedUser = JSON.parse(userData)

        if (parsedUser.role !== 'LOCATION_MANAGER' && parsedUser.role !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    const userName = user.name || 'Location Manager'
    const userEmail = user.email || ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50">
            {/* Sidebar - Fixed */}
            <div
                className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200/50 z-50 transition-all duration-300 ease-in-out"
                style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-lg font-bold text-gray-900">Location Manager</h2>
                                <p className={`text-sm ${colors.text} font-medium`}>Daily Operations</p>
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
                                        id="admin-location-layout-nav"
                                        onClick={() => router.push(item.href)}
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
                                id="btn-admin-location-logout"
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
                {/* Header - Fixed */}
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
                                <h1 className="text-xl font-semibold text-gray-900">Location Dashboard</h1>
                                <p className="text-sm text-gray-500">Welcome back, {userName.split(' ')[0]}!</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <NotificationBell />
                            <Button id="btn-admin-location-settings" variant="outline" size="sm" onClick={() => router.push('/admin/location/settings')}>
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

            {/* Logout Modal */}
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
