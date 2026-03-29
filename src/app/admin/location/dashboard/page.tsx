'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown,
    Zap, Activity, Target, BarChart3, MapPin,
    Brain, Sparkles, Loader2, RefreshCw
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { smartSchedulerService, safetyMonitorService } from '@/services/advancedAIServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LocationManagerService } from '@/services/locationManagerService'

const FALLBACK_LOCATION = {
    locationName: 'My Location', totalClasses: 0, totalStaff: 0, totalStudents: 0,
    monthlyRevenue: 0, revenueGrowth: 0, occupancyRate: 0, staffUtilization: 0,
    customerSatisfaction: 0, todayClasses: 0, todayAttendance: 0,
    pendingApprovals: 0, criticalAlerts: 0, warnings: 0
}

export default function LocationManagerDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [todayClassSchedule, setTodayClassSchedule] = useState<any[]>([])

    const loadAiInsights = async (locId?: string) => {
        setAiLoading(true)
        const locationId = locId || 'current'
        try {
            const [peakHours, safetyScore] = await Promise.allSettled([
                smartSchedulerService.getPeakHours(locationId),
                safetyMonitorService.getSafetyScore(locationId)
            ])
            const peaks = peakHours.status === 'fulfilled' ? peakHours.value?.data || peakHours.value : null
            const safety = safetyScore.status === 'fulfilled' ? safetyScore.value?.data || safetyScore.value : null
            setAiInsights({ peakHours: peaks, safetyScore: safety })
        } catch (err) { console.error('AI unavailable:', err); setAiInsights(null) }
        finally { setAiLoading(false) }
    }

    const loadData = useCallback(async () => {
        try {
            const [overview, analytics] = await Promise.allSettled([
                LocationManagerService.getDashboardOverview(),
                LocationManagerService.getAnalytics(timeRange)
            ])
            const data = overview.status === 'fulfilled' ? overview.value : {}
            const stats = analytics.status === 'fulfilled' ? analytics.value : {}

            setDashboardData({
                locationName: data?.locationName ?? FALLBACK_LOCATION.locationName,
                totalClasses: data?.totalClasses ?? stats?.classesPerWeek ?? FALLBACK_LOCATION.totalClasses,
                totalStaff: data?.totalStaff ?? FALLBACK_LOCATION.totalStaff,
                totalStudents: data?.totalStudents ?? stats?.totalStudents ?? FALLBACK_LOCATION.totalStudents,
                monthlyRevenue: data?.monthlyRevenue ?? FALLBACK_LOCATION.monthlyRevenue,
                revenueGrowth: data?.revenueGrowth ?? FALLBACK_LOCATION.revenueGrowth,
                occupancyRate: data?.occupancyRate ?? FALLBACK_LOCATION.occupancyRate,
                staffUtilization: data?.staffUtilization ?? FALLBACK_LOCATION.staffUtilization,
                customerSatisfaction: data?.customerSatisfaction ?? stats?.satisfaction ?? FALLBACK_LOCATION.customerSatisfaction,
                todayClasses: data?.todayClasses ?? FALLBACK_LOCATION.todayClasses,
                todayAttendance: data?.todayAttendance ?? FALLBACK_LOCATION.todayAttendance,
                pendingApprovals: data?.pendingApprovals ?? FALLBACK_LOCATION.pendingApprovals,
                criticalAlerts: data?.criticalAlerts ?? FALLBACK_LOCATION.criticalAlerts,
                warnings: data?.warnings ?? FALLBACK_LOCATION.warnings
            })

            // Set revenue data from analytics
            if (stats?.revenueData && Array.isArray(stats.revenueData)) {
                setRevenueData(stats.revenueData)
            } else {
                setRevenueData(data?.revenueData || [])
            }

            // Set today's class schedule from dashboard overview
            if (data?.todaySchedule && Array.isArray(data.todaySchedule)) {
                setTodayClassSchedule(data.todaySchedule)
            } else if (data?.classes && Array.isArray(data.classes)) {
                setTodayClassSchedule(data.classes)
            }
        } catch (error) {
            console.error('Error loading location dashboard:', error)
            setDashboardData(FALLBACK_LOCATION)
        } finally {
            setIsLoading(false)
        }
    }, [timeRange])

    useRealtimeRefresh(['attendance', 'booking', 'staff', 'schedule'], loadData)

    useEffect(() => {
        loadData()
        loadAiInsights()
    }, [loadData])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Location Dashboard</h1>
                    <p className="text-gray-600 mt-1">{dashboardData?.locationName} - Daily Operations</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button id="admin-location-dashboard-btn"
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

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Classes', value: dashboardData?.totalClasses, icon: Calendar, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900', change: 'This month' },
                    { title: 'Total Students', value: dashboardData?.totalStudents, icon: Users, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900', change: 'Active students' },
                    { title: 'Staff Members', value: dashboardData?.totalStaff, icon: Users, cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600', titleColor: 'text-purple-700', valueColor: 'text-purple-900', change: 'Full team' },
                    {
                        title: 'Monthly Revenue',
                        value: dashboardData?.monthlyRevenue ? `${(dashboardData.monthlyRevenue / 1000).toFixed(0)}K` : '0',
                        icon: DollarSign, cardBg: 'bg-gradient-to-br from-orange-50 to-orange-100', iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600', titleColor: 'text-orange-700', valueColor: 'text-orange-900',
                        change: dashboardData?.revenueGrowth ? `+${dashboardData.revenueGrowth}% vs last month` : 'No data'
                    },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`${metric.cardBg} border-0 shadow-sm hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${metric.titleColor}`}>{metric.title}</p>
                                        <p className={`text-2xl font-bold ${metric.valueColor} mt-2`}>{metric.value}</p>
                                        <p className="text-xs text-gray-500 mt-2">{metric.change}</p>
                                    </div>
                                    <div className={`${metric.iconBg} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Location Metrics & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Location Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Location Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                                    <span className="text-lg font-bold text-green-600">{dashboardData?.occupancyRate}%</span>
                                </div>
                                <Progress value={dashboardData?.occupancyRate} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Staff Utilization</span>
                                    <span className="text-lg font-bold text-blue-600">{dashboardData?.staffUtilization}%</span>
                                </div>
                                <Progress value={dashboardData?.staffUtilization} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                                    <span className="text-lg font-bold text-purple-600">{dashboardData?.customerSatisfaction}/5.0</span>
                                </div>
                                <Progress value={(dashboardData?.customerSatisfaction / 5) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Today's Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="text-xs">Classes</Badge>
                                    <span className="text-sm font-medium text-blue-900">Today's Schedule</span>
                                </div>
                                <p className="text-xs text-blue-700">{dashboardData?.todayClasses} classes scheduled</p>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">Attendance</Badge>
                                    <span className="text-sm font-medium text-green-900">Current Attendance</span>
                                </div>
                                <p className="text-xs text-green-700">{dashboardData?.todayAttendance} students present</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">Pending</Badge>
                                    <span className="text-sm font-medium text-yellow-900">Pending Approvals</span>
                                </div>
                                <p className="text-xs text-yellow-700">{dashboardData?.pendingApprovals || 0} items pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <a id="admin-location-dashboard-link-admin-location-attendance" href="/admin/location/attendance" className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center">
                                View Attendance
                            </a>
                            <a id="admin-location-dashboard-link-admin-location-classes" href="/admin/location/classes" className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center">
                                Manage Classes
                            </a>
                            <a id="admin-location-dashboard-link-admin-location-facilities" href="/admin/location/facilities" className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium text-center">
                                Facilities Status
                            </a>
                            <a id="admin-location-dashboard-link-admin-location-analytics" href="/admin/location/analytics" className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium text-center">
                                View Reports
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            {revenueData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip formatter={(value) => typeof value === 'number' ? `${(value / 1000).toFixed(0)}K` : value} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Today's Class Schedule */}
            {todayClassSchedule.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Today's Class Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {todayClassSchedule.map((cls: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">{cls.time || cls.timeSlot || 'N/A'}</span>
                                            <span className="font-medium text-gray-900">{cls.name || cls.sessionName || 'N/A'}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Coach: {cls.coach || 'N/A'} {cls.room ? `• Room: ${cls.room}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{cls.students ?? cls.enrolled ?? 0}</p>
                                        <p className="text-xs text-gray-600">students</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* AI Insights */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Location Insights</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                        </div>
                        <button onClick={() => loadAiInsights()} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Analyzing location data...</p>
                        </div>
                    ) : aiInsights ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Peak Hours Analysis */}
                            {(Array.isArray(aiInsights.peakHours) ? aiInsights.peakHours : aiInsights.peakHours?.hours || aiInsights.peakHours?.peakTimes || []).slice(0, 3).map((peak: any, i: number) => (
                                <div key={`peak-${i}`} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700 uppercase">Peak Hours</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{peak.title || peak.timeSlot || peak.hour || peak}</p>
                                    <p className="text-xs text-gray-600 mt-1">{peak.description || peak.attendance || ''}</p>
                                </div>
                            ))}
                            {/* Safety Score */}
                            {aiInsights.safetyScore && (
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-green-700 uppercase">Safety Score</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">{aiInsights.safetyScore.score || aiInsights.safetyScore.overallScore || 'N/A'}</p>
                                    <p className="text-xs text-gray-600 mt-1">{aiInsights.safetyScore.description || aiInsights.safetyScore.status || 'Safety assessment complete'}</p>
                                </div>
                            )}
                            {/* Attendance Predictions */}
                            {(aiInsights.peakHours?.predictions || aiInsights.peakHours?.attendanceForecast || []).slice(0, 2).map((pred: any, i: number) => (
                                <div key={`att-${i}`} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-semibold text-purple-700 uppercase">Attendance Prediction</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{pred.title || pred.day || pred.period || pred}</p>
                                    <p className="text-xs text-gray-600 mt-1">{pred.description || pred.predicted || ''}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">AI insights unavailable</p>
                            <button onClick={() => loadAiInsights()} className="mt-2 text-sm text-purple-600 hover:underline">Generate Insights</button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Extended AI Hub */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600" /> AI Automation Hub
                        <Badge className="bg-purple-100 text-purple-700 text-xs">Extended</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <LocationAIExtended />
                </CardContent>
            </Card>
        </div>
    )
}

function LocationAIExtended() {
    const [loading, setLoading] = useState<string | null>(null)
    const [results, setResults] = useState<Record<string, any>>({})

    const callAI = async (key: string, fn: () => Promise<any>) => {
        setLoading(key)
        try {
            const res = await fn()
            setResults(prev => ({ ...prev, [key]: { data: res?.data || res } }))
        } catch {
            setResults(prev => ({ ...prev, [key]: { data: { message: 'AI service unavailable' } } }))
        } finally { setLoading(null) }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /> Revenue Intelligence</h4>
                <button onClick={() => callAI('churn', () => apiClient.get('/revenue-intelligence/churn-risk/location'))} disabled={loading === 'churn'} className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-medium text-green-700 w-full">
                    {loading === 'churn' ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />} Churn Risk Analysis
                </button>
                <button onClick={() => callAI('ltv', () => apiClient.get('/revenue-intelligence/ltv/location'))} disabled={loading === 'ltv'} className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-medium text-green-700 w-full">
                    {loading === 'ltv' ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />} LTV Prediction
                </button>
                {results.churn && <div className="p-2 bg-green-50 rounded text-xs"><p className="font-medium text-green-700">Churn Risk:</p><p>{results.churn.data?.riskLevel || results.churn.data?.message || JSON.stringify(results.churn.data).slice(0, 100)}</p></div>}
                {results.ltv && <div className="p-2 bg-green-50 rounded text-xs"><p className="font-medium text-green-700">LTV:</p><p>{results.ltv.data?.predictedLTV || results.ltv.data?.message || JSON.stringify(results.ltv.data).slice(0, 100)}</p></div>}
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600" /> AI Video Analysis</h4>
                <button onClick={() => callAI('video', () => apiClient.get('/ai-video-analysis/student/location/history'))} disabled={loading === 'video'} className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-700 w-full">
                    {loading === 'video' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />} Training Quality Monitor
                </button>
                {results.video && <div className="p-2 bg-blue-50 rounded text-xs"><p className="font-medium text-blue-700">Quality:</p><p>{Array.isArray(results.video.data) ? `${results.video.data.length} analyses found` : results.video.data?.message || 'Analysis complete'}</p></div>}
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-600" /> AI Content Engine</h4>
                <button onClick={() => callAI('promo', () => apiClient.post('/ai-content-engine/generate-social-post', { topic: 'location events' }))} disabled={loading === 'promo'} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-medium text-indigo-700 w-full">
                    {loading === 'promo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Generate Local Promo
                </button>
                {results.promo && <div className="p-2 bg-indigo-50 rounded text-xs"><p className="font-medium text-indigo-700">Generated:</p><p>{results.promo.data?.content || results.promo.data?.post || results.promo.data?.message || JSON.stringify(results.promo.data).slice(0, 150)}</p></div>}
            </div>
        </div>
    )
}
