'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, Building2, Users, Settings, BarChart3,
    MapPin, Shield, TrendingUp, LogOut, Menu, DollarSign, ShieldCheck, Target
} from 'lucide-react'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import NotificationBell from '@/components/shared/NotificationBell'

export default function RegionalAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login/staff' })

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login/staff'
            return
        }

        const parsedUser = JSON.parse(userData)
        const roleStr = typeof parsedUser.role === 'object' ? parsedUser.role?.name : parsedUser.role
        parsedUser.role = roleStr

        if (roleStr !== 'REGIONAL_ADMIN' && roleStr !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    const navigation = [
        { name: 'Dashboard', href: '/admin/regional/dashboard', icon: LayoutDashboard },
        { name: 'Locations', href: '/admin/regional/locations', icon: Building2 },
        { name: 'Staff', href: '/admin/regional/staff', icon: Users },
        { name: 'Analytics', href: '/admin/regional/analytics', icon: BarChart3 },
        { name: 'Reports', href: '/admin/regional/reports', icon: TrendingUp },
        { name: 'Approvals', href: '/admin/regional/approvals', icon: Shield },
        { name: 'Budget', href: '/admin/regional/budget', icon: DollarSign },
        { name: 'Compliance', href: '/admin/regional/compliance', icon: ShieldCheck },
        { name: 'Benchmarks', href: '/admin/regional/benchmarks', icon: Target },
        { name: 'Settings', href: '/admin/regional/settings', icon: Settings },
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
                        <button id="btn-admin-regional-1"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Regional Command</h1>
                                <p className="text-xs text-gray-500">Regional Administration</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <button id="btn-admin-regional-2"
                                onClick={handleLogoutClick}
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
                            <Link id="admin-regional-layout-nav"
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
                onClose={closeLogoutModal}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={user.name?.split(' ')[0]}
                unsavedPages={unsavedPages}
            />
        </div>
    )
}
