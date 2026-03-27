'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown,
    Zap, Activity, Target, BarChart3, PieChart,
    Brain, Sparkles, Loader2, RefreshCw
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { revenueIntelligenceService, smartSchedulerService } from '@/services/advancedAIServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'

const FALLBACK_FRANCHISE = {
    franchiseName: 'My Franchise', totalLocations: 0, totalStaff: 0, totalStudents: 0,
    totalRevenue: 0, monthlyRevenue: 0, revenueGrowth: 0, occupancyRate: 0,
    staffUtilization: 0, customerSatisfaction: 0, pendingApprovals: 0, criticalAlerts: 0, warnings: 0,
    locationsChange: '+0 this year', studentsChange: '+0 this month',
    staffChange: '+0 this month', revenueChange: '+0% YoY',
    revenueTrend: [], locationPerformance: [], pendingActions: [], alerts: [],
}

export default function FranchiseOwnerDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const [churnRisk, scheduleOpt] = await Promise.allSettled([
                revenueIntelligenceService.getChurnRisk('franchise-overview'),
                smartSchedulerService.optimizeSchedule({ locationId: 'all' })
            ])
            const churn = churnRisk.status === 'fulfilled' ? churnRisk.value?.data || churnRisk.value : null
            const schedule = scheduleOpt.status === 'fulfilled' ? scheduleOpt.value?.data || scheduleOpt.value : null
            setAiInsights({ churnRisk: churn, scheduleOptimization: schedule })
        } catch (err) { console.error('AI unavailable:', err); setAiInsights(null) }
        finally { setAiLoading(false) }
    }

    const loadData = useCallback(async () => {
        try {
            const response = await FranchiseOwnerService.getDashboardOverview()
            // Backend returns { success: true, data: { ... } }
            const data = response?.data ?? response ?? {}
            setDashboardData({
                franchiseName: data.franchiseName ?? FALLBACK_FRANCHISE.franchiseName,
                totalLocations: data.totalLocations ?? FALLBACK_FRANCHISE.totalLocations,
                totalStaff: data.totalStaff ?? FALLBACK_FRANCHISE.totalStaff,
                totalStudents: data.totalStudents ?? FALLBACK_FRANCHISE.totalStudents,
                totalRevenue: data.totalRevenue ?? FALLBACK_FRANCHISE.totalRevenue,
                monthlyRevenue: data.monthlyRevenue ?? FALLBACK_FRANCHISE.monthlyRevenue,
                revenueGrowth: data.revenueGrowth ?? FALLBACK_FRANCHISE.revenueGrowth,
                occupancyRate: data.occupancyRate ?? FALLBACK_FRANCHISE.occupancyRate,
                staffUtilization: data.staffUtilization ?? FALLBACK_FRANCHISE.staffUtilization,
                customerSatisfaction: data.customerSatisfaction ?? FALLBACK_FRANCHISE.customerSatisfaction,
                pendingApprovals: data.pendingApprovals ?? FALLBACK_FRANCHISE.pendingApprovals,
                criticalAlerts: data.criticalAlerts ?? FALLBACK_FRANCHISE.criticalAlerts,
                warnings: data.warnings ?? FALLBACK_FRANCHISE.warnings,
                locationsChange: data.locationsChange ?? FALLBACK_FRANCHISE.locationsChange,
                studentsChange: data.studentsChange ?? FALLBACK_FRANCHISE.studentsChange,
                staffChange: data.staffChange ?? FALLBACK_FRANCHISE.staffChange,
                revenueChange: data.revenueChange ?? FALLBACK_FRANCHISE.revenueChange,
                revenueTrend: data.revenueTrend ?? FALLBACK_FRANCHISE.revenueTrend,
                locationPerformance: data.locationPerformance ?? FALLBACK_FRANCHISE.locationPerformance,
                pendingActions: data.pendingActions ?? FALLBACK_FRANCHISE.pendingActions,
                alerts: data.alerts ?? FALLBACK_FRANCHISE.alerts,
            })
        } catch (error) {
            console.error('Error loading franchise dashboard:', error)
            setDashboardData(FALLBACK_FRANCHISE)
        } finally {
            setIsLoading(false)
        }
    }, [timeRange])

    useRealtimeRefresh(['location', 'staff', 'program', 'booking', 'payment'], loadData)

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
                    <h1 className="text-3xl font-bold text-gray-900">Franchise Dashboard</h1>
                    <p className="text-gray-600 mt-1">{dashboardData?.franchiseName} - Operations Overview</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button id="admin-franchise-dashboard-btn"
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
                    {
                        title: 'Franchise Locations',
                        value: dashboardData?.totalLocations,
                        icon: Building2,
                        gradient: 'from-blue-500 to-blue-600',
                        bgGradient: 'from-blue-50 to-blue-100',
                        change: dashboardData?.locationsChange || '+0 this year'
                    },
                    {
                        title: 'Total Students',
                        value: dashboardData?.totalStudents,
                        icon: Users,
                        gradient: 'from-green-500 to-emerald-600',
                        bgGradient: 'from-green-50 to-emerald-100',
                        change: dashboardData?.studentsChange || '+0 this month'
                    },
                    {
                        title: 'Staff Members',
                        value: dashboardData?.totalStaff,
                        icon: Users,
                        gradient: 'from-purple-500 to-purple-600',
                        bgGradient: 'from-purple-50 to-purple-100',
                        change: dashboardData?.staffChange || '+0 this month'
                    },
                    {
                        title: 'Total Revenue',
                        value: dashboardData?.totalRevenue > 0 ? `${(dashboardData.totalRevenue / 1000000).toFixed(2)}M` : '$0',
                        icon: DollarSign,
                        gradient: 'from-orange-500 to-orange-600',
                        bgGradient: 'from-orange-50 to-orange-100',
                        change: dashboardData?.revenueChange || '+0% YoY'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
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

            {/* Franchise Metrics & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Franchise Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Franchise Metrics
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

                {/* Franchise Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Alerts & Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(dashboardData?.alerts ?? []).length > 0 ? (
                                dashboardData.alerts.map((alert: any, idx: number) => (
                                    <div key={idx} className={`p-3 rounded-lg border ${
                                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                        alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                        alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                        'bg-green-50 border-green-200'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={
                                                alert.type === 'warning' ? 'secondary' :
                                                alert.type === 'error' ? 'destructive' :
                                                'outline'
                                            } className="text-xs">
                                                {alert.type === 'warning' ? 'Warning' :
                                                 alert.type === 'error' ? 'Critical' :
                                                 alert.type === 'success' ? 'Success' : 'Info'}
                                            </Badge>
                                            <span className={`text-sm font-medium ${
                                                alert.type === 'warning' ? 'text-yellow-900' :
                                                alert.type === 'error' ? 'text-red-900' :
                                                alert.type === 'success' ? 'text-green-900' : 'text-blue-900'
                                            }`}>{alert.title}</span>
                                        </div>
                                        <p className={`text-xs ${
                                            alert.type === 'warning' ? 'text-yellow-700' :
                                            alert.type === 'error' ? 'text-red-700' :
                                            alert.type === 'success' ? 'text-green-700' : 'text-blue-700'
                                        }`}>{alert.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">Success</Badge>
                                        <span className="text-sm font-medium text-green-900">All Systems Operational</span>
                                    </div>
                                    <p className="text-xs text-green-700">No critical issues detected</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
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
                                    <span className="font-bold text-gray-900">
                                        {dashboardData?.monthlyRevenue > 0 ? `$${(dashboardData.monthlyRevenue / 1000).toFixed(0)}K` : '$0'}
                                    </span>
                                </div>
                                <Progress value={dashboardData?.totalRevenue > 0 ? Math.min(100, (dashboardData.monthlyRevenue / (dashboardData.totalRevenue / 12)) * 100) : 0} className="h-2" />
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-2">Revenue Growth</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardData?.revenueGrowth?.toFixed(1) ?? '0.0'}%</p>
                                <p className={`text-xs flex items-center gap-1 mt-1 ${dashboardData?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {dashboardData?.revenueGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    vs last month
                                </p>
                            </div>
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
                    {(dashboardData?.revenueTrend ?? []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => typeof value === 'number' ? `${(value / 1000).toFixed(0)}K` : value} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                                <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                            No revenue data available yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Location Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(dashboardData?.locationPerformance ?? []).length > 0 ? (
                        <div className="space-y-3">
                            {dashboardData.locationPerformance.map((location: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{location.name}</p>
                                        <p className="text-xs text-gray-600">
                                            {location.students} students &bull; {location.revenue > 0 ? `$${(location.revenue / 1000).toFixed(0)}K revenue` : 'No revenue yet'}
                                        </p>
                                    </div>
                                    <Badge variant={location.status === 'excellent' ? 'default' : 'secondary'}>
                                        {location.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[100px] text-gray-400">
                            No location data available yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pending Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Pending Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(dashboardData?.pendingActions ?? []).length > 0 ? (
                        <div className="space-y-3">
                            {dashboardData.pendingActions.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.type}</p>
                                        <p className="text-sm text-gray-600">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                                            {item.priority}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[80px] text-gray-400">
                            <div className="text-center">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                                <p>No pending actions</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Franchise Insights</CardTitle>
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
                            <p className="text-sm text-gray-500">Analyzing franchise data...</p>
                        </div>
                    ) : aiInsights ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Churn Risk Analysis */}
                            {(Array.isArray(aiInsights.churnRisk) ? aiInsights.churnRisk : aiInsights.churnRisk?.atRiskStudents || aiInsights.churnRisk?.risks || []).slice(0, 3).map((risk: any, i: number) => (
                                <div key={`churn-${i}`} className="p-4 bg-gradient-to-br from-red-50 to-orange-100 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <span className="text-xs font-semibold text-red-700 uppercase">Churn Risk</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{risk.title || risk.studentName || risk.name || risk}</p>
                                    <p className="text-xs text-gray-600 mt-1">{risk.description || risk.reason || risk.riskLevel || ''}</p>
                                </div>
                            ))}
                            {/* Schedule Optimization */}
                            {(Array.isArray(aiInsights.scheduleOptimization) ? aiInsights.scheduleOptimization : aiInsights.scheduleOptimization?.suggestions || aiInsights.scheduleOptimization?.recommendations || []).slice(0, 3).map((sched: any, i: number) => (
                                <div key={`sched-${i}`} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700 uppercase">Schedule Optimization</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{sched.title || sched.suggestion || sched.name || sched}</p>
                                    <p className="text-xs text-gray-600 mt-1">{sched.description || sched.impact || ''}</p>
                                </div>
                            ))}
                            {/* Revenue Predictions */}
                            {(aiInsights.churnRisk?.revenuePredictions || aiInsights.scheduleOptimization?.revenueImpact || []).slice(0, 2).map((pred: any, i: number) => (
                                <div key={`pred-${i}`} className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-green-700 uppercase">Revenue Prediction</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{pred.title || pred.prediction || pred.name || pred}</p>
                                    <p className="text-xs text-gray-600 mt-1">{pred.description || pred.amount || ''}</p>
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
        </div>
    )
}
