'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import CommissionService from '@/services/modules/commission.service'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
    AlertCircle, TrendingUp, Users, DollarSign, Award, BookOpen, Target,
    BarChart3, ArrowUpRight, ArrowDownRight, Calendar, Bell, Clock,
    CheckCircle, Activity, UserPlus, CreditCard, Eye, ChevronRight,
    Brain, Sparkles, Loader2, RefreshCw, Zap, Send, Megaphone
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { usePartnerConfig } from '@/contexts/PartnerContext'
import { revenueIntelligenceService, globalIntelligenceService } from '@/services/advancedAIServices'
import { formatAIResponse } from '@/utils/formatAIResponse'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function PartnerDashboard() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { config } = usePartnerConfig()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [commissionStats, setCommissionStats] = useState<any>(null)
    const [trendData, setTrendData] = useState<any[]>([])
    const [revenueData, setRevenueData] = useState<any>(null)
    const [programs, setPrograms] = useState<any[]>([])
    const [recentStudents, setRecentStudents] = useState<any[]>([])
    const [recentBookings, setRecentBookings] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [goals, setGoals] = useState<any[]>([])
    const [qualityMetrics, setQualityMetrics] = useState<any>(null)
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const [optimizations, upsells] = await Promise.allSettled([
                revenueIntelligenceService.getOptimizationSuggestions(),
                revenueIntelligenceService.getUpsellOpportunities()
            ])
            const opts = optimizations.status === 'fulfilled' ? optimizations.value?.data || optimizations.value : null
            const ups = upsells.status === 'fulfilled' ? upsells.value?.data || upsells.value : null
            setAiInsights({ optimizations: opts, upsells: ups })
        } catch (err) { console.error('AI unavailable:', err); setAiInsights(null) }
        finally { setAiLoading(false) }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadDashboardData()
        loadAiInsights()
    }, [isAuthenticated, router, user])

    const loadDashboardData = async () => {
        setLoading(true)
        setError(null)

        const partnerId = user?.id || 'partner-1'

        const [
            profileRes, metricsRes, commissionRes, trendsRes,
            revenueRes, programsRes, studentsRes, bookingsRes,
            notificationsRes, goalsRes, qualityRes
        ] = await Promise.allSettled([
            PartnerPortalService.getPartnerProfile(partnerId),
            PartnerAnalyticsService.getPerformanceMetrics(partnerId),
            CommissionService.getCommissionStats(partnerId),
            PartnerAnalyticsService.getPerformanceTrends(partnerId),
            PartnerAnalyticsService.getRevenueAnalytics(partnerId),
            PartnerPortalService.getPartnerPrograms(partnerId, { limit: 6 }),
            PartnerPortalService.getPartnerStudents(partnerId, { limit: 5 }),
            PartnerPortalService.getPartnerBookings(partnerId, { limit: 5 }),
            PartnerPortalService.getPartnerNotifications(partnerId, { limit: 5 }),
            PartnerAnalyticsService.getGoalProgress(partnerId, { limit: 4 }),
            PartnerAnalyticsService.getQualityMetrics(partnerId)
        ])

        setProfile(profileRes.status === 'fulfilled' ? profileRes.value : null)
        setMetrics(metricsRes.status === 'fulfilled' ? metricsRes.value : null)
        setCommissionStats(commissionRes.status === 'fulfilled' ? commissionRes.value : null)
        setTrendData(trendsRes.status === 'fulfilled' ? (trendsRes.value || []) : [])
        setRevenueData(revenueRes.status === 'fulfilled' ? revenueRes.value : null)
        setPrograms(
            programsRes.status === 'fulfilled'
                ? (programsRes.value?.programs || [])
                : []
        )
        setRecentStudents(
            studentsRes.status === 'fulfilled'
                ? (studentsRes.value?.students || [])
                : []
        )
        setRecentBookings(
            bookingsRes.status === 'fulfilled'
                ? (bookingsRes.value?.bookings || [])
                : []
        )
        setNotifications(
            notificationsRes.status === 'fulfilled'
                ? (notificationsRes.value?.notifications || [])
                : []
        )
        setGoals(
            goalsRes.status === 'fulfilled'
                ? (goalsRes.value?.goals || [])
                : []
        )
        setQualityMetrics(qualityRes.status === 'fulfilled' ? qualityRes.value : null)

        setLoading(false)
    }

    useRealtimeRefresh(['program', 'booking', 'crm', 'payment'], loadDashboardData)

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const totalRevenue = metrics?.totalRevenue || 0
    const totalStudents = metrics?.totalStudents || 0
    const totalPrograms = metrics?.totalPrograms || 0
    const avgRating = metrics?.averageRating || 0
    const growthRate = metrics?.growthRate || 0
    const retentionRate = metrics?.retentionRate || 0
    const conversionRate = metrics?.conversionRate || 0
    const totalCommissions = commissionStats?.totalCommissions || 0
    const totalPending = commissionStats?.totalPending || 0
    const totalPaid = commissionStats?.totalPaid || 0
    const revenueByProgram = revenueData?.revenueByProgram || []
    const unreadNotifications = notifications.filter((n: any) => !n.isRead).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{config.dashboardTitle}</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {profile?.name || user?.name || 'Partner'} — {(config as any).welcomeMessage || ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    {profile?.tier && (
                        <Badge className={`text-sm px-3 py-1 ${
                            profile.tier === 'platinum' ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white' :
                            profile.tier === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white' :
                            profile.tier === 'silver' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                            'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                        }`}>
                            {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} Partner
                        </Badge>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    {
                        title: 'Total Revenue',
                        value: `$${(totalRevenue / 1000).toFixed(1)}K`,
                        icon: DollarSign,
                        gradient: 'from-blue-500 to-blue-600',
                        bgGradient: 'from-blue-50 to-blue-100',
                        change: `${growthRate >= 0 ? '+' : ''}${growthRate}%`,
                        changePositive: growthRate >= 0
                    },
                    {
                        title: `Total ${config.memberLabel}`,
                        value: totalStudents.toLocaleString(),
                        icon: Users,
                        gradient: 'from-green-500 to-emerald-600',
                        bgGradient: 'from-green-50 to-emerald-100',
                        change: `${totalStudents} ${config.enrolledLabel.toLowerCase()}`,
                        changePositive: true
                    },
                    {
                        title: 'Commission Earned',
                        value: `$${(totalCommissions / 1000).toFixed(1)}K`,
                        icon: TrendingUp,
                        gradient: 'from-purple-500 to-purple-600',
                        bgGradient: 'from-purple-50 to-purple-100',
                        change: `$${(totalPending / 1000).toFixed(1)}K pending`,
                        changePositive: true
                    },
                    {
                        title: 'Active Programs',
                        value: String(totalPrograms),
                        icon: BookOpen,
                        gradient: 'from-orange-500 to-orange-600',
                        bgGradient: 'from-orange-50 to-orange-100',
                        change: `${programs.filter((p: any) => p.status === 'active').length} running`,
                        changePositive: true
                    },
                    {
                        title: 'Rating',
                        value: `${avgRating.toFixed(1)}/5`,
                        icon: Award,
                        gradient: 'from-pink-500 to-pink-600',
                        bgGradient: 'from-pink-50 to-pink-100',
                        change: `${retentionRate}% retention`,
                        changePositive: retentionRate >= 80
                    },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                                        metric.changePositive
                                            ? 'text-green-600 bg-green-100'
                                            : 'text-red-600 bg-red-100'
                                    }`}>
                                        {metric.changePositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {metric.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Revenue Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" />
                                        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="url(#revenueGrad)"
                                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No revenue trend data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Student Growth */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-600" />
                                {config.memberLabelSingular} Growth
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={trendData}>
                                        <defs>
                                            <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#059669" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="students" fill="url(#studentGrad)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    <div className="text-center">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No {config.memberLabelLower} growth data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Programs & Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue by Program (Pie Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-5 h-5 text-purple-600" />
                                Revenue by Program
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueByProgram.length > 0 ? (
                                <div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={revenueByProgram}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="revenue"
                                                nameKey="program"
                                            >
                                                {revenueByProgram.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-2">
                                        {revenueByProgram.slice(0, 4).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                                    />
                                                    <span className="text-gray-600 truncate max-w-[120px]">{item.program}</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">${item.revenue.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[280px] text-gray-400">
                                    <p>No program data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Programs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="lg:col-span-2">
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                Top {config.programLabel}
                            </CardTitle>
                            <button
                                onClick={() => router.push('/partner/programs')}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {programs.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">{config.programLabelSingular}</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">{config.memberLabel}</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {programs.slice(0, 5).map((program: any) => (
                                                <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-2.5 px-4">
                                                        <span className="font-medium text-gray-900 text-sm">{program.name}</span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-sm text-gray-700">{program.enrolledStudents}</td>
                                                    <td className="py-2.5 px-4 text-sm font-semibold text-gray-900">${program.revenue?.toLocaleString()}</td>
                                                    <td className="py-2.5 px-4">
                                                        <div className="flex items-center gap-1">
                                                            <Award className="w-3.5 h-3.5 text-yellow-500" />
                                                            <span className="text-sm text-gray-700">{program.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-4">
                                                        <Badge className={`text-xs ${
                                                            program.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {program.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No {config.programLabel.toLowerCase()} available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Students & Upcoming Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Students */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserPlus className="w-5 h-5 text-green-600" />
                                Recent {config.memberLabel}
                            </CardTitle>
                            <button
                                onClick={() => router.push('/partner/students')}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent>
                            {recentStudents.length > 0 ? (
                                <div className="space-y-3">
                                    {recentStudents.slice(0, 5).map((student: any) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {student.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.enrolledPrograms} program{student.enrolledPrograms !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm text-gray-900">${student.totalSpent?.toLocaleString()}</p>
                                                <Badge className={`text-[10px] ${
                                                    student.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {student.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-400">
                                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No {config.memberLabelLower} yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Upcoming Bookings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Upcoming Bookings
                            </CardTitle>
                            <button
                                onClick={() => router.push('/partner/bookings')}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent>
                            {recentBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {recentBookings.map((booking: any) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    booking.status === 'confirmed'
                                                        ? 'bg-green-100'
                                                        : booking.status === 'pending'
                                                        ? 'bg-yellow-100'
                                                        : 'bg-gray-100'
                                                }`}>
                                                    <Clock className={`w-4 h-4 ${
                                                        booking.status === 'confirmed'
                                                            ? 'text-green-600'
                                                            : booking.status === 'pending'
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{booking.studentName}</p>
                                                    <p className="text-xs text-gray-500">{booking.programName}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-700">{booking.time}</p>
                                                <Badge className={`text-[10px] ${
                                                    booking.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : booking.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {booking.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-400">
                                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No upcoming bookings</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Goals & Commission Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Goal Progress */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="w-5 h-5 text-red-600" />
                                Goal Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {goals.length > 0 ? (
                                <div className="space-y-4">
                                    {goals.map((goal: any) => (
                                        <div key={goal.goalId}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium text-gray-700">{goal.goalName}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-900">{goal.progress}%</span>
                                                    <Badge className={`text-[10px] ${
                                                        goal.status === 'on-track'
                                                            ? 'bg-green-100 text-green-700'
                                                            : goal.status === 'at-risk'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {goal.status?.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Progress value={goal.progress} className="h-2" />
                                            <p className="text-xs text-gray-400 mt-1">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-400">
                                    <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No goals set yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Commission Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="w-5 h-5 text-purple-600" />
                                Commission Summary
                            </CardTitle>
                            <button
                                onClick={() => router.push('/partner/commissions')}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                Details <ChevronRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Total</p>
                                    <p className="text-lg font-bold text-purple-700">${totalCommissions.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Paid</p>
                                    <p className="text-lg font-bold text-green-700">${totalPaid.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Pending</p>
                                    <p className="text-lg font-bold text-amber-700">${totalPending.toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Payout Progress</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {totalCommissions > 0 ? ((totalPaid / totalCommissions) * 100).toFixed(0) : '0'}%
                                    </span>
                                </div>
                                <Progress
                                    value={totalCommissions > 0 ? (totalPaid / totalCommissions) * 100 : 0}
                                    className="h-2.5"
                                />
                            </div>
                            {profile?.commissionRate && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm text-gray-700">Your Commission Rate</span>
                                    <Badge className="bg-blue-100 text-blue-800 text-sm">{profile.commissionRate}%</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Notifications & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Notifications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bell className="w-5 h-5 text-amber-600" />
                                Recent Notifications
                                {unreadNotifications > 0 && (
                                    <Badge className="bg-red-100 text-red-700 text-xs ml-1">{unreadNotifications} new</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.slice(0, 4).map((notif: any) => (
                                        <div
                                            key={notif.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                                notif.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'
                                            }`}
                                        >
                                            <div className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${
                                                notif.type === 'alert' ? 'bg-red-100' :
                                                notif.type === 'update' ? 'bg-blue-100' :
                                                notif.type === 'reminder' ? 'bg-yellow-100' :
                                                'bg-purple-100'
                                            }`}>
                                                {notif.type === 'alert' ? <AlertCircle className="w-3.5 h-3.5 text-red-600" /> :
                                                 notif.type === 'update' ? <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> :
                                                 notif.type === 'reminder' ? <Clock className="w-3.5 h-3.5 text-yellow-600" /> :
                                                 <Bell className="w-3.5 h-3.5 text-purple-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-400">
                                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No notifications</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Performance Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                                    <p className={`text-sm font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                                    </p>
                                </div>
                                <Progress value={Math.min(Math.abs(growthRate), 100)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                    <p className="text-sm font-bold text-blue-600">{conversionRate.toFixed(1)}%</p>
                                </div>
                                <Progress value={conversionRate} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                                    <p className="text-sm font-bold text-purple-600">{retentionRate.toFixed(1)}%</p>
                                </div>
                                <Progress value={retentionRate} className="h-2" />
                            </div>
                            {qualityMetrics && (
                                <>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-600">Quality Score</p>
                                            <p className="text-sm font-bold text-emerald-600">{qualityMetrics.qualityScore}%</p>
                                        </div>
                                        <Progress value={qualityMetrics.qualityScore} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                            <p className="text-sm font-bold text-orange-600">{qualityMetrics.completionRate}%</p>
                                        </div>
                                        <Progress value={qualityMetrics.completionRate} className="h-2" />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* AI Insights */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    <CardTitle>AI Insights</CardTitle>
                                    <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                                </div>
                                <button onClick={loadAiInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                                    <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {aiLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                    <p className="text-sm text-gray-500">Generating AI insights...</p>
                                </div>
                            ) : aiInsights ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Revenue Optimization Tips */}
                                    {(Array.isArray(aiInsights.optimizations) ? aiInsights.optimizations : aiInsights.optimizations?.suggestions || []).slice(0, 3).map((tip: any, i: number) => (
                                        <div key={`opt-${i}`} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                                <span className="text-xs font-semibold text-purple-700 uppercase">Revenue Optimization</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{tip.title || tip.suggestion || tip.name || tip}</p>
                                            <p className="text-xs text-gray-600 mt-1">{tip.description || tip.impact || ''}</p>
                                        </div>
                                    ))}
                                    {/* Upsell Opportunities */}
                                    {(Array.isArray(aiInsights.upsells) ? aiInsights.upsells : aiInsights.upsells?.opportunities || []).slice(0, 3).map((opp: any, i: number) => (
                                        <div key={`ups-${i}`} className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-semibold text-green-700 uppercase">Upsell Opportunity</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{opp.title || opp.name || opp.product || opp}</p>
                                            <p className="text-xs text-gray-600 mt-1">{opp.description || opp.reason || ''}</p>
                                        </div>
                                    ))}
                                    {/* Churn Risk Alerts */}
                                    {(aiInsights.optimizations?.churnAlerts || aiInsights.upsells?.atRiskStudents || []).slice(0, 2).map((alert: any, i: number) => (
                                        <div key={`churn-${i}`} className="p-4 bg-gradient-to-br from-red-50 to-orange-100 rounded-lg border border-red-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-xs font-semibold text-red-700 uppercase">Churn Risk</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{alert.title || alert.studentName || alert.name || alert}</p>
                                            <p className="text-xs text-gray-600 mt-1">{alert.description || alert.reason || ''}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">AI insights unavailable</p>
                                    <button onClick={loadAiInsights} className="mt-2 text-sm text-purple-600 hover:underline">Generate Insights</button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* AI Extended Tools */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-600" /> AI Marketing & Communication
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PartnerAIExtended />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

function PartnerAIExtended() {
    const [loading, setLoading] = useState<string | null>(null)
    const [results, setResults] = useState<Record<string, any>>({})

    const callAI = async (key: string, fn: () => Promise<any>) => {
        setLoading(key)
        try {
            const res = await fn()
            setResults(prev => ({ ...prev, [key]: res?.data || res }))
        } catch {
            setResults(prev => ({ ...prev, [key]: { message: 'AI service unavailable' } }))
        } finally { setLoading(null) }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Megaphone className="w-4 h-4 text-indigo-600" /> AI Content Engine</h4>
                <button onClick={() => callAI('marketing', () => apiClient.post('/ai-content-engine/generate-social-post', { topic: 'partner promotions' }))} disabled={loading === 'marketing'} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-medium text-indigo-700 w-full">
                    {loading === 'marketing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Generate Partner Marketing
                </button>
                {results.marketing && <div className="p-3 bg-indigo-50 rounded-lg text-xs"><p className="font-medium text-indigo-700 mb-1">Generated Content:</p><p>{results.marketing?.content || results.marketing?.post || results.marketing?.message || formatAIResponse(results.marketing, 200)}</p></div>}
            </div>
            <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Send className="w-4 h-4 text-rose-600" /> AI Communication</h4>
                <button onClick={() => callAI('campaign', () => apiClient.post('/ai-communication/predict-campaign', { type: 'partner-referral' }))} disabled={loading === 'campaign'} className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-medium text-rose-700 w-full">
                    {loading === 'campaign' ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3" />} Predict Campaign Performance
                </button>
                {results.campaign && <div className="p-3 bg-rose-50 rounded-lg text-xs"><p className="font-medium text-rose-700 mb-1">Prediction:</p><p>{results.campaign?.predictedOpenRate ? `Open: ${results.campaign.predictedOpenRate}, Click: ${results.campaign.predictedClickRate}` : results.campaign?.message || formatAIResponse(results.campaign, 150)}</p></div>}
            </div>
        </div>
    )
}
