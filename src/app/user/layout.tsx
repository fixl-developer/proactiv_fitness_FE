'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, CreditCard, TrendingUp, Award, User, LogOut, Globe, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useRef } from 'react'
import LogoutModal from '@/components/ui/LogoutModal'

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { isAuthenticated, isLoading, user, logout, softLogout } = useAuth()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, isLoading, router])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const navigation = [
        { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
        { name: 'My Classes', href: '/user/my-classes', icon: Calendar },
        { name: 'Bookings', href: '/user/bookings', icon: Calendar },
        { name: 'Payments', href: '/user/payments', icon: CreditCard },
        { name: 'Progress', href: '/user/progress', icon: TrendingUp },
        { name: 'Achievements', href: '/user/achievements', icon: Award },
        { name: 'Profile', href: '/user/profile', icon: User }
    ]

    const handleLogoutClick = () => {
        setIsProfileOpen(false)
        setShowLogoutModal(true)
    }

    const handleSaveAndLogout = () => {
        softLogout()
        setShowLogoutModal(false)
        router.push('/login')
    }

    const handlePermanentLogout = async () => {
        await logout()
        setShowLogoutModal(false)
        router.push('/login')
    }

    const getInitials = () => {
        const u = user as any
        if (!u) return 'U'
        const firstName = u.firstName || ''
        const lastName = u.lastName || ''
        if (firstName && lastName) {
            return (firstName[0] + lastName[0]).toUpperCase()
        }
        const name = u.name || u.email || ''
        if (!name) return 'U'
        const parts = name.trim().split(' ')
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return name[0].toUpperCase()
    }

    const displayName = user?.name || (user as any)?.firstName || 'User'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">ProActiv</h1>
                            <p className="text-xs text-gray-500">User Portal</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => router.push(item.href)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="pl-64">
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                {getInitials()}
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {getInitials()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visit Website */}
                                <button
                                    onClick={() => { setIsProfileOpen(false); router.push('/') }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Globe className="w-4 h-4 text-emerald-600" />
                                    <span className="font-medium">Visit Website</span>
                                </button>

                                {/* Logout */}
                                <button
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={displayName.split(' ')[0]}
            />
        </div>
    )
}
