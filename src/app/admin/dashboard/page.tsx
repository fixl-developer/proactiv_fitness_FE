'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    Clock, Activity, BarChart3, Bell, AlertTriangle, Info, CheckCircle,
    Brain, Sparkles, Loader2, RefreshCw, Zap, Mail, FileText, Send, Megaphone
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { globalIntelligenceService, revenueIntelligenceService } from '@/services/advancedAIServices'
import { formatAIResponse } from '@/utils/formatAIResponse'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analyticsService } from '@/services/modules/analytics.service'
import type { RevenueDataPoint, StudentDataPoint, ActivityItem, AlertItem } from '@/services/modules/analytics.service'

const FALLBACK_DATA = {
    totalLocations: 0,
    totalStudents: 0,
    totalRevenue: 0,
    staffMembers: 0,
    activeClasses: 0,
    revenueGrowth: 0,
    studentGrowth: 0,
    occupancyRate: 0,
    staffUtilization: 0,
    customerSatisfaction: 0
}

const activityIcons: Record<string, any> = {
    user: Users,
    booking: Calendar,
    staff: Users,
    payment: DollarSign,
    enrollment: Users,
    system: Activity,
}

const activityColors: Record<string, string> = {
    user: 'text-green-600',
    booking: 'text-orange-600',
    staff: 'text-purple-600',
    payment: 'text-blue-600',
    enrollment: 'text-green-600',
    system: 'text-gray-600',
}

function timeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
}

