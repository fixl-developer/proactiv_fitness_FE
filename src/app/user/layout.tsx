'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Calendar,
    CreditCard,
    TrendingUp,
    Award,
    User,
    LogOut,
    Settings,
    Menu,
    Utensils,
    CheckCircle2,
    Bell,
    Heart,
    Wallet,
    Share2,
    HelpCircle,
    MessageSquare,
    Download,
    ChevronDown,
    Globe
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'
import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import NotificationBell from '@/components/shared/NotificationBell'

const navigationSections = [
    {
        title: 'Dashboard',
        items: [
            { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
            { name: 'Attendance', href: '/user/attendance', icon: CheckCircle2 },
            { name: 'Schedule', href: '/user/schedule', icon: Calendar },
            { name: 'Notifications', href: '/user/notifications', icon: Bell },
        ]
    },
    {
        title: 'Learning & Classes',
        items: [
            { name: 'Browse Classes', href: '/user/browse-classes', icon: Calendar },
            { name: 'My Classes', href: '/user/my-classes', icon: Calendar },
            { name: 'Bookings', href: '/user/bookings', icon: Calendar },
        ]
    },
    {
        title: 'Fitness & Health',
        items: [
            { name: 'Progress', href: '/user/progress', icon: TrendingUp },
            { name: 'Nutrition', href: '/user/nutrition', icon: Utensils },
            { name: 'Health Metrics', href: '/user/health-metrics', icon: Heart },
            { name: 'Achievements', href: '/user/achievements', icon: Award },
        ]
    },
    {
        title: 'Financial',
        items: [
            { name: 'Payments', href: '/user/payments', icon: CreditCard },
            { name: 'Wallet', href: '/user/wallet', icon: Wallet },
            { name: 'Referrals', href: '/user/referrals', icon: Share2 },
        ]
    },
    {
        title: 'Personal',
        items: [
            { name: 'Profile', href: '/user/profile', icon: User },
            { name: 'Certificates', href: '/user/certificates', icon: Award },
            { name: 'Settings', href: '/user/settings', icon: Settings },
        ]
    },
    {
        title: 'Support',
        items: [
            { name: 'Support', href: '/user/support', icon: HelpCircle },
            { name: 'Feedback', href: '/user/feedback', icon: MessageSquare },
            { name: 'Downloads', href: '/user/downloads', icon: Download },
        ]
    }
]

const colors = {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-emerald-50 to-teal-50',
    text: 'text-emerald-600',
    activeBg: 'bg-emerald-50',
    hoverBg: 'hover:bg-emerald-50/60',
}

const SIDEBAR_EXPANDED = 280
const SIDEBAR_COLLAPSED = 72

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { isAuthenticated, isLoading, user, role } = useAuth()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const [expandedSections, setExpandedSections] = useState<string[]>([
        'Dashboard',
        'Learning & Classes',
        'Fitness & Health',
        'Financial',
        'Personal',
        'Support'
    ])
    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login' })
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

    // useLayoutEffect runs synchronously before the browser paints, so
    // marginLeft/header-left land at the correct mobile value (0) on the
    // first frame instead of flashing the desktop layout. SSR is unaffected
    // because useLayoutEffect is a no-op on the server.
    const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
    useIsoLayoutEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            if (mobile) setMobileMenuOpen(false)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => { setMobileMenuOpen(false) }, [pathname])

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (role) {
            const upper = String(role).toUpperCase()
            const allowed = ['USER', 'STUDENT', 'ADMIN']
            if (!allowed.includes(upper)) {
                rbacManager.setRole(upper)
                const target = rbacManager.getDashboard()
                router.push(target && target !== '/login' ? target : '/unauthorized')
            }
        }
    }, [isAuthenticated, isLoading, role, router])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const displayName = user?.name || (user as any)?.firstName || 'User'
    const userEmail = user?.email || ''

    const getInitials = () => {
        const first = (user as any)?.firstName || ''
        const last = (user as any)?.lastName || ''
        if (first && last) return (first[0] + last[0]).toUpperCase()
        const name = displayName.trim()
        if (!name || name === 'User') return 'U'
        const parts = name.split(' ')
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        return name[0].toUpperCase()
    }

    const toggleSection = (sectionTitle: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionTitle)
                ? prev.filter(s => s !== sectionTitle)
                : [...prev, sectionTitle]
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
            {/* Mobile overlay */}
            {isMobile && mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Fixed on desktop, slide-over on mobile.
                Use Tailwind responsive classes so SSR + first paint hide it on
                mobile without waiting for a useEffect to update isMobile. */}
            <div
                className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200/50 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-lg font-bold text-gray-900">ProActiv</h2>
                                <p className={`text-sm ${colors.text} font-medium`}>User Portal</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Sidebar Menu - Scrollable */}
                <div className="flex-1 overflow-y-auto p-2 hover:overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 transition-colors"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'transparent transparent'
                    }}
                    onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.scrollbarColor = 'rgb(209, 213, 219) transparent'
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.scrollbarColor = 'transparent transparent'
                    }}
                >
                    <nav className="space-y-1">
                        {navigationSections.map((section) => {
                            const isExpanded = expandedSections.includes(section.title)
                            const hasActiveItem = section.items.some(item => pathname === item.href)

                            return (
                                <div key={section.title} className="mb-2">
                                    {/* Section Header */}
                                    {!sidebarCollapsed && (
                                        <button
                                            onClick={() => toggleSection(section.title)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${hasActiveItem ? colors.text : 'text-gray-500'} hover:text-gray-700`}
                                        >
                                            <span>{section.title}</span>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </motion.div>
                                        </button>
                                    )}

                                    {/* Section Items */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: sidebarCollapsed || isExpanded ? 'auto' : 0,
                                            opacity: sidebarCollapsed || isExpanded ? 1 : 0
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-1">
                                            {section.items.map((item) => {
                                                const isActive = pathname === item.href
                                                return (
                                                    <div key={item.name} className="relative">
                                                        <button
                                                            id={`user-layout-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                                            onClick={() => { router.push(item.href); setMobileMenuOpen(false) }}
                                                            onMouseEnter={() => sidebarCollapsed && setHoveredItem(item.href)}
                                                            onMouseLeave={() => setHoveredItem(null)}
                                                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 ${isActive
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
                                        </div>
                                    </motion.div>
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
                                <div className={`w-9 h-9 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${colors.bg} border border-gray-200/50`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <Button
                                id="user-layout-logout-btn"
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
            <div
                className="transition-all duration-300 ease-in-out"
                style={{
                    marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                }}
            >
                {/* Header - Fixed */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300 ease-in-out right-0"
                    style={{
                        left: isMobile ? 0 : `${sidebarWidth}px`,
                        right: 0,
                    }}
                >
                    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                            <button
                                onClick={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                title={isMobile ? 'Toggle menu' : (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">User Dashboard</h1>
                                <p className="text-xs md:text-sm text-gray-500 hidden sm:block truncate">Welcome back, {displayName.split(' ')[0]}!</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                            <NotificationBell />
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    id="user-layout-profile-toggle-btn"
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Profile menu"
                                >
                                    <div className={`w-9 h-9 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                                        {getInitials()}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                                        {getInitials()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                id="user-layout-visit-website-btn"
                                                onClick={() => { setProfileMenuOpen(false); router.push('/') }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Globe className={`w-4 h-4 ${colors.text}`} />
                                                <span className="font-medium">Visit Website</span>
                                            </button>
                                            <button
                                                id="user-layout-logout-dropdown-btn"
                                                onClick={() => { setProfileMenuOpen(false); handleLogoutClick() }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="flex-1 pt-16 md:pt-20 p-3 md:p-6 overflow-y-auto">
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
                userName={displayName.split(' ')[0]}
                unsavedPages={unsavedPages}
            />
        </div>
    )
}
