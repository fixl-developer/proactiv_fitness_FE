'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LogoutModal from '@/components/ui/LogoutModal'
import { authService } from '@/services/modules/auth.service'
import {
    LayoutDashboard, Ticket, Users, Settings, BarChart3,
    HelpCircle, MessageSquare, Bell, LogOut, Menu, X,
    Calendar, Clock, FileText, Zap, Shield, Database,
    Headphones, UserCheck, TrendingUp, Mail, Phone
} from 'lucide-react'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
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
        const roleStr = typeof parsedUser.role === 'object' ? parsedUser.role?.name : parsedUser.role
        parsedUser.role = roleStr

        // Only SUPPORT_STAFF and ADMIN can access
        if (roleStr !== 'SUPPORT_STAFF' && roleStr !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

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
        { name: 'Quality Assurance', href: '/staff/quality', icon: Shield },
        { name: 'Communication', href: '/staff/communication', icon: Mail },
        { name: 'Settings', href: '/staff/settings', icon: Settings },
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
                        <button id="staff-layout-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Ticket className="w-6 h-6 text-blue-600" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Support Portal</h1>
                                <p className="text-xs text-gray-500">Support Staff Dashboard</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button id="staff-layout-btn-2" className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <button id="staff-layout-btn-3"
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
                    {navigation.map((item) => (
                        <Link id="staff-layout-nav"
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
            <main className={`pt-14 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                <div className="p-4">
                    {children}
                </div>
            </main>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={user?.name?.split(' ')[0]}
            />
        </div>
    )
}