export default function AdminDashboard() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')
    const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([])
    const [studentData, setStudentData] = useState<StudentDataPoint[]>([])
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
    const [alerts, setAlerts] = useState<AlertItem[]>([])
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [contentEngineLoading, setContentEngineLoading] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<any>(null)
    const [workflowLoading, setWorkflowLoading] = useState(false)
    const [workflowResult, setWorkflowResult] = useState<any>(null)
    const [campaignLoading, setCampaignLoading] = useState(false)
    const [campaignPrediction, setCampaignPrediction] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const [benchmarks, optimizations] = await Promise.allSettled([
                globalIntelligenceService.getBenchmarks(),
                revenueIntelligenceService.getOptimizationSuggestions()
            ])
            const bench = benchmarks.status === 'fulfilled' ? benchmarks.value?.data || benchmarks.value : null
            const opts = optimizations.status === 'fulfilled' ? optimizations.value?.data || optimizations.value : null
            setAiInsights({ benchmarks: bench, optimizations: opts })
        } catch (err) { console.error('AI unavailable:', err); setAiInsights(null) }
        finally { setAiLoading(false) }
    }

    const loadDashboardData = useCallback(async () => {
        try {
            setIsLoading(true)
            const [metricsRes, revenueRes, studentRes, activitiesRes, alertsRes] = await Promise.allSettled([
                analyticsService.getDashboardMetrics(timeRange),
                analyticsService.getRevenueTrend(6),
                analyticsService.getStudentGrowth(6),
                analyticsService.getRecentActivities(8),
                analyticsService.getAlerts(),
            ])

            // KPI Metrics
            const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value?.data : null
            setDashboardData({
                totalLocations: metrics?.totalLocations ?? FALLBACK_DATA.totalLocations,
                totalStudents: metrics?.totalStudents ?? FALLBACK_DATA.totalStudents,
                totalRevenue: metrics?.totalRevenue ?? FALLBACK_DATA.totalRevenue,
                staffMembers: metrics?.staffMembers ?? FALLBACK_DATA.staffMembers,
                activeClasses: metrics?.activeClasses ?? FALLBACK_DATA.activeClasses,
                revenueGrowth: metrics?.revenueGrowth ?? FALLBACK_DATA.revenueGrowth,
                studentGrowth: metrics?.enrollmentTrend ?? FALLBACK_DATA.studentGrowth,
                occupancyRate: metrics?.attendanceRate ?? FALLBACK_DATA.occupancyRate,
                staffUtilization: metrics?.staffUtilization ?? FALLBACK_DATA.staffUtilization,
                customerSatisfaction: metrics?.customerSatisfaction ?? FALLBACK_DATA.customerSatisfaction
            })

            // Revenue chart
            if (revenueRes.status === 'fulfilled') {
                const rd = revenueRes.value?.data
                setRevenueData(Array.isArray(rd) ? rd : rd?.data || [])
            }

            // Student growth chart
            if (studentRes.status === 'fulfilled') {
                const sd = studentRes.value?.data
                setStudentData(Array.isArray(sd) ? sd : sd?.data || [])
            }

            // Recent activities
            if (activitiesRes.status === 'fulfilled') {
                const ad = activitiesRes.value?.data
                setRecentActivities(Array.isArray(ad) ? ad : ad?.data || [])
            }

            // Alerts
            if (alertsRes.status === 'fulfilled') {
                const al = alertsRes.value?.data
                setAlerts(Array.isArray(al) ? al : al?.data || [])
            }
        } catch (error) {
            console.error('Error loading dashboard:', error)
            setDashboardData(FALLBACK_DATA)
        } finally {
            setIsLoading(false)
        }
    }, [timeRange])

    useRealtimeRefresh(['booking', 'payment', 'program', 'attendance', 'staff', 'location', 'schedule', 'ticket'], loadDashboardData)

    useEffect(() => {
        if (authLoading) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboardData()
        loadAiInsights()
    }, [isAuthenticated, authLoading, router, loadDashboardData])

    if (!isAuthenticated && !authLoading) return null

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Business Overview & Key Metrics</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button id={`admin-dashboard-timerange-${range}-btn`}
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { title: 'Total Locations', value: dashboardData?.totalLocations, icon: Building2, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: dashboardData?.totalLocations > 0 ? `${dashboardData.totalLocations} active` : 'No data' },
                    { title: 'Total Students', value: dashboardData?.totalStudents?.toLocaleString(), icon: Users, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: `${dashboardData?.studentGrowth > 0 ? '+' : ''}${dashboardData?.studentGrowth || 0}%` },
                    { title: 'Total Revenue', value: `$${((dashboardData?.totalRevenue || 0) / 1000).toFixed(0)}K`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: `${dashboardData?.revenueGrowth > 0 ? '+' : ''}${dashboardData?.revenueGrowth || 0}%` },
                    { title: 'Staff Members', value: dashboardData?.staffMembers, icon: Users, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', change: `${dashboardData?.staffMembers || 0} active` },
                    { title: 'Active Classes', value: dashboardData?.activeClasses, icon: Calendar, gradient: 'from-pink-500 to-pink-600', bgGradient: 'from-pink-50 to-pink-100', change: `${dashboardData?.activeClasses || 0} running` },
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

            {/* Business Metrics, Recent Activities, Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Business Metrics
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
                                <Progress value={((dashboardData?.customerSatisfaction || 0) / 5) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Recent Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivities.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
                            ) : (
                                recentActivities.slice(0, 5).map((activity, idx) => {
                                    const IconComponent = activityIcons[activity.type] || Activity
                                    const colorClass = activityColors[activity.type] || 'text-gray-600'
                                    return (
                                        <div key={activity.id || idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className={`${colorClass} mt-1`}>
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                                <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.time)}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-600" />
                            Alerts & Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No active alerts</p>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <div key={alert.id || idx} className={`p-3 rounded-lg border ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                        alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                            'bg-green-50 border-green-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {alert.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />}
                                            {alert.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-600" />}
                                            {alert.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                                            <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                                {alert.priority}
                                            </Badge>
                                            <span className="text-sm font-medium text-gray-900">{alert.title}</span>
                                        </div>
                                        <p className="text-xs text-gray-700">{alert.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Revenue Trend vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {revenueData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                            <p>No revenue data available yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${(Number(value) / 1000).toFixed(0)}K`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                                <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Student Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Student Growth Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {studentData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                            <p>No student data available yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={studentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} name="Total Students" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Business Insights</CardTitle>
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
                            {/* Global Benchmarks */}
                            {(Array.isArray(aiInsights.benchmarks) ? aiInsights.benchmarks : aiInsights.benchmarks?.benchmarks || []).slice(0, 3).map((bench: any, i: number) => (
                                <div key={`bench-${i}`} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700 uppercase">Benchmark</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{bench.title || bench.metric || bench.name || bench}</p>
                                    <p className="text-xs text-gray-600 mt-1">{bench.description || bench.value || ''}</p>
                                </div>
                            ))}
                            {/* Optimization Suggestions */}
                            {(Array.isArray(aiInsights.optimizations) ? aiInsights.optimizations : aiInsights.optimizations?.suggestions || []).slice(0, 3).map((opt: any, i: number) => (
                                <div key={`opt-${i}`} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-semibold text-purple-700 uppercase">Optimization</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{opt.title || opt.suggestion || opt.name || opt}</p>
                                    <p className="text-xs text-gray-600 mt-1">{opt.description || opt.impact || ''}</p>
                                </div>
                            ))}
                            {/* Best Practices */}
                            {(aiInsights.benchmarks?.bestPractices || aiInsights.optimizations?.bestPractices || []).slice(0, 2).map((practice: any, i: number) => (
                                <div key={`bp-${i}`} className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-green-700 uppercase">Best Practice</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{practice.title || practice.name || practice}</p>
                                    <p className="text-xs text-gray-600 mt-1">{practice.description || ''}</p>
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

            {/* AI & Automation Hub */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600" />
                        AI & Automation Hub
                        <Badge className="bg-purple-100 text-purple-700 text-xs">Full Suite</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* AI Content Engine */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" /> AI Content Engine
                            </h4>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={async () => {
                                        setContentEngineLoading(true)
                                        try {
                                            const res = await apiClient.post('/ai-content-engine/generate-social-post', { topic: 'fitness classes', platform: 'instagram' })
                                            setGeneratedContent({ type: 'social', data: res?.data || res })
                                        } catch { setGeneratedContent({ type: 'social', data: { content: 'Unable to generate content right now.' } }) }
                                        finally { setContentEngineLoading(false) }
                                    }}
                                    disabled={contentEngineLoading}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium text-indigo-700 transition-colors"
                                >
                                    {contentEngineLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                                    Generate Social Post
                                </button>
                                <button
                                    onClick={async () => {
                                        setContentEngineLoading(true)
                                        try {
                                            const res = await apiClient.post('/ai-content-engine/generate-email', { type: 'newsletter', audience: 'parents' })
                                            setGeneratedContent({ type: 'email', data: res?.data || res })
                                        } catch { setGeneratedContent({ type: 'email', data: { content: 'Unable to generate email right now.' } }) }
                                        finally { setContentEngineLoading(false) }
                                    }}
                                    disabled={contentEngineLoading}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium text-indigo-700 transition-colors"
                                >
                                    <Mail className="w-4 h-4" /> Generate Email Campaign
                                </button>
                            </div>
                            {generatedContent && (
                                <div className="p-3 bg-indigo-50 rounded-lg text-xs text-gray-700">
                                    <p className="font-medium text-indigo-700 mb-1">{generatedContent.type === 'social' ? 'Social Post' : 'Email'} Generated:</p>
                                    <p>{generatedContent.data?.content || generatedContent.data?.subject || generatedContent.data?.post || formatAIResponse(generatedContent.data, 200)}</p>
                                </div>
                            )}
                        </div>

                        {/* Workflow Orchestrator */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-600" /> Workflow Orchestrator
                            </h4>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={async () => {
                                        setWorkflowLoading(true)
                                        try {
                                            const res = await apiClient.post('/workflow-orchestrator/schedule-report', { type: 'weekly', recipients: ['admin'] })
                                            setWorkflowResult({ type: 'schedule', data: res?.data || res })
                                        } catch { setWorkflowResult({ type: 'schedule', data: { message: 'Workflow service unavailable' } }) }
                                        finally { setWorkflowLoading(false) }
                                    }}
                                    disabled={workflowLoading}
                                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-sm font-medium text-amber-700 transition-colors"
                                >
                                    {workflowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                    Schedule Weekly Report
                                </button>
                                <button
                                    onClick={async () => {
                                        setWorkflowLoading(true)
                                        try {
                                            const res = await apiClient.get('/workflow-orchestrator/health/default')
                                            setWorkflowResult({ type: 'health', data: res?.data || res })
                                        } catch { setWorkflowResult({ type: 'health', data: { status: 'unavailable' } }) }
                                        finally { setWorkflowLoading(false) }
                                    }}
                                    disabled={workflowLoading}
                                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-sm font-medium text-amber-700 transition-colors"
                                >
                                    <Activity className="w-4 h-4" /> View Workflow Health
                                </button>
                            </div>
                            {workflowResult && (
                                <div className="p-3 bg-amber-50 rounded-lg text-xs text-gray-700">
                                    <p className="font-medium text-amber-700 mb-1">{workflowResult.type === 'schedule' ? 'Report Scheduled' : 'Workflow Health'}:</p>
                                    <p>{workflowResult.data?.message || workflowResult.data?.status || formatAIResponse(workflowResult.data, 200)}</p>
                                </div>
                            )}
                        </div>

                        {/* AI Communication */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Send className="w-4 h-4 text-rose-600" /> AI Communication
                            </h4>
                            <button
                                onClick={async () => {
                                    setCampaignLoading(true)
                                    try {
                                        const res = await apiClient.post('/ai-communication/predict-campaign', { type: 'email', audience: 'all' })
                                        setCampaignPrediction(res?.data || res)
                                    } catch { setCampaignPrediction({ predictedOpenRate: 'N/A', predictedClickRate: 'N/A', suggestion: 'AI prediction unavailable' }) }
                                    finally { setCampaignLoading(false) }
                                }}
                                disabled={campaignLoading}
                                className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-medium text-rose-700 transition-colors w-full"
                            >
                                {campaignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                                Predict Campaign Performance
                            </button>
                            {campaignPrediction && (
                                <div className="p-3 bg-rose-50 rounded-lg text-xs text-gray-700 space-y-2">
                                    <p className="font-medium text-rose-700">Campaign Prediction:</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between"><span>Open Rate:</span><span className="font-medium">{campaignPrediction.predictedOpenRate || campaignPrediction.openRate || 'N/A'}</span></div>
                                        <div className="flex justify-between"><span>Click Rate:</span><span className="font-medium">{campaignPrediction.predictedClickRate || campaignPrediction.clickRate || 'N/A'}</span></div>
                                        {campaignPrediction.suggestion && <p className="text-gray-600 mt-1">{campaignPrediction.suggestion}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
