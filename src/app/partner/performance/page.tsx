'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { motion } from 'framer-motion'
import { AlertCircle, Star, CheckCircle, AlertTriangle, Award, TrendingUp, Target, RefreshCw, Brain, Loader2, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'

export default function Performance() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [goals, setGoals] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiPerformanceInsights = async () => {
        setAiLoading(true)
        try {
            const [predictionsRes, insightsRes] = await Promise.allSettled([
                apiClient.get<any>('/advanced-analytics/predictive/partner-performance'),
                apiClient.get<any>('/advanced-analytics/insights'),
            ])
            const predictions = predictionsRes.status === 'fulfilled' ? predictionsRes.value?.data : null
            const insights = insightsRes.status === 'fulfilled' ? insightsRes.value?.data : null
            setAiInsights({ predictions, insights })
        } catch (err) { console.error('AI unavailable:', err) }
        finally { setAiLoading(false) }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadPerformance()
        loadAiPerformanceInsights()
    }, [isAuthenticated, router, user])

    const loadPerformance = async () => {
        try {
            setLoading(true)
            setError(null)
            const partnerId = user?.id || 'partner-1'
            const [metricsRes, goalsRes] = await Promise.all([
                PartnerAnalyticsService.getPerformanceMetrics(partnerId),
                PartnerAnalyticsService.getGoalProgress(partnerId, { limit: 10 })
            ])
            setMetrics(metricsRes)
            setGoals(goalsRes.goals || [])
        } catch (err) {
            console.error('Error loading performance:', err)
            setError('Failed to load performance data')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadPerformance()
        setRefreshing(false)
    }

    const getGoalStatusColor = (status: string) => {
        switch (status) {
            case 'on-track': return 'bg-green-100 text-green-800'
            case 'at-risk': return 'bg-yellow-100 text-yellow-800'
            case 'behind': return 'bg-red-100 text-red-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'on-track': return 'bg-green-500'
            case 'at-risk': return 'bg-yellow-500'
            case 'behind': return 'bg-red-500'
            case 'completed': return 'bg-blue-500'
            default: return 'bg-blue-600'
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Performance Tracking</h1>
                        <p className="text-gray-600 mt-1">Monitor your key performance indicators and goals</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="ml-auto text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading performance data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Colorful Top Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                {
                                    title: 'Satisfaction',
                                    value: `${metrics?.customerSatisfaction?.toFixed(1) || '0'}%`,
                                    icon: Star,
                                    gradient: 'from-blue-500 to-blue-600',
                                    bgGradient: 'from-blue-50 to-blue-100',
                                    change: (metrics?.customerSatisfaction || 0) >= 80 ? 'Excellent' : (metrics?.customerSatisfaction || 0) >= 60 ? 'Good' : 'Needs work'
                                },
                                {
                                    title: 'Completion Rate',
                                    value: `${metrics?.completionRate?.toFixed(1) || '0'}%`,
                                    icon: CheckCircle,
                                    gradient: 'from-green-500 to-green-600',
                                    bgGradient: 'from-green-50 to-green-100',
                                    change: (metrics?.completionRate || 0) >= 80 ? 'On track' : 'Improving'
                                },
                                {
                                    title: 'Dropout Rate',
                                    value: `${metrics?.dropoutRate?.toFixed(1) || '0'}%`,
                                    icon: AlertTriangle,
                                    gradient: 'from-orange-500 to-orange-600',
                                    bgGradient: 'from-orange-50 to-orange-100',
                                    change: (metrics?.dropoutRate || 0) <= 10 ? 'Low' : (metrics?.dropoutRate || 0) <= 20 ? 'Moderate' : 'High'
                                },
                                {
                                    title: 'Quality Score',
                                    value: `${metrics?.qualityScore?.toFixed(1) || '0'}/100`,
                                    icon: Award,
                                    gradient: 'from-purple-500 to-purple-600',
                                    bgGradient: 'from-purple-50 to-purple-100',
                                    change: (metrics?.qualityScore || 0) >= 80 ? 'Top tier' : (metrics?.qualityScore || 0) >= 60 ? 'Above avg' : 'Growing'
                                },
                            ].map((metric, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                    <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                                    <metric.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.change}</span>
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

                        {/* Goals Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="shadow-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-blue-600" />
                                            <CardTitle>Goals Progress</CardTitle>
                                        </div>
                                        <span className="text-sm text-gray-500">{goals.length} goals tracked</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {goals.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">No goals set yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {goals.map((goal, idx) => (
                                                <motion.div
                                                    key={goal.goalId || goal.id || idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 + idx * 0.05 }}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp className="w-4 h-4 text-gray-500" />
                                                            <h3 className="font-medium text-gray-900">{goal.goalName}</h3>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGoalStatusColor(goal.status)}`}>
                                                            {goal.status}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                                        <motion.div
                                                            className={`h-2.5 rounded-full ${getProgressBarColor(goal.status)}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${goal.progress}%` }}
                                                            transition={{ duration: 1, delay: 0.7 + idx * 0.1 }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm text-gray-600">{goal.progress}% complete</p>
                                                        {goal.targetDate && (
                                                            <p className="text-xs text-gray-400">Target: {goal.targetDate}</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}

                {/* AI Performance Insights */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-purple-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    <CardTitle className="text-base">AI Performance Coach</CardTitle>
                                    <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                                </div>
                                <button onClick={loadAiPerformanceInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                                    <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {aiLoading ? (
                                <div className="flex items-center justify-center py-6 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                    <p className="text-sm text-gray-500">AI analyzing performance...</p>
                                </div>
                            ) : aiInsights ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-700 uppercase">Growth Forecast</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-900">{aiInsights.predictions?.predictions?.enrollmentGrowth || '--'}%</p>
                                        <p className="text-xs text-blue-600 mt-1">Predicted enrollment growth</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-green-600" />
                                            <span className="text-xs font-semibold text-green-700 uppercase">Retention</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-900">{aiInsights.predictions?.predictions?.studentRetention || '--'}%</p>
                                        <p className="text-xs text-green-600 mt-1">Student retention prediction</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Brain className="w-4 h-4 text-purple-600" />
                                            <span className="text-xs font-semibold text-purple-700 uppercase">AI Advice</span>
                                        </div>
                                        <p className="text-sm font-medium text-purple-900">
                                            {aiInsights.predictions?.reasoning || aiInsights.insights?.keyMetricsSummary || 'AI analyzing performance patterns...'}
                                        </p>
                                    </div>
                                    {aiInsights.predictions?.actionItems?.map((action: string, idx: number) => (
                                        <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                                            <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-amber-800">{action}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Brain className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">AI performance analysis unavailable</p>
                                    <button onClick={loadAiPerformanceInsights} className="mt-1 text-xs text-purple-600 hover:underline">Retry</button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
