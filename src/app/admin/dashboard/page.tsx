'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Calendar, DollarSign, TrendingUp, Star,
    Building2, UserCheck, Target, Bell, RefreshCw, Activity, Award,
    CheckCircle, Zap, ArrowUp, Eye, Plus, BarChart3, AlertTriangle,
    MapPin, Clock, Filter, ChevronDown, Globe, Wifi, AlertCircle,
    TrendingDown, ArrowRight, ExternalLink, Settings, Search,
    FileText, MessageSquare, Shield, Database, Headphones
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { responsiveClasses } from '@/lib/responsiveClasses'

const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7d' | '30d'>('today')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')
    const [alertsExpanded, setAlertsExpanded] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                window.location.href = '/login'
                return
            }
        }
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Business locations for multi-outlet filtering
    const locations = [
        { id: 'all', name: 'All Locations', type: 'global' },
        { id: 'cyberport', name: 'ProGym Cyberport', type: 'gym' },
        { id: 'wanchai', name: 'ProGym Wan Chai', type: 'gym' },
        { id: 'school-programs', name: 'School Programs', type: 'school' },
        { id: 'camps', name: 'Holiday Camps', type: 'camp' },
        { id: 'montessori', name: 'Montessori Pok Fu Lam', type: 'partner' },
        { id: 'kellett', name: 'Kellett School', type: 'partner' },
        { id: 'ims', name: 'International Montessori', type: 'partner' }
    ]

    // Enhanced business metrics with location awareness
    const getLocationStats = (locationId: string) => {
        const baseStats = {
            totalRevenue: 2850000,
            monthlyRevenue: 485000,
            dailyRevenue: 15800,
            revenueGrowth: 18.5,
            totalOutlets: 16,
            activeStudents: 3420,
            todayAssessments: 12,
            conversionRate: 68.5,
            activeClasses: 89,
            coachUtilization: 78.5,
            pendingPayments: 24500,
            avgRating: 4.7,
            memberRetention: 87.3
        }

        if (locationId === 'all') return baseStats

        // Location-specific adjustments (simulated)
        const locationMultipliers: { [key: string]: number } = {
            'cyberport': 0.25,
            'wanchai': 0.20,
            'school-programs': 0.35,
            'camps': 0.15,
            'montessori': 0.05
        }

        const multiplier = locationMultipliers[locationId] || 0.1
        return {
            ...baseStats,
            totalRevenue: Math.round(baseStats.totalRevenue * multiplier),
            monthlyRevenue: Math.round(baseStats.monthlyRevenue * multiplier),
            dailyRevenue: Math.round(baseStats.dailyRevenue * multiplier),
            activeStudents: Math.round(baseStats.activeStudents * multiplier),
            todayAssessments: Math.round(baseStats.todayAssessments * multiplier),
            activeClasses: Math.round(baseStats.activeClasses * multiplier),
            pendingPayments: Math.round(baseStats.pendingPayments * multiplier)
        }
    }

    const stats = getLocationStats(selectedLocation)

    // Conversion Funnel Data
    const conversionFunnel = [
        { stage: 'Website Visits', count: 2450, percentage: 100, color: 'bg-blue-500' },
        { stage: 'Assessment Bookings', count: 1225, percentage: 50, color: 'bg-green-500' },
        { stage: 'Assessments Completed', count: 980, percentage: 40, color: 'bg-yellow-500' },
        { stage: 'Trial Classes', count: 735, percentage: 30, color: 'bg-orange-500' },
        { stage: 'Enrollments', count: 490, percentage: 20, color: 'bg-purple-500' },
        { stage: 'Active Students', count: 441, percentage: 18, color: 'bg-red-500' }
    ]

    // Smart Alerts System with Actions
    const smartAlerts = [
        {
            id: 1,
            type: 'critical',
            category: 'operations',
            title: 'Underfilled Classes Alert',
            message: 'Cyberport Beginner 1 (3-5 years) has only 2/8 students for tomorrow 4:00 PM',
            location: 'ProGym Cyberport',
            time: '5m ago',
            priority: 'high',
            action: 'Reschedule or merge classes',
            actionUrl: '/admin/schedule?location=cyberport&class=beginner1',
            impact: 'Revenue Loss: HK$480'
        },
        {
            id: 2,
            type: 'warning',
            category: 'staff',
            title: 'Coach Scheduling Conflict',
            message: 'Monica has overlapping classes at Cyberport (4:00 PM) and Wan Chai (4:30 PM)',
            location: 'Multiple Locations',
            time: '12m ago',
            priority: 'high',
            action: 'Reassign coach or reschedule',
            actionUrl: '/admin/staff?coach=monica&date=tomorrow',
            impact: 'Service Disruption Risk'
        },
        {
            id: 3,
            type: 'critical',
            category: 'payments',
            title: 'Payment Gateway Issue',
            message: 'Stripe processing experiencing 15% failure rate in last hour',
            location: 'All Locations',
            time: '18m ago',
            priority: 'critical',
            action: 'Switch to backup gateway',
            actionUrl: '/admin/payments/gateways',
            impact: 'Revenue Loss: HK$2,400/hour'
        },
        {
            id: 4,
            type: 'warning',
            category: 'sop',
            title: 'SOP Violation Detected',
            message: 'Manual override used for class capacity at Wan Chai (12/10 students)',
            location: 'ProGym Wan Chai',
            time: '25m ago',
            priority: 'medium',
            action: 'Review safety protocols',
            actionUrl: '/admin/sop/violations?id=4',
            impact: 'Safety Compliance Risk'
        },
        {
            id: 5,
            type: 'info',
            category: 'ai',
            title: 'High Chatbot Handover Rate',
            message: 'AI chatbot → human handover rate increased to 35% (normal: 15%)',
            location: 'All Locations',
            time: '45m ago',
            priority: 'medium',
            action: 'Review chatbot training',
            actionUrl: '/admin/ai/chatbot/analytics',
            impact: 'Support Efficiency Drop'
        },
        {
            id: 6,
            type: 'success',
            category: 'business',
            title: 'Conversion Rate Milestone',
            message: 'School Programs achieved 75% assessment → enrollment conversion',
            location: 'School Programs',
            time: '1h ago',
            priority: 'low',
            action: 'Analyze success factors',
            actionUrl: '/admin/analytics/conversion?unit=school-programs',
            impact: 'Best Practice Opportunity'
        }
    ]

    // Business Unit Performance
    const businessUnits = [
        {
            id: 'gym-locations',
            name: 'Gym Locations',
            outlets: 8,
            activeTerms: 3,
            revenue: 1425000,
            growth: 15.2,
            conversion: 72.5,
            utilization: 85,
            status: 'excellent',
            kpis: {
                students: 1850,
                classes: 156,
                coaches: 24
            }
        },
        {
            id: 'school-programs',
            name: 'School Programs',
            outlets: 6,
            activeTerms: 2,
            revenue: 998000,
            growth: 22.8,
            conversion: 68.2,
            utilization: 92,
            status: 'excellent',
            kpis: {
                students: 1200,
                classes: 89,
                coaches: 18
            }
        },
        {
            id: 'partner-gyms',
            name: 'Partner Gyms',
            outlets: 4,
            activeTerms: 2,
            revenue: 327000,
            growth: 8.5,
            conversion: 58.9,
            utilization: 76,
            status: 'good',
            kpis: {
                students: 280,
                classes: 32,
                coaches: 8
            }
        },
        {
            id: 'camps-events',
            name: 'Camps & Events',
            outlets: 2,
            activeTerms: 1,
            revenue: 100000,
            growth: -5.2,
            conversion: 45.3,
            utilization: 65,
            status: 'needs-attention',
            kpis: {
                students: 90,
                classes: 12,
                coaches: 4
            }
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            'excellent': 'text-green-600 bg-green-50 border-green-200',
            'good': 'text-blue-600 bg-blue-50 border-blue-200',
            'needs-attention': 'text-orange-600 bg-orange-50 border-orange-200',
            'critical': 'text-red-600 bg-red-50 border-red-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getAlertColor = (type: string) => {
        const colors = {
            critical: 'border-l-4 border-red-500 bg-red-50',
            warning: 'border-l-4 border-yellow-500 bg-yellow-50',
            success: 'border-l-4 border-green-500 bg-green-50',
            info: 'border-l-4 border-blue-500 bg-blue-50'
        }
        return colors[type as keyof typeof colors] || 'border-l-4 border-gray-500 bg-gray-50'
    }

    const getAlertIcon = (category: string) => {
        const icons = {
            operations: Calendar,
            staff: UserCheck,
            payments: DollarSign,
            sop: Shield,
            ai: MessageSquare,
            business: TrendingUp
        }
        return icons[category as keyof typeof icons] || AlertCircle
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Enhanced Header with Location Switcher */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
                    >
                        Business Command Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 mt-2"
                    >
                        Real-time operations across <span className="font-semibold text-violet-600">{stats.totalOutlets}</span> locations
                    </motion.p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {/* Global Location Switcher */}
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg">
                            <Globe className="w-4 h-4 text-violet-600" />
                        </div>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger className="w-48 border-violet-200 hover:border-violet-300 transition-colors">
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent className="border-violet-200">
                                {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${location.type === 'global' ? 'bg-violet-500' :
                                                location.type === 'gym' ? 'bg-emerald-500' :
                                                    location.type === 'school' ? 'bg-purple-500' :
                                                        location.type === 'camp' ? 'bg-orange-500' : 'bg-gray-500'
                                                }`} />
                                            {location.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 w-full sm:w-auto shadow-sm">
                        <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-xs sm:text-sm font-medium text-emerald-700">Live Data</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRefreshing(true)}
                        disabled={refreshing}
                        className="w-full sm:w-auto border-violet-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>

                    <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-1 w-full sm:w-auto shadow-sm border border-gray-200">
                        {['today', '7d', '30d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setSelectedTimeRange(range as any)}
                                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${selectedTimeRange === range
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === '7d' ? '7D' : '30D'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Layer 1: Top KPI Cards (Business Health) - Location Aware */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    {
                        title: 'Active Students',
                        value: (stats.activeStudents || 0).toLocaleString(),
                        growth: '+12.8%',
                        icon: Users,
                        color: 'text-blue-600',
                        status: stats.activeStudents > 3000 ? 'excellent' : 'good'
                    },
                    {
                        title: 'Assessments (This Week)',
                        value: stats.todayAssessments,
                        growth: 'Live tracking',
                        icon: CheckCircle,
                        color: 'text-green-600',
                        status: stats.todayAssessments > 10 ? 'excellent' : 'good'
                    },
                    {
                        title: 'Conversion Rate',
                        value: `${stats.conversionRate}%`,
                        growth: stats.conversionRate > 65 ? 'Excellent' : 'Good',
                        icon: Target,
                        color: 'text-purple-600',
                        status: stats.conversionRate > 65 ? 'excellent' : 'good'
                    },
                    {
                        title: 'Active Classes Today',
                        value: stats.activeClasses,
                        growth: 'Live tracking',
                        icon: Calendar,
                        color: 'text-orange-600',
                        status: 'excellent'
                    },
                    {
                        title: 'Coach Utilization',
                        value: `${stats.coachUtilization}%`,
                        growth: 'Optimal range',
                        icon: UserCheck,
                        color: 'text-pink-600',
                        status: stats.coachUtilization > 75 ? 'excellent' : 'good'
                    },
                    {
                        title: 'Monthly Revenue',
                        value: `HK$${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
                        growth: `+${stats.revenueGrowth}%`,
                        icon: DollarSign,
                        color: 'text-green-600',
                        status: 'excellent'
                    },
                    {
                        title: 'Pending Payments',
                        value: `HK$${(stats.pendingPayments / 1000).toFixed(0)}K`,
                        growth: 'Needs attention',
                        icon: AlertTriangle,
                        color: 'text-red-600',
                        status: stats.pendingPayments > 20000 ? 'needs-attention' : 'good'
                    },
                    {
                        title: 'Average Rating',
                        value: `${stats.avgRating}/5.0`,
                        growth: 'Excellent',
                        icon: Star,
                        color: 'text-yellow-600',
                        status: 'excellent'
                    }
                ].map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="group"
                    >
                        <Card className="relative overflow-hidden h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm">
                            {/* Animated Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${metric.color === 'text-blue-600' ? 'from-blue-500 to-cyan-500' :
                                metric.color === 'text-green-600' ? 'from-emerald-500 to-teal-500' :
                                    metric.color === 'text-purple-600' ? 'from-purple-500 to-violet-500' :
                                        metric.color === 'text-orange-600' ? 'from-orange-500 to-amber-500' :
                                            metric.color === 'text-pink-600' ? 'from-pink-500 to-rose-500' :
                                                metric.color === 'text-red-600' ? 'from-red-500 to-pink-500' :
                                                    metric.color === 'text-yellow-600' ? 'from-yellow-500 to-orange-500' : 'from-gray-500 to-gray-600'
                                } opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                                    {metric.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-xl bg-gradient-to-r ${metric.color === 'text-blue-600' ? 'from-blue-500 to-cyan-500' :
                                        metric.color === 'text-green-600' ? 'from-emerald-500 to-teal-500' :
                                            metric.color === 'text-purple-600' ? 'from-purple-500 to-violet-500' :
                                                metric.color === 'text-orange-600' ? 'from-orange-500 to-amber-500' :
                                                    metric.color === 'text-pink-600' ? 'from-pink-500 to-rose-500' :
                                                        metric.color === 'text-red-600' ? 'from-red-500 to-pink-500' :
                                                            metric.color === 'text-yellow-600' ? 'from-yellow-500 to-orange-500' : 'from-gray-500 to-gray-600'
                                        } text-white shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                                        <metric.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${metric.status === 'excellent' ? 'bg-emerald-500' :
                                        metric.status === 'good' ? 'bg-blue-500' :
                                            metric.status === 'needs-attention' ? 'bg-orange-500' : 'bg-red-500'
                                        }`} />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                                    {metric.value}
                                </div>
                                <div className="flex items-center mt-2">
                                    <ArrowUp className={`w-4 h-4 ${metric.color} mr-1 group-hover:animate-bounce`} />
                                    <span className={`text-sm font-medium ${metric.color}`}>{metric.growth}</span>
                                </div>
                                <div className="mt-4">
                                    <Progress
                                        value={75}
                                        className="h-2 bg-gray-200 group-hover:bg-gray-300 transition-colors"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Layer 2: Conversion Funnel & Smart Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel Widget */}
                <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Conversion Funnel
                                </CardTitle>
                            </div>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1">
                                {stats.conversionRate}% Overall
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {conversionFunnel.map((stage, index) => (
                                <motion.div
                                    key={stage.stage}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{(stage.count || 0).toLocaleString()}</span>
                                            <span className="text-xs text-gray-500">({stage.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <motion.div
                                            className={`h-3 rounded-full ${stage.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stage.percentage}%` }}
                                            transition={{ delay: index * 0.2, duration: 0.8 }}
                                        />
                                    </div>
                                    {index < conversionFunnel.length - 1 && (
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                    <Eye className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-blue-900">AI Insights</span>
                            </div>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• 50% drop-off at assessment booking stage</li>
                                <li>• Strong trial → enrollment conversion (67%)</li>
                                <li>• Focus on assessment booking optimization</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Smart Alerts & Action Items */}
                <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white shadow-lg animate-pulse">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                    Smart Alerts & Actions
                                </CardTitle>
                                <Badge variant="destructive" className="animate-bounce">
                                    {smartAlerts.filter(a => a.priority === 'critical' || a.priority === 'high').length}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAlertsExpanded(!alertsExpanded)}
                                className="border-violet-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105"
                            >
                                {alertsExpanded ? 'Show Less' : 'View All'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {(alertsExpanded ? smartAlerts : smartAlerts.slice(0, 3)).map((alert, index) => {
                                const AlertIcon = getAlertIcon(alert.category)
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg ${getAlertColor(alert.type)} hover:shadow-md transition-shadow cursor-pointer`}
                                        onClick={() => window.open(alert.actionUrl, '_blank')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <AlertIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                            {alert.title}
                                                        </h4>
                                                        <Badge
                                                            variant={alert.priority === 'critical' ? 'destructive' :
                                                                alert.priority === 'high' ? 'destructive' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {alert.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-700 mb-2">{alert.message}</p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">{alert.location} • {alert.time}</span>
                                                        <span className="font-medium text-red-600">{alert.impact}</span>
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Button size="sm" variant="outline" className="text-xs h-6">
                                                            {alert.action}
                                                        </Button>
                                                        <ExternalLink className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Layer 3: Business Unit Performance & Outlet Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Units Performance */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            <CardTitle>Business Unit Performance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {businessUnits.map((unit, index) => (
                                <motion.div
                                    key={unit.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                                            <p className="text-sm text-gray-600">{unit.outlets} outlets • {unit.activeTerms} active terms</p>
                                        </div>
                                        <Badge className={getStatusColor(unit.status)}>
                                            {unit.status.replace('-', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Revenue</p>
                                            <p className="text-sm font-bold text-green-600">
                                                HK${(unit.revenue / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Growth</p>
                                            <p className={`text-sm font-bold ${unit.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {unit.growth > 0 ? '+' : ''}{unit.growth}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Conversion</p>
                                            <p className="text-sm font-bold text-blue-600">{unit.conversion}%</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-gray-600">Utilization</span>
                                        <span className="font-medium">{unit.utilization}%</span>
                                    </div>
                                    <Progress value={unit.utilization} className="h-2 mb-3" />

                                    <div className="flex items-center justify-between text-xs">
                                        <span>{unit.kpis.students} students</span>
                                        <span>{unit.kpis.classes} classes</span>
                                        <span>{unit.kpis.coaches} coaches</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Control Center</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Users, label: 'Add Student', href: '/admin/students/new' },
                                        { icon: Calendar, label: 'Schedule Class', href: '/admin/schedule/new' },
                                        { icon: UserCheck, label: 'Manage Staff', href: '/admin/staff' },
                                        { icon: Building2, label: 'New Outlet', href: '/admin/locations/new' },
                                        { icon: DollarSign, label: 'Process Payment', href: '/admin/payments' },
                                        { icon: BarChart3, label: 'View Reports', href: '/admin/analytics' }
                                    ].map((action, index) => (
                                        <Button
                                            key={index}
                                            className="h-16 flex-col gap-2"
                                            variant="outline"
                                            onClick={() => window.location.href = action.href}
                                        >
                                            <action.icon className="w-5 h-5" />
                                            <span className="text-xs text-center">{action.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* System Status */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">System Status</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Payment Gateway', status: 'operational', icon: DollarSign },
                                        { label: 'Booking System', status: 'operational', icon: Calendar },
                                        { label: 'AI Chatbot', status: 'degraded', icon: MessageSquare },
                                        { label: 'Database', status: 'operational', icon: Database },
                                        { label: 'Support System', status: 'operational', icon: Headphones }
                                    ].map((system, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <system.icon className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium">{system.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${system.status === 'operational' ? 'bg-green-500' :
                                                    system.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`} />
                                                <span className={`text-xs font-medium capitalize ${system.status === 'operational' ? 'text-green-600' :
                                                    system.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {system.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminDashboard