'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import {
    TrendingUp, Users, DollarSign, Building2,
    AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown,
    Activity, Target, BarChart3, Info, AlertCircle,
    Brain, Sparkles, Loader2, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'
import { apiClient } from '@/services/api/client'
import { globalIntelligenceService } from '@/services/advancedAIServices'

export default function RegionalAdminDashboard() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [locationData, setLocationData] = useState<any[]>([])
    const [staffData, setStaffData] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])
    const [pendingActions, setPendingActions] = useState<any[]>([])
    const [timeRange, setTimeRange] = useState('30d')
    const [aiData, setAiData] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    // Revenue Intelligence state
    const [revenueIntelData, setRevenueIntelData] = useState<any>(null)
    const [revenueIntelLoading, setRevenueIntelLoading] = useState(false)

    // Smart Scheduler state
    const [schedulerData, setSchedulerData] = useState<any>(null)
    const [schedulerLoading, setSchedulerLoading] = useState(false)

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const res = await globalIntelligenceService.getBenchmarks()
            setAiData(res)
        } catch { setAiData(null) }
        finally { setAiLoading(false) }
    }

    const loadRevenueIntelligence = async () => {
        setRevenueIntelLoading(true)
        try {
            const [churnRes, upsellRes] = await Promise.allSettled([
                apiClient.get('/revenue-intelligence/churn-risk/regional'),
                apiClient.get('/revenue-intelligence/upsell-opportunities')
            ])
            const churn = churnRes.status === 'fulfilled' ? churnRes.value?.data || churnRes.value : null
            const upsell = upsellRes.status === 'fulfilled' ? upsellRes.value?.data || upsellRes.value : null
            setRevenueIntelData({ churnRisk: churn, upsellOpportunities: upsell })
        } catch (err) {
            console.error('Revenue Intelligence unavailable:', err)
            setRevenueIntelData(null)
        } finally {
            setRevenueIntelLoading(false)
        }
    }

    const loadSmartScheduler = async () => {
        setSchedulerLoading(true)
        try {
            const res = await apiClient.post('/smart-scheduler/optimize-schedule', { scope: 'regional' })
            setSchedulerData(res?.data || res)
        } catch (err) {
            console.error('Smart Scheduler unavailable:', err)
            setSchedulerData(null)
        } finally {
            setSchedulerLoading(false)
        }
    }

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const [overview, approvalsResp] = await Promise.allSettled([
                RegionalAdminService.getDashboardOverview(timeRange),
                RegionalAdminService.getPendingApprovals(1, 10)
            ])

            if (overview.status === 'fulfilled' && overview.value) {
                const data = overview.value
                setDashboardData(data)

                // Revenue chart - directly from backend
                if (data.revenueData && data.revenueData.length > 0) {
                    setRevenueData(data.revenueData)
                }

                // Location performance - directly from backend
                if (data.locationPerformance && data.locationPerformance.length > 0) {
                    setLocationData(data.locationPerformance)
                }

                // Staff performance - directly from backend
                if (data.staffPerformance && data.staffPerformance.length > 0) {
                    setStaffData(data.staffPerformance)
                }

                // Alerts - directly from backend
                if (data.alerts && data.alerts.length > 0) {
                    setAlerts(data.alerts)
                }
            } else {
                setError('Failed to load dashboard data')
            }

            // Pending approvals
            if (approvalsResp.status === 'fulfilled' && approvalsResp.value?.data?.length > 0) {
                setPendingActions(approvalsResp.value.data.slice(0, 5).map((a: any) => ({
                    type: a.type || 'Approval',
                    name: a.title || a.name || a.description || 'Pending item',
                    date: a.requestedDate ? formatRelativeDate(a.requestedDate) : 'Recently',
                    priority: (a.priority || 'MEDIUM').toLowerCase()
                })))
            }
        } catch (err: any) {
            console.error('Dashboard load error:', err)
            setError(err.message || 'Failed to load dashboard')
        } finally {
            setIsLoading(false)
        }
    }, [timeRange])

    useRealtimeRefresh(['location', 'staff', 'program', 'booking', 'payment'], loadDashboard)

    useEffect(() => {
        loadDashboard()
        loadAiInsights()
        loadRevenueIntelligence()
        loadSmartScheduler()
    }, [loadDashboard])

    function formatRelativeDate(dateStr: string): string {
        try {
            const date = new Date(dateStr)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            if (diffMins < 1) return 'Just now'
            if (diffMins < 60) return `${diffMins}m ago`
            const diffHours = Math.floor(diffMins / 60)
            if (diffHours < 24) return `${diffHours}h ago`
            const diffDays = Math.floor(diffHours / 24)
            return `${diffDays}d ago`
        } catch { return dateStr }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-3 text-sm">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const d = dashboardData || {}

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Dashboard</h1>
                    <p className="text-gray-600 mt-1">{d.regionName || 'Region'} - Operations Overview</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button id="admin-regional-dashboard-btn"
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                    <button id="admin-regional-dashboard-btn-retry" onClick={loadDashboard} className="ml-auto text-sm text-red-600 underline">Retry</button>
                </div>
            )}

            {/* KPI Cards - Fully Dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        title: 'Regional Locations',
                        value: d.totalLocations ?? 0,
                        icon: Building2,
                        gradient: 'from-blue-500 to-blue-600',
                        bgGradient: 'from-blue-50 to-blue-100',
                        change: d.locationsChange > 0 ? `+${d.locationsChange} this month` : `${d.totalLocations ?? 0} total`
                    },
                    {
                        title: 'Total Students',
                        value: (d.totalStudents ?? 0).toLocaleString(),
                        icon: Users,
                        gradient: 'from-green-500 to-emerald-600',
                        bgGradient: 'from-green-50 to-emerald-100',
                        change: d.studentsChange > 0 ? `+${d.studentsChange} this month` : d.studentGrowth ? `${d.studentGrowth > 0 ? '+' : ''}${d.studentGrowth}% growth` : `${d.totalStudents ?? 0} total`
                    },
                    {
                        title: 'Staff Members',
                        value: d.totalStaff ?? 0,
                        icon: Users,
                        gradient: 'from-purple-500 to-purple-600',
                        bgGradient: 'from-purple-50 to-purple-100',
                        change: d.staffChange > 0 ? `+${d.staffChange} this month` : `${d.totalStaff ?? 0} active`
                    },
                    {
                        title: 'Regional Revenue',
                        value: `$${((d.totalRevenue || 0) / 1000).toFixed(0)}K`,
                        icon: DollarSign,
                        gradient: 'from-orange-500 to-orange-600',
                        bgGradient: 'from-orange-50 to-orange-100',
                        change: d.revenueGrowth ? `${d.revenueGrowth > 0 ? '+' : ''}${d.revenueGrowth}% growth` : `$${((d.monthlyRevenue || 0) / 1000).toFixed(0)}K this month`
                    },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
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

            {/* Regional Metrics, Alerts & Monthly Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Regional Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Regional Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                                    <span className="text-lg font-bold text-green-600">{d.occupancyRate ?? 0}%</span>
                                </div>
                                <Progress value={d.occupancyRate ?? 0} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Staff Utilization</span>
                                    <span className="text-lg font-bold text-blue-600">{d.staffUtilization ?? 0}%</span>
                                </div>
                                <Progress value={d.staffUtilization ?? 0} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                                    <span className="text-lg font-bold text-purple-600">{d.customerSatisfaction ?? 0}/5.0</span>
                                </div>
                                <Progress value={((d.customerSatisfaction ?? 0) / 5) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Alerts from Backend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Regional Alerts
                            {alerts.length > 0 && <Badge variant="destructive" className="text-xs ml-2">{alerts.length}</Badge>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-900">All systems normal</span>
                                    </div>
                                    <p className="text-xs text-green-700 mt-1">No active alerts at this time</p>
                                </div>
                            ) : (
                                alerts.map((alert, idx) => {
                                    const severityConfig: Record<string, { bg: string; border: string; textTitle: string; textBody: string; badge: any }> = {
                                        critical: { bg: 'bg-red-50', border: 'border-red-200', textTitle: 'text-red-900', textBody: 'text-red-700', badge: 'destructive' as const },
                                        warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', textTitle: 'text-yellow-900', textBody: 'text-yellow-700', badge: 'secondary' as const },
                                        info: { bg: 'bg-blue-50', border: 'border-blue-200', textTitle: 'text-blue-900', textBody: 'text-blue-700', badge: 'default' as const },
                                    }
                                    const cfg = severityConfig[alert.severity] || severityConfig.info
                                    return (
                                        <div key={idx} className={`p-3 ${cfg.bg} border ${cfg.border} rounded-lg`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={cfg.badge} className="text-xs capitalize">{alert.severity}</Badge>
                                                <span className={`text-sm font-medium ${cfg.textTitle}`}>{alert.title}</span>
                                            </div>
                                            <p className={`text-xs ${cfg.textBody}`}>{alert.message}</p>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Monthly Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">Monthly Revenue</span>
                                    <span className="font-bold text-gray-900">${((d.monthlyRevenue || 0) / 1000).toFixed(0)}K</span>
                                </div>
                                <Progress value={d.totalRevenue > 0 ? Math.min(100, Math.round((d.monthlyRevenue / d.totalRevenue) * 100)) : 0} className="h-2" />
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-2">Revenue Growth</p>
                                <p className="text-2xl font-bold text-gray-900">{(d.revenueGrowth ?? 0).toFixed(1)}%</p>
                                <p className={`text-xs flex items-center gap-1 mt-1 ${(d.revenueGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(d.revenueGrowth ?? 0) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    vs last month
                                </p>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-2">Total Bookings</p>
                                <p className="text-lg font-bold text-gray-900">{d.totalBookings ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart - Dynamic from Backend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Revenue Trend vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(1)}K` : value} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                                <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                            <BarChart3 className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium">No revenue data yet</p>
                            <p className="text-xs">Revenue chart will appear when bookings are made</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location Performance & Staff Utilization - Dynamic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Location Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {locationData.length > 0 ? (
                            <div className="space-y-3">
                                {locationData.map((location, idx) => (
                                    <div id="admin-regional-dashboard-div-clickable" key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => router.push('/admin/regional/locations')}>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{location.name}</p>
                                            <p className="text-xs text-gray-600">
                                                {location.students} students
                                                {location.revenue > 0 ? ` • $${(location.revenue / 1000).toFixed(0)}K revenue` : ''}
                                                {location.occupancyRate > 0 ? ` • ${location.occupancyRate}% occupancy` : ''}
                                            </p>
                                        </div>
                                        <Badge variant={location.status === 'excellent' ? 'default' : location.status === 'good' ? 'secondary' : 'destructive'}>
                                            {location.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Building2 className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-sm">No locations added yet</p>
                                <button id="admin-regional-dashboard-btn-add-location" onClick={() => router.push('/admin/regional/locations')} className="mt-2 text-xs text-blue-600 underline">Add Location</button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Staff Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Staff Utilization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {staffData.length > 0 ? (
                            <div className="space-y-4">
                                {staffData.map((staff, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">{staff.name}</span>
                                            <span className="text-sm font-bold text-gray-900">{staff.count} members • {staff.utilization}%</span>
                                        </div>
                                        <Progress value={staff.utilization} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Users className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-sm">No staff members yet</p>
                                <button id="admin-regional-dashboard-btn-add-location-2" onClick={() => router.push('/admin/regional/staff')} className="mt-2 text-xs text-blue-600 underline">Add Staff</button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Pending Actions - Dynamic */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Pending Actions
                        {pendingActions.length > 0 && <Badge variant="secondary" className="text-xs ml-2">{pendingActions.length}</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingActions.length > 0 ? (
                        <div className="space-y-3">
                            {pendingActions.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.type}</p>
                                        <p className="text-sm text-gray-600">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}>
                                            {item.priority}
                                        </Badge>
                                        <button id="admin-regional-dashboard-btn-2"
                                            onClick={() => router.push('/admin/regional/approvals')}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                            <p className="text-sm text-gray-600">No pending actions</p>
                            <p className="text-xs text-gray-400">All approvals are up to date</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Insights - Global Intelligence */}
            <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                        </div>
                        <button onClick={loadAiInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="p-6">
                        {aiLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                <p className="text-sm text-gray-500">Analyzing data with AI...</p>
                            </div>
                        ) : (() => {
                            const insights = aiData?.data || aiData
                            if (!insights) return (
                                <div className="text-center py-6">
                                    <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Click refresh to generate AI insights</p>
                                </div>
                            )
                            const locations = insights.locations || []
                            const topPerformers = insights.topPerformers || []
                            const underPerformers = insights.underPerformers || []
                            const insightText = insights.insights || ''
                            const isAI = insights.aiPowered !== false
                            return (
                                <div className="space-y-4">
                                    {/* AI Analysis Summary */}
                                    {insightText && (
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-semibold text-purple-800">AI Analysis</span>
                                                {!isAI && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Fallback Mode</span>}
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{insightText}</p>
                                        </div>
                                    )}

                                    {/* Top & Under Performers */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {topPerformers.length > 0 && (
                                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                                <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
                                                    <ArrowUp className="w-4 h-4" /> Top Performers
                                                </h4>
                                                {topPerformers.map((name: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 py-1">
                                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                                        <span className="text-sm text-gray-800">{name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {underPerformers.length > 0 && (
                                            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                                                <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
                                                    <ArrowDown className="w-4 h-4" /> Needs Improvement
                                                </h4>
                                                {underPerformers.map((name: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 py-1">
                                                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                                                        <span className="text-sm text-gray-800">{name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Location Benchmarks */}
                                    {locations.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Location Benchmarks</h4>
                                            <div className="space-y-3">
                                                {locations.slice(0, 5).map((loc: any, i: number) => (
                                                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                #{loc.rank || i + 1} {loc.locationName || loc.name || `Location ${i + 1}`}
                                                            </span>
                                                            <Badge variant={i === 0 ? 'default' : i < locations.length / 2 ? 'secondary' : 'destructive'}>
                                                                Rank #{loc.rank || i + 1}
                                                            </Badge>
                                                        </div>
                                                        {loc.metrics && (
                                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                                <div className="text-center p-2 bg-white rounded border">
                                                                    <p className="text-xs text-gray-500">Revenue</p>
                                                                    <p className="text-sm font-bold text-blue-600">${((loc.metrics.revenue || 0) / 1000).toFixed(0)}K</p>
                                                                </div>
                                                                <div className="text-center p-2 bg-white rounded border">
                                                                    <p className="text-xs text-gray-500">Retention</p>
                                                                    <p className="text-sm font-bold text-green-600">{loc.metrics.retention || 0}%</p>
                                                                </div>
                                                                <div className="text-center p-2 bg-white rounded border">
                                                                    <p className="text-xs text-gray-500">Enrollment</p>
                                                                    <p className="text-sm font-bold text-purple-600">{loc.metrics.enrollment || 0}</p>
                                                                </div>
                                                                <div className="text-center p-2 bg-white rounded border">
                                                                    <p className="text-xs text-gray-500">Satisfaction</p>
                                                                    <p className="text-sm font-bold text-orange-600">{loc.metrics.satisfaction || 0}/10</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>

            {/* Revenue Intelligence */}
            <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Revenue Intelligence</h3>
                            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                        </div>
                        <button onClick={loadRevenueIntelligence} disabled={revenueIntelLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${revenueIntelLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="p-6">
                        {revenueIntelLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                                <p className="text-sm text-gray-500">Analyzing revenue data...</p>
                            </div>
                        ) : revenueIntelData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Churn Risk Analysis */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        Churn Risk Analysis
                                    </h4>
                                    {(() => {
                                        const churn = revenueIntelData.churnRisk?.data || revenueIntelData.churnRisk
                                        if (!churn) return <p className="text-xs text-gray-400 italic">Churn analysis unavailable</p>

                                        const riskScore = churn.riskScore ?? 0
                                        const riskLevel = churn.riskLevel || 'unknown'
                                        const factors = churn.factors || []
                                        const actions = churn.retentionActions || []
                                        const isAI = churn.aiPowered !== false

                                        const riskColors: Record<string, string> = {
                                            low: 'text-green-700 bg-green-100',
                                            medium: 'text-yellow-700 bg-yellow-100',
                                            high: 'text-orange-700 bg-orange-100',
                                            critical: 'text-red-700 bg-red-100',
                                            unknown: 'text-gray-700 bg-gray-100'
                                        }

                                        return (
                                            <div className="space-y-3">
                                                {/* Risk Score Card */}
                                                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${riskColors[riskLevel] || riskColors.unknown}`}>
                                                            {riskLevel}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-bold text-gray-900">{riskScore}</span>
                                                        <span className="text-sm text-gray-500 mb-1">/100</span>
                                                    </div>
                                                    <Progress value={riskScore} className="h-2 mt-2" />
                                                    {!isAI && <p className="text-xs text-yellow-600 mt-1">Fallback mode - AI unavailable</p>}
                                                </div>

                                                {/* Risk Factors */}
                                                {factors.length > 0 && factors.map((f: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-900">{f.factor}</span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(f.impact || 0) > 60 ? 'bg-red-100 text-red-700' : (f.impact || 0) > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                                Impact: {f.impact || 0}%
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{f.description}</p>
                                                        <Progress value={f.impact || 0} className="h-1.5 mt-2" />
                                                    </div>
                                                ))}

                                                {/* Retention Actions */}
                                                {actions.length > 0 && (
                                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <h5 className="text-xs font-semibold text-blue-800 mb-2">Recommended Actions</h5>
                                                        {actions.map((action: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-2 py-1">
                                                                <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                <span className="text-xs text-gray-700">{action}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {factors.length === 0 && actions.length === 0 && riskScore === 0 && (
                                                    <p className="text-xs text-gray-400 italic">No churn risks detected - all members healthy</p>
                                                )}
                                            </div>
                                        )
                                    })()}
                                </div>

                                {/* Upsell Opportunities */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        Upsell Opportunities
                                    </h4>
                                    {(() => {
                                        const upsell = revenueIntelData.upsellOpportunities?.data || revenueIntelData.upsellOpportunities
                                        if (!upsell) return <p className="text-xs text-gray-400 italic">Upsell analysis unavailable</p>

                                        const opportunities = upsell.opportunities || []
                                        const totalRevenue = upsell.totalEstimatedRevenue || 0
                                        const upsellInsights = upsell.insights || ''
                                        const isAI = upsell.aiPowered !== false

                                        return (
                                            <div className="space-y-3">
                                                {/* Revenue Summary */}
                                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700">Total Potential Revenue</span>
                                                        {!isAI && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Fallback</span>}
                                                    </div>
                                                    <p className="text-3xl font-bold text-green-700">${totalRevenue.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{opportunities.length} opportunities identified</p>
                                                </div>

                                                {/* AI Insights */}
                                                {upsellInsights && (
                                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Sparkles className="w-3 h-3 text-purple-600" />
                                                            <span className="text-xs font-semibold text-purple-800">AI Insight</span>
                                                        </div>
                                                        <p className="text-xs text-gray-700">{upsellInsights}</p>
                                                    </div>
                                                )}

                                                {/* Individual Opportunities */}
                                                {opportunities.slice(0, 4).map((opp: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {opp.studentId ? `Student ${opp.studentId.slice(-6)}` : `Opportunity ${i + 1}`}
                                                            </span>
                                                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                                +${(opp.estimatedRevenue || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {opp.suggestedPrograms?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {opp.suggestedPrograms.map((prog: string, j: number) => (
                                                                    <span key={j} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{prog}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {opp.reasoning && <p className="text-xs text-gray-600 mt-1">{opp.reasoning}</p>}
                                                        {opp.confidence != null && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs text-gray-500">Confidence:</span>
                                                                <Progress value={(opp.confidence || 0) * 100} className="h-1.5 flex-1" />
                                                                <span className="text-xs font-medium text-gray-700">{Math.round((opp.confidence || 0) * 100)}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {opportunities.length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">No upsell opportunities found at this time</p>
                                                )}
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Revenue intelligence unavailable</p>
                                <button onClick={loadRevenueIntelligence} className="mt-2 text-sm text-red-600 hover:underline">Generate Analysis</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Smart Scheduler */}
            <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Smart Scheduler</h3>
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                        </div>
                        <button onClick={loadSmartScheduler} disabled={schedulerLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${schedulerLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="p-6">
                        {schedulerLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <p className="text-sm text-gray-500">Optimizing regional schedule...</p>
                            </div>
                        ) : (() => {
                            const sched = schedulerData?.data || schedulerData
                            if (!sched) return (
                                <div className="text-center py-6">
                                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Smart scheduler unavailable</p>
                                    <button onClick={loadSmartScheduler} className="mt-2 text-sm text-blue-600 hover:underline">Optimize Schedule</button>
                                </div>
                            )

                            const slots = sched.suggestedSlots || []
                            const reasoning = sched.reasoning || ''
                            const conflicts = sched.conflictsResolved || []
                            const improvement = sched.expectedImprovementPercent || 0
                            const isAI = sched.aiPowered !== false

                            return (
                                <div className="space-y-4">
                                    {/* Improvement Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Expected Improvement</p>
                                            <p className="text-2xl font-bold text-blue-700">{improvement}%</p>
                                            {!isAI && <p className="text-xs text-yellow-600 mt-1">Fallback mode</p>}
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Optimized Slots</p>
                                            <p className="text-2xl font-bold text-green-700">{slots.length}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Conflicts Resolved</p>
                                            <p className="text-2xl font-bold text-purple-700">{conflicts.length}</p>
                                        </div>
                                    </div>

                                    {/* AI Reasoning */}
                                    {reasoning && (
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-blue-800">AI Reasoning</span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
                                        </div>
                                    )}

                                    {/* Suggested Time Slots */}
                                    {slots.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                Suggested Schedule Slots
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {slots.slice(0, 6).map((slot: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{slot.dayOfWeek}</p>
                                                            <p className="text-xs text-gray-500">{slot.timeSlot}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-blue-700">{slot.expectedDemand || 0}</p>
                                                            <p className="text-xs text-gray-500">demand</p>
                                                        </div>
                                                        <div className="ml-2">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${(slot.score || 0) >= 80 ? 'bg-green-100 text-green-700' : (slot.score || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                                {slot.score || 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Conflicts Resolved */}
                                    {conflicts.length > 0 && (
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <h5 className="text-xs font-semibold text-green-800 mb-2">Conflicts Resolved</h5>
                                            {conflicts.map((conflict: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 py-1">
                                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700">{conflict}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {slots.length === 0 && !reasoning && (
                                        <p className="text-xs text-gray-400 italic text-center">Schedule is already optimized - no changes needed</p>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}
