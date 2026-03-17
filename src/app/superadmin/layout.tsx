'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
    Home,
    Settings,
    Users,
    Shield,
    Database,
    Activity,
    LogOut,
    User,
    Menu,
    ChevronDown,
    ChevronRight,
    Crown,
    Server,
    Lock,
    Eye,
    HardDrive,
    Zap,
    Globe,
    FileText,
    Bell,
    AlertTriangle,
    BarChart3,
    Cog,
    Key,
    Wifi,
    Cloud,
    Terminal,
    Archive,
    RefreshCw,
    Layers,
    Sparkles,
    TrendingUp,
    DollarSign,
    CheckSquare,
    Gauge,
    Mail,
    AlertCircle,
    Brain
} from 'lucide-react'

interface MenuItem {
    icon: any
    label: string
    href: string
    submenu?: { label: string; href: string }[]
    badge?: string
    badgeColor?: string
}

interface SuperAdminLayoutProps {
    children: ReactNode
}

const superAdminMenuItems: MenuItem[] = [
    {
        icon: Home,
        label: 'Dashboard',
        href: '/superadmin/dashboard'
    },
    {
        icon: Server,
        label: 'System Management',
        href: '/superadmin/system',
        submenu: [
            { label: 'System Overview', href: '/superadmin/system/overview' },
            { label: 'Server Status', href: '/superadmin/system/servers' },
            { label: 'Performance Metrics', href: '/superadmin/system/performance' },
            { label: 'Resource Usage', href: '/superadmin/system/resources' },
            { label: 'System Health', href: '/superadmin/system/health' }
        ]
    },
    {
        icon: Users,
        label: 'Global User Management',
        href: '/superadmin/users',
        submenu: [
            { label: 'All Users', href: '/superadmin/users' },
            { label: 'Role Management', href: '/superadmin/users/roles' },
            { label: 'Permission Matrix', href: '/superadmin/users/permissions' },
            { label: 'User Sessions', href: '/superadmin/users/sessions' },
            { label: 'Account Policies', href: '/superadmin/users/policies' }
        ]
    },
    {
        icon: Shield,
        label: 'Security & Audit',
        href: '/superadmin/security',
        badge: 'Critical',
        badgeColor: 'bg-red-500',
        submenu: [
            { label: 'Security Dashboard', href: '/superadmin/security/dashboard' },
            { label: 'Audit Logs', href: '/superadmin/security/audit' },
            { label: 'Access Control', href: '/superadmin/security/access' },
            { label: 'Security Policies', href: '/superadmin/security/policies' },
            { label: 'Threat Detection', href: '/superadmin/security/threats' },
            { label: 'Compliance Reports', href: '/superadmin/security/compliance' }
        ]
    },
    {
        icon: Database,
        label: 'Database Management',
        href: '/superadmin/database',
        submenu: [
            { label: 'Database Overview', href: '/superadmin/database/overview' },
            { label: 'Query Performance', href: '/superadmin/database/performance' },
            { label: 'Data Integrity', href: '/superadmin/database/integrity' },
            { label: 'Backup Management', href: '/superadmin/database/backups' },
            { label: 'Migration Tools', href: '/superadmin/database/migrations' }
        ]
    },
    {
        icon: Activity,
        label: 'System Monitoring',
        href: '/superadmin/monitoring',
        badge: 'Live',
        badgeColor: 'bg-green-500',
        submenu: [
            { label: 'Real-time Metrics', href: '/superadmin/monitoring/realtime' },
            { label: 'Application Performance', href: '/superadmin/monitoring/performance' },
            { label: 'Error Tracking', href: '/superadmin/monitoring/errors' },
            { label: 'Uptime Monitoring', href: '/superadmin/monitoring/uptime' },
            { label: 'Alert Management', href: '/superadmin/monitoring/alerts' }
        ]
    },
    {
        icon: FileText,
        label: 'System Logs',
        href: '/superadmin/logs',
        submenu: [
            { label: 'Application Logs', href: '/superadmin/logs/application' },
            { label: 'Error Logs', href: '/superadmin/logs/errors' },
            { label: 'Access Logs', href: '/superadmin/logs/access' },
            { label: 'Security Logs', href: '/superadmin/logs/security' },
            { label: 'System Events', href: '/superadmin/logs/events' }
        ]
    },
    {
        icon: Cog,
        label: 'Platform Settings',
        href: '/superadmin/platform',
        submenu: [
            { label: 'Global Configuration', href: '/superadmin/platform/config' },
            { label: 'Feature Flags', href: '/superadmin/platform/features' },
            { label: 'Environment Variables', href: '/superadmin/platform/environment' },
            { label: 'API Configuration', href: '/superadmin/platform/api' },
            { label: 'Cache Management', href: '/superadmin/platform/cache' }
        ]
    },
    {
        icon: Globe,
        label: 'Integrations',
        href: '/superadmin/integrations',
        submenu: [
            { label: 'Third-party APIs', href: '/superadmin/integrations/apis' },
            { label: 'Webhooks', href: '/superadmin/integrations/webhooks' },
            { label: 'Payment Gateways', href: '/superadmin/integrations/payments' },
            { label: 'Email Services', href: '/superadmin/integrations/email' },
            { label: 'SMS Services', href: '/superadmin/integrations/sms' }
        ]
    },
    {
        icon: Archive,
        label: 'Backup & Recovery',
        href: '/superadmin/backups',
        submenu: [
            { label: 'Backup Status', href: '/superadmin/backups/status' },
            { label: 'Backup Schedules', href: '/superadmin/backups/schedules' },
            { label: 'Recovery Tools', href: '/superadmin/backups/recovery' },
            { label: 'Data Export', href: '/superadmin/backups/export' },
            { label: 'Disaster Recovery', href: '/superadmin/backups/disaster' }
        ]
    },
    {
        icon: BarChart3,
        label: 'Global Analytics',
        href: '/superadmin/analytics',
        submenu: [
            { label: 'Platform Analytics', href: '/superadmin/analytics/platform' },
            { label: 'User Analytics', href: '/superadmin/analytics/users' },
            { label: 'Performance Analytics', href: '/superadmin/analytics/performance' },
            { label: 'Business Intelligence', href: '/superadmin/analytics/business' },
            { label: 'Custom Reports', href: '/superadmin/analytics/reports' }
        ]
    },
    {
        icon: Terminal,
        label: 'Developer Tools',
        href: '/superadmin/developer',
        submenu: [
            { label: 'API Documentation', href: '/superadmin/developer/api' },
            { label: 'Database Console', href: '/superadmin/developer/console' },
            { label: 'Log Viewer', href: '/superadmin/developer/logs' },
            { label: 'Performance Profiler', href: '/superadmin/developer/profiler' },
            { label: 'Debug Tools', href: '/superadmin/developer/debug' }
        ]
    },
    {
        icon: Brain,
        label: 'AI Insights',
        href: '/superadmin/ai',
        badge: 'New',
        badgeColor: 'bg-blue-500',
        submenu: [
            { label: 'AI Recommendations', href: '/superadmin/ai/recommendations' },
            { label: 'Predictive Analytics', href: '/superadmin/ai/predictions' },
            { label: 'Anomaly Detection', href: '/superadmin/ai/anomalies' },
            { label: 'Performance Insights', href: '/superadmin/ai/insights' }
        ]
    },
    {
        icon: Gauge,
        label: 'Real-time Monitoring',
        href: '/superadmin/monitoring',
        badge: 'Live',
        badgeColor: 'bg-green-500',
        submenu: [
            { label: 'Live Dashboard', href: '/superadmin/monitoring/live' },
            { label: 'System Metrics', href: '/superadmin/monitoring/metrics' },
            { label: 'Network Traffic', href: '/superadmin/monitoring/network' },
            { label: 'Service Health', href: '/superadmin/monitoring/health' }
        ]
    },
    {
        icon: DollarSign,
        label: 'Cost Analytics',
        href: '/superadmin/costs',
        submenu: [
            { label: 'Infrastructure Costs', href: '/superadmin/costs/infrastructure' },
            { label: 'Usage Breakdown', href: '/superadmin/costs/breakdown' },
            { label: 'Budget Alerts', href: '/superadmin/costs/alerts' },
            { label: 'Cost Optimization', href: '/superadmin/costs/optimization' }
        ]
    },
    {
        icon: CheckSquare,
        label: 'Compliance',
        href: '/superadmin/compliance',
        submenu: [
            { label: 'Compliance Status', href: '/superadmin/compliance/status' },
            { label: 'Audit Reports', href: '/superadmin/compliance/audit' },
            { label: 'Policy Management', href: '/superadmin/compliance/policies' },
            { label: 'Certifications', href: '/superadmin/compliance/certifications' }
        ]
    },
    {
        icon: Gauge,
        label: 'API Rate Limiting',
        href: '/superadmin/api-limits',
        submenu: [
            { label: 'Rate Limits', href: '/superadmin/api-limits/limits' },
            { label: 'Quota Management', href: '/superadmin/api-limits/quotas' },
            { label: 'Usage Analytics', href: '/superadmin/api-limits/usage' },
            { label: 'Throttling Rules', href: '/superadmin/api-limits/rules' }
        ]
    },
    {
        icon: Mail,
        label: 'Email Templates',
        href: '/superadmin/email-templates',
        submenu: [
            { label: 'Template Library', href: '/superadmin/email-templates/library' },
            { label: 'Create Template', href: '/superadmin/email-templates/create' },
            { label: 'Email Campaigns', href: '/superadmin/email-templates/campaigns' },
            { label: 'Delivery Logs', href: '/superadmin/email-templates/logs' }
        ]
    },
    {
        icon: Bell,
        label: 'Notification Center',
        href: '/superadmin/notifications',
        badge: '5',
        badgeColor: 'bg-red-500',
        submenu: [
            { label: 'All Notifications', href: '/superadmin/notifications/all' },
            { label: 'Notification Rules', href: '/superadmin/notifications/rules' },
            { label: 'Channels', href: '/superadmin/notifications/channels' },
            { label: 'Templates', href: '/superadmin/notifications/templates' }
        ]
    },
    {
        icon: TrendingUp,
        label: 'Health Predictor',
        href: '/superadmin/health-predictor',
        submenu: [
            { label: 'System Predictions', href: '/superadmin/health-predictor/predictions' },
            { label: 'Failure Risk', href: '/superadmin/health-predictor/risk' },
            { label: 'Capacity Planning', href: '/superadmin/health-predictor/capacity' },
            { label: 'Recommendations', href: '/superadmin/health-predictor/recommendations' }
        ]
    }
]

