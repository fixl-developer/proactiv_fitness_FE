'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    LayoutDashboard, Building2, Users, Settings, BarChart3,
    Calendar, Zap, Bell, LogOut, Menu, X, UserCheck, Clock, Phone
} from 'lucide-react'

export default function LocationManagerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        // Check authentication and role
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login/staff'
            return
        }

        const parsedUser = JSON.parse(userData)

        // Only LOCATION_MANAGER and ADMIN can access
        if (parsedUser.role !== 'LOCATION_MANAGER' && parsedUser.role !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/login/staff'
    }

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
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button id="admin-location-layout-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Location Manager</h1>
                                <p className="text-xs text-gray-500">Daily Operations</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button id="admin-location-layout-btn-2" className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <button id="admin-location-layout-btn-3"
                                onClick={handleLogout}
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
                    {navigation.map((item) => (
                        <Link id="admin-location-layout-nav"
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
