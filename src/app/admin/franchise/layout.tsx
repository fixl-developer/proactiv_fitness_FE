'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, Building2, Users, Settings, BarChart3,
    TrendingUp, DollarSign, Bell, LogOut, Menu, Package,
    Megaphone, MessageSquare, FileText
} from 'lucide-react'
import LogoutModal from '@/components/ui/LogoutModal'

export default function FranchiseOwnerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login/staff'
            return
        }

        const parsedUser = JSON.parse(userData)
        const roleStr = typeof parsedUser.role === 'object' ? parsedUser.role?.name : parsedUser.role
        parsedUser.role = roleStr

        if (roleStr !== 'FRANCHISE_OWNER' && roleStr !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    const handleSaveAndLogout = () => {
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

    const navigation = [
        { name: 'Dashboard', href: '/admin/franchise/dashboard', icon: LayoutDashboard },
        { name: 'Locations', href: '/admin/franchise/locations', icon: Building2 },
        { name: 'Staff', href: '/admin/franchise/staff', icon: Users },
        { name: 'Revenue', href: '/admin/franchise/revenue', icon: DollarSign },
        { name: 'Analytics', href: '/admin/franchise/analytics', icon: BarChart3 },
        { name: 'Inventory', href: '/admin/franchise/inventory', icon: Package },
        { name: 'Marketing', href: '/admin/franchise/marketing', icon: Megaphone },
        { name: 'Feedback', href: '/admin/franchise/feedback', icon: MessageSquare },
        { name: 'Financial Reports', href: '/admin/franchise/financial-reports', icon: FileText },
        { name: 'Settings', href: '/admin/franchise/settings', icon: Settings },
    ]

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-4">
                        <button data-testid="btn-admin-franchise-1"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Franchise Dashboard</h1>
                                <p className="text-xs text-gray-500">Franchise Owner Portal</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <button data-testid="btn-admin-franchise-2"
                                onClick={() => setShowLogoutModal(true)}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <nav className="p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`pt-14 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                <div className="p-4">
                    {children}
                </div>
            </main>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={user.name?.split(' ')[0]}
            />
        </div>
    )
}