const colors = {
    gradient: 'from-purple-600 to-indigo-600',
    bg: 'from-purple-50 to-indigo-50',
    text: 'text-purple-600'
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout, user, isAuthenticated, isLoading } = useAuth()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    const [userName, setUserName] = useState('Super Administrator')
    const [userEmail, setUserEmail] = useState('superadmin@proactiv.com')

    // Auth guard: only SUPER_ADMIN can access
    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        const roleStr = typeof user?.role === 'object' ? (user?.role as any)?.name : user?.role
        if (roleStr !== 'SUPER_ADMIN') {
            router.push('/unauthorized')
            return
        }
        if (user?.name) setUserName(user.name)
        if (user?.email) setUserEmail(user.email)
    }, [isAuthenticated, isLoading, user, router])

    // Auto-expand menus based on current path
    useEffect(() => {
        const currentPath = pathname
        superAdminMenuItems.forEach(item => {
            if (item.submenu && currentPath.startsWith(item.href)) {
                setExpandedMenus(prev =>
                    prev.includes(item.href) ? prev : [...prev, item.href]
                )
            }
        })
    }, [pathname])

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    const roleStr = typeof user?.role === 'object' ? (user?.role as any)?.name : user?.role
    if (!isAuthenticated || roleStr !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

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

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50">
            {/* Sidebar - Fixed Position */}
            <div
                className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200/50 z-50 flex flex-col shadow-xl"
                style={{ width: '300px' }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3"
                    >
                        <div className={`w-12 h-12 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">ProActive Sports</h2>
                            <p className={`text-sm ${colors.text} font-medium flex items-center`}>
                                <Shield className="w-3 h-3 mr-1" />
                                Super Admin Portal
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Menu - Scrollable */}
                <div className="flex-1 overflow-y-auto p-2">
                    <nav className="space-y-1">
                        {superAdminMenuItems.map((item, index) => (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {item.submenu ? (
                                    // Menu item with submenu
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleSubmenu(item.href)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                ? `bg-gray-100 ${colors.text}`
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <item.icon className={`w-5 h-5 ${expandedMenus.includes(item.href) || pathname.startsWith(item.href)
                                                    ? colors.text
                                                    : 'text-gray-600'
                                                    }`} />
                                                <span className="font-medium text-sm">{item.label}</span>
                                                {item.badge && (
                                                    <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${item.badgeColor}`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            {expandedMenus.includes(item.href) ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>

                                        {/* Submenu */}
                                        {expandedMenus.includes(item.href) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-2 ml-8 space-y-1 bg-gray-50 rounded-lg p-2 border border-gray-200"
                                            >
                                                {item.submenu?.map((subItem: { label: string; href: string }) => (
                                                    <button
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
                                    <button
                                        onClick={(e) => handleNavigation(item.href, e)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${isActiveLink(item.href)
                                            ? `bg-gray-100 ${colors.text}`
                                            : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon className={`w-5 h-5 ${isActiveLink(item.href) ? colors.text : 'text-gray-600'}`} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer - Always at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        {/* User Info */}
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${colors.bg} border border-gray-200/50`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center`}>
                                    <Crown className="w-4 h-4 text-white" />
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

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-gray-600 hover:text-gray-900"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Alerts
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ marginLeft: '300px' }}>
                {/* Header - Fixed Position */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
                    style={{ left: '300px', right: 0 }}
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <Menu className="w-5 h-5 text-gray-600" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <Crown className="w-5 h-5 mr-2 text-purple-600" />
                                    Super Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-500">
                                    System Administrator - Full Platform Control
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                System Alerts
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                                <Activity className="w-4 h-4 mr-2" />
                                System Health
                            </Button>
                            <Button variant="outline" size="sm">
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
        </div>
    )
}
