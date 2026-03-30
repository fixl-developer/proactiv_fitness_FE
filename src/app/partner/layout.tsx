'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import NotificationBell from '@/components/shared/NotificationBell'
import { PartnerProvider, usePartnerConfig } from '@/contexts/PartnerContext'
import {
    LayoutDashboard, DollarSign, Settings, BarChart3,
    TrendingUp, Zap, LogOut, Menu, X, Briefcase,
    BookOpen, Users, FileText, Shield, MessageSquare,
    Target, Book, HelpCircle, Wallet, GraduationCap,
    Dumbbell, Building2, Trophy, Heart, Landmark, Medal
} from 'lucide-react'

// Map icon names to components for dynamic rendering
const ICON_MAP: Record<string, any> = {
    GraduationCap, Dumbbell, Building2, Trophy, Heart, Landmark, Medal, Briefcase
}

function PartnerLayoutInner({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { config, partnerType } = usePartnerConfig()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login/staff'
            return
        }

        const parsedUser = JSON.parse(userData)
        const roleStr = typeof parsedUser.role === 'object' ? parsedUser.role?.name : parsedUser.role
        parsedUser.role = roleStr

        if (roleStr !== 'PARTNER_ADMIN' && roleStr !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }

        setUser(parsedUser)
    }, [router])

    const { showLogoutModal, unsavedPages, handleLogoutClick, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login/staff' })

    // Dynamic navigation based on partner type
    const navigation = [
        { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
        { name: config.programLabel, href: '/partner/programs', icon: BookOpen },
        { name: config.memberLabel, href: '/partner/students', icon: Users },
        { name: 'Reports', href: '/partner/reports', icon: FileText },
        { name: 'Commissions', href: '/partner/commissions', icon: DollarSign },
        { name: 'Analytics', href: '/partner/analytics', icon: BarChart3 },
        { name: 'Integrations', href: '/partner/integrations', icon: Zap },
        { name: 'Marketing', href: '/partner/marketing', icon: TrendingUp },
        { name: 'Financial', href: '/partner/financial', icon: Wallet },
        { name: 'Communication', href: '/partner/communication', icon: MessageSquare },
        { name: 'Performance', href: '/partner/performance', icon: Target },
        { name: 'Resources', href: '/partner/resources', icon: Book },
        { name: 'Support', href: '/partner/support', icon: HelpCircle },
        { name: 'Compliance', href: '/partner/compliance', icon: Shield },
        { name: 'Settings', href: '/partner/settings', icon: Settings },
    ]

    // Get the partner type icon
    const PartnerIcon = ICON_MAP[config.iconName] || Briefcase

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
                        <button id="partner-layout-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <PartnerIcon className={`w-6 h-6 ${config.color}`} />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Partner Portal</h1>
                                <p className="text-xs text-gray-500">{config.label} Administration</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{config.label} Partner</p>
                            </div>
                            <button id="partner-layout-btn-3"
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
                <nav className="p-2 space-y-1">
                    {navigation.map((item) => (
                        <Link id="partner-layout-nav"
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
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
                onClose={closeLogoutModal}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={user?.name?.split(' ')[0]}
                unsavedPages={unsavedPages}
            />
        </div>
    )
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <PartnerProvider>
            <PartnerLayoutInner>{children}</PartnerLayoutInner>
        </PartnerProvider>
    )
}
