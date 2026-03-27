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

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const res = await globalIntelligenceService.getBenchmarks()
            setAiData(res)
        } catch { setAiData(null) }
        finally { setAiLoading(false) }
    }

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const [overview, approvalsResp] = await Promise.allSettled([
                RegionalAdminService.getDashboardOverview(),
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

            {/* AI Insights */}
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
                        ) : aiData ? (
                            <div className="space-y-3">
                                {(Array.isArray(aiData) ? aiData : aiData?.recommendations || aiData?.suggestions || [aiData]).slice(0, 5).map((item: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.title || item.recommendation || item.name || item.suggestion || JSON.stringify(item).slice(0, 100)}</p>
                                            {item.description && <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>}
                                            {item.priority && <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{item.priority}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Click refresh to generate AI insights</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
