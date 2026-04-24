'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import {
    Calendar, Clock, TrendingUp, Award, BookOpen, CreditCard, ArrowRight, RefreshCw,
    Target, Flame, Brain, Sparkles, Loader2, AlertTriangle, CheckCircle, Trophy,
    Zap, Apple, ArrowUp, ArrowDown, Shield, Star, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserClassesService from '@/services/modules/user-classes.service'
import UserProgressService from '@/services/modules/user-progress.service'
import UserAchievementsService from '@/services/modules/user-achievements.service'
import { apiClient } from '@/services/api/client'
import aiCoachService from '@/services/aiCoachService'
import { gamificationEngineService, parentAIService } from '@/services/advancedAIServices'

interface DashboardStats {
    upcomingClasses: number
    completedClasses: number
    totalBookings: number
    achievements: number
    currentStreak: number
    totalPoints: number
}

const DEFAULT_STATS: DashboardStats = {
    upcomingClasses: 0,
    completedClasses: 0,
    totalBookings: 0,
    achievements: 0,
    currentStreak: 0,
    totalPoints: 0,
}

const FALLBACK_AI_TIPS = [
    'Stay consistent with your training schedule for best results.',
    'Remember to warm up before every session and cool down after.',
    'Hydration and sleep are just as important as your workouts.',
]

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="animate-pulse flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-72" />
                    <div className="h-4 bg-gray-200 rounded w-48" />
                </div>
                <div className="h-9 w-24 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse"><div className="h-[120px] bg-gray-200 rounded-lg" /></div>
                ))}
            </div>
            <div className="animate-pulse h-[140px] bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-1 gap-6">
                <div className="animate-pulse h-[200px] bg-gray-200 rounded-lg" />
                <div className="animate-pulse h-[180px] bg-gray-200 rounded-lg" />
            </div>
        </div>
    )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
            <p className="text-gray-500 text-sm text-center max-w-md">
                We could not load your dashboard. This might be a temporary issue. Please try again.
            </p>
            <Button onClick={onRetry} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
        </div>
    )
}

type DateRangePreset = 'today' | 'week' | 'month' | 'last30' | 'custom'

function computeRange(preset: DateRangePreset, customFrom: string, customTo: string): { from: string; to: string } {
    const today = new Date()
    const toIso = (d: Date) => d.toISOString().split('T')[0]
    const end = new Date(today)

    switch (preset) {
        case 'today': {
            return { from: toIso(today), to: toIso(today) }
        }
        case 'week': {
            const start = new Date(today)
            const day = start.getDay() // 0 = Sun
            const diff = (day === 0 ? 6 : day - 1) // make Monday the start of week
            start.setDate(start.getDate() - diff)
            return { from: toIso(start), to: toIso(end) }
        }
        case 'month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1)
            return { from: toIso(start), to: toIso(end) }
        }
        case 'last30': {
            const start = new Date(today)
            start.setDate(start.getDate() - 29)
            return { from: toIso(start), to: toIso(end) }
        }
        case 'custom': {
            return { from: customFrom, to: customTo }
        }
    }
}

export default function UserDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isRangeReloading, setIsRangeReloading] = useState(false)
    const hasLoadedOnceRef = useRef(false)
    const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS)
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
    const [progressData, setProgressData] = useState<any>(null)

    // Date-range filter state
    const [rangePreset, setRangePreset] = useState<DateRangePreset>('month')
    const [customFrom, setCustomFrom] = useState<string>('')
    const [customTo, setCustomTo] = useState<string>('')

    // AI States
    const [aiRecommendations, setAiRecommendations] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiChallenges, setAiChallenges] = useState<any>(null)
    const [aiChallengesLoading, setAiChallengesLoading] = useState(false)
    const [aiStreakRisk, setAiStreakRisk] = useState<any>(null)
    const [aiMilestones, setAiMilestones] = useState<any>(null)
    const [aiMilestonesLoading, setAiMilestonesLoading] = useState(false)
    const [progressPrediction, setProgressPrediction] = useState<any>(null)

    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const userId = user?.id || ''
    const tenantId = (user as any)?.tenantId || 'proactiv-hq'

    const loadDashboard = useCallback(async () => {
        try {
            if (hasLoadedOnceRef.current) {
                setIsRangeReloading(true)
            } else {
                setIsLoading(true)
            }
            setHasError(false)

            // Compute the active date range (skip when custom is picked but incomplete)
            const { from, to } = computeRange(rangePreset, customFrom, customTo)
            const hasRange = !!from && !!to
            const params: Record<string, string> = {}
            if (hasRange) {
                params.from = from
                params.to = to
            }

            let dashboardData: any = null
            try {
                const dashboardRes = await apiClient.get<any>('/user/dashboard', hasRange ? { params } : undefined)
                dashboardData = dashboardRes?.data ?? dashboardRes
            } catch { /* fall back to individual calls */ }

            if (dashboardData?.stats) {
                setStats({
                    upcomingClasses: dashboardData.stats.upcomingClasses ?? 0,
                    completedClasses: dashboardData.stats.completedClasses ?? 0,
                    totalBookings: dashboardData.stats.totalBookings ?? 0,
                    achievements: dashboardData.stats.achievements ?? 0,
                    currentStreak: dashboardData.stats.currentStreak ?? 0,
                    totalPoints: dashboardData.stats.totalPoints ?? 0,
                })
                setUpcomingClasses(Array.isArray(dashboardData.upcomingClasses) ? dashboardData.upcomingClasses.slice(0, 5) : [])
                setProgressData(dashboardData.progress ?? null)
            } else {
                let upcoming: any[] = []
                let allClasses: any[] = []
                let progress: any = null
                let achievementsStats: any = null

                try { upcoming = await new UserClassesService().getUpcomingClasses() } catch { upcoming = [] }
                try { allClasses = await new UserClassesService().getClasses() } catch { allClasses = [] }
                try { progress = await new UserProgressService().getProgress() } catch { progress = null }
                try { achievementsStats = await new UserAchievementsService().getStats() } catch { achievementsStats = null }

                setUpcomingClasses(Array.isArray(upcoming) ? upcoming.slice(0, 5) : [])
                const completedCount = Array.isArray(allClasses) ? allClasses.filter((c: any) => c.status === 'completed').length : 0

                setStats({
                    upcomingClasses: Array.isArray(upcoming) ? upcoming.length : 0,
                    completedClasses: completedCount,
                    totalBookings: Array.isArray(allClasses) ? allClasses.length : 0,
                    achievements: achievementsStats?.unlockedAchievements ?? achievementsStats?.totalPoints ?? 0,
                    currentStreak: progress?.currentStreak ?? 0,
                    totalPoints: achievementsStats?.totalPoints ?? 0,
                })
                setProgressData(progress)
            }
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setHasError(true)
        } finally {
            setIsLoading(false)
            setIsRangeReloading(false)
            hasLoadedOnceRef.current = true
        }
    }, [rangePreset, customFrom, customTo])

    const loadAiRecommendations = useCallback(async () => {
        setAiLoading(true)
        try {
            let progress: any = null
            let recommendations: any = null

            try { progress = await aiCoachService.predictProgress(userId, tenantId) } catch { progress = null }
            try { recommendations = await aiCoachService.getRecommendations({ studentId: userId, skillLevel: 'all' }) } catch { recommendations = null }

            // Store progress prediction separately for rendering
            setProgressPrediction(progress?.data || progress)

            const recList = recommendations?.data?.recommendations || recommendations?.recommendations || []
            const assessment = recommendations?.data?.overallAssessment || recommendations?.overallAssessment || ''
            const focus = recommendations?.data?.focusArea || recommendations?.focusArea || ''
            const isAI = recommendations?.data?.aiPowered ?? recommendations?.aiPowered ?? false

            if (recList.length > 0 || assessment) {
                setAiRecommendations({
                    recommendations: recList,
                    overallAssessment: assessment,
                    focusArea: focus,
                    aiPowered: isAI,
                })
            } else {
                setAiRecommendations({
                    recommendations: FALLBACK_AI_TIPS.map(tip => ({ suggestion: tip })),
                    overallAssessment: 'Keep up the great work! Here are some general fitness tips to help you on your journey.',
                    focusArea: '',
                    aiPowered: false,
                })
            }
        } catch {
            setAiRecommendations({
                recommendations: FALLBACK_AI_TIPS.map(tip => ({ suggestion: tip })),
                overallAssessment: 'Keep up the great work! Here are some general fitness tips to help you on your journey.',
                focusArea: '',
                aiPowered: false,
            })
        } finally {
            setAiLoading(false)
        }
    }, [userId, tenantId])

    const loadAiChallenges = useCallback(async () => {
        if (!userId) return
        setAiChallengesLoading(true)
        try {
            const [challengesRes, streakRes] = await Promise.allSettled([
                gamificationEngineService.getChallenges(userId),
                gamificationEngineService.getStreakRisk(userId),
            ])
            const challenges = challengesRes.status === 'fulfilled' ? (challengesRes.value?.data || challengesRes.value) : null
            const streak = streakRes.status === 'fulfilled' ? (streakRes.value?.data || streakRes.value) : null
            setAiChallenges(challenges)
            setAiStreakRisk(streak)
        } catch { /* silent */ }
        finally { setAiChallengesLoading(false) }
    }, [userId])

    const loadAiMilestones = useCallback(async () => {
        if (!userId) return
        setAiMilestonesLoading(true)
        try {
            const res = await parentAIService.getMilestones(userId)
            setAiMilestones(res?.data || res)
        } catch { setAiMilestones(null) }
        finally { setAiMilestonesLoading(false) }
    }, [userId])

    useRealtimeRefresh(['booking', 'attendance', 'payment', 'program'], loadDashboard)

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadDashboard()
        loadAiRecommendations()
        loadAiChallenges()
        loadAiMilestones()
    }, [isAuthenticated, router, loadDashboard, loadAiRecommendations, loadAiChallenges, loadAiMilestones])

    const handleRefresh = async () => {
        setRefreshing(true)
        await Promise.all([loadDashboard(), loadAiRecommendations(), loadAiChallenges(), loadAiMilestones()])
        setRefreshing(false)
    }

    const displayName = user?.name || (user as any)?.firstName || 'User'

    if (isLoading) return <LoadingSkeleton />
    if (hasError) return <ErrorState onRetry={handleRefresh} />

    const statCards = [
        { title: 'Upcoming Classes', value: stats.upcomingClasses, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', badge: `${stats.upcomingClasses} scheduled`, badgeColor: 'text-blue-600 bg-blue-100' },
        { title: 'Completed', value: stats.completedClasses, icon: TrendingUp, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', badge: 'classes done', badgeColor: 'text-green-600 bg-green-100' },
        { title: 'Total Bookings', value: stats.totalBookings, icon: BookOpen, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', badge: 'all time', badgeColor: 'text-purple-600 bg-purple-100' },
        { title: 'Achievements', value: stats.achievements, icon: Award, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', badge: `${stats.totalPoints} pts`, badgeColor: 'text-orange-600 bg-orange-100' },
    ]

    const quickActions = [
        { label: 'Browse Classes', href: '/user/my-classes', icon: BookOpen },
        { label: 'My Bookings', href: '/user/bookings', icon: Calendar },
        { label: 'Payments', href: '/user/payments', icon: CreditCard },
        { label: 'Progress', href: '/user/progress', icon: TrendingUp },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-2">Here&apos;s your fitness overview</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            id="user-dashboard-range-preset"
                            aria-label="Date range"
                            value={rangePreset}
                            onChange={(e) => setRangePreset(e.target.value as DateRangePreset)}
                            disabled={isRangeReloading || refreshing}
                            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="custom">Custom</option>
                        </select>
                        {isRangeReloading && (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" aria-label="Reloading" />
                        )}
                    </div>
                    {rangePreset === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                id="user-dashboard-range-from"
                                type="date"
                                aria-label="From date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                max={customTo || undefined}
                                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-xs text-gray-500">to</span>
                            <input
                                id="user-dashboard-range-to"
                                type="date"
                                aria-label="To date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                min={customFrom || undefined}
                                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    )}
                    <Button id="user-dashboard-refresh-btn" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium ${metric.badgeColor} px-2 py-1 rounded-full`}>{metric.badge}</span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <Button id={`user-dashboard-action-${action.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                    key={action.label} variant="outline"
                                    className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300"
                                    onClick={() => router.push(action.href)}
                                >
                                    <Icon className="w-6 h-6 text-emerald-600" />
                                    <span className="text-sm font-medium">{action.label}</span>
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ═══════════════ AI & AUTOMATION SECTION ═══════════════ */}

            {/* AI Recommendations - Enhanced */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Coaching Insights</CardTitle>
                            {aiRecommendations?.aiPowered ? (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-600 text-xs">General Tips</Badge>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={loadAiRecommendations} disabled={aiLoading}>
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Personalizing your experience...</p>
                        </div>
                    ) : aiRecommendations ? (
                        <div className="space-y-4">
                            {/* Overall Assessment */}
                            {aiRecommendations.overallAssessment && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-purple-900 mb-1">Your Assessment</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{aiRecommendations.overallAssessment}</p>
                                            {aiRecommendations.focusArea && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Target className="w-3 h-3 text-purple-600" />
                                                    <span className="text-xs font-medium text-purple-700">Focus Area: {aiRecommendations.focusArea}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Progress Prediction */}
                            {progressPrediction && (
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-blue-800">Progress Prediction</span>
                                        {progressPrediction.aiPowered === false && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Fallback</Badge>}
                                    </div>
                                    {progressPrediction.trajectory && (
                                        <p className="text-sm text-gray-700 mb-2">{progressPrediction.trajectory}</p>
                                    )}
                                    {progressPrediction.predictedImprovement != null && (
                                        <div className="flex items-center gap-2">
                                            <ArrowUp className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-bold text-green-700">+{progressPrediction.predictedImprovement}% predicted improvement</span>
                                        </div>
                                    )}
                                    {progressPrediction.confidence != null && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">Confidence:</span>
                                            <Progress value={progressPrediction.confidence * 100 || progressPrediction.confidence} className="h-1.5 flex-1 max-w-32" />
                                            <span className="text-xs font-medium text-gray-600">{Math.round((progressPrediction.confidence > 1 ? progressPrediction.confidence : progressPrediction.confidence * 100) || 0)}%</span>
                                        </div>
                                    )}
                                    {progressPrediction.insights && (
                                        <p className="text-xs text-gray-600 mt-2">{progressPrediction.insights}</p>
                                    )}
                                </div>
                            )}

                            {/* Recommendations List */}
                            {aiRecommendations.recommendations?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Recommendations</h4>
                                    {aiRecommendations.recommendations.slice(0, 5).map((rec: any, i: number) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    (rec.priority || i + 1) <= 1 ? 'bg-red-100 text-red-600' :
                                                    (rec.priority || i + 1) <= 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-medium text-gray-900">{rec.skill || rec.suggestion || rec}</p>
                                                        {rec.level && <Badge className="bg-blue-100 text-blue-700 text-xs">{rec.level}</Badge>}
                                                    </div>
                                                    {rec.suggestion && rec.skill && (
                                                        <p className="text-xs text-gray-600 mt-1">{rec.suggestion}</p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                        {rec.estimatedTimeWeeks && (
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {rec.estimatedTimeWeeks} weeks
                                                            </span>
                                                        )}
                                                        {rec.priority && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                rec.priority <= 1 ? 'bg-red-100 text-red-700' : rec.priority <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                                            }`}>P{rec.priority}</span>
                                                        )}
                                                    </div>
                                                    {rec.drills?.length > 0 && (
                                                        <div className="mt-2 space-y-0.5">
                                                            <p className="text-xs font-medium text-gray-500">Drills:</p>
                                                            {rec.drills.slice(0, 3).map((drill: string, di: number) => (
                                                                <div key={di} className="flex items-center gap-1.5">
                                                                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                                                    <span className="text-xs text-gray-600">{drill}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">AI recommendations will appear as you attend more classes</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Challenges & Streak Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Challenges */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-600" />
                                <CardTitle>AI Challenges</CardTitle>
                                <Badge className="bg-amber-100 text-amber-700 text-xs">Gamification</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={loadAiChallenges} disabled={aiChallengesLoading}>
                                <RefreshCw className={`w-4 h-4 ${aiChallengesLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {aiChallengesLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                                <p className="text-sm text-gray-500">Generating personalized challenges...</p>
                            </div>
                        ) : aiChallenges?.challenges?.length > 0 ? (
                            <div className="space-y-3">
                                {aiChallenges.challenges.slice(0, 4).map((ch: any, i: number) => (
                                    <motion.div key={ch.challengeId || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        className={`p-3 rounded-lg border ${
                                            ch.type === 'daily' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' :
                                            ch.type === 'weekly' ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' :
                                            'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">{ch.title}</span>
                                                    <Badge className={`text-xs ${
                                                        ch.type === 'daily' ? 'bg-blue-100 text-blue-700' :
                                                        ch.type === 'weekly' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>{ch.type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">{ch.description}</p>
                                                {ch.criteria && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Target className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">Goal: {ch.criteria.target} {ch.criteria.unit}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500" />
                                                    <span className="text-sm font-bold text-amber-700">{ch.xpReward} XP</span>
                                                </div>
                                                {ch.difficulty != null && (
                                                    <div className="mt-1">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(d => (
                                                                <div key={d} className={`w-2 h-2 rounded-full ${d <= (ch.difficulty || 1) ? 'bg-amber-500' : 'bg-gray-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {aiChallenges.aiPowered === false && <p className="text-xs text-yellow-600">Fallback mode - AI unavailable</p>}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Challenges will appear as you start training</p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={loadAiChallenges}>
                                    <Sparkles className="w-4 h-4 mr-1" /> Generate Challenges
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Streak Risk & Milestones */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-600" />
                                <CardTitle>Streak & Milestones</CardTitle>
                                <Badge className="bg-orange-100 text-orange-700 text-xs">AI Powered</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { loadAiChallenges(); loadAiMilestones() }} disabled={aiChallengesLoading || aiMilestonesLoading}>
                                <RefreshCw className={`w-4 h-4 ${(aiChallengesLoading || aiMilestonesLoading) ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Streak Risk */}
                            {aiStreakRisk && (
                                <div className={`p-4 rounded-lg border ${
                                    aiStreakRisk.riskLevel === 'critical' || aiStreakRisk.riskLevel === 'high' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' :
                                    aiStreakRisk.riskLevel === 'medium' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' :
                                    'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Flame className={`w-5 h-5 ${
                                                aiStreakRisk.riskLevel === 'low' ? 'text-green-600' : aiStreakRisk.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                            }`} />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {aiStreakRisk.streakLength || 0} Day Streak
                                            </span>
                                        </div>
                                        <Badge className={`text-xs ${
                                            aiStreakRisk.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                                            aiStreakRisk.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{aiStreakRisk.riskLevel} risk</Badge>
                                    </div>
                                    {aiStreakRisk.motivationalMessage && (
                                        <p className="text-sm text-gray-700">{aiStreakRisk.motivationalMessage}</p>
                                    )}
                                    {aiStreakRisk.intervention && (
                                        <p className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded">{aiStreakRisk.intervention}</p>
                                    )}
                                    {aiStreakRisk.suggestedActions?.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {aiStreakRisk.suggestedActions.slice(0, 3).map((action: string, i: number) => (
                                                <div key={i} className="flex items-center gap-1.5">
                                                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                                    <span className="text-xs text-gray-600">{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Milestones */}
                            {aiMilestonesLoading ? (
                                <div className="flex items-center justify-center py-4 gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                                    <p className="text-xs text-gray-500">Loading milestones...</p>
                                </div>
                            ) : aiMilestones ? (
                                <div className="space-y-3">
                                    {/* New Milestones */}
                                    {aiMilestones.newMilestones?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-green-700 mb-2">New Milestones Achieved!</p>
                                            {aiMilestones.newMilestones.slice(0, 3).map((m: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mb-1">
                                                    <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <span className="text-xs font-medium text-gray-900">{m.title}</span>
                                                        {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                                                    </div>
                                                    {m.significance && (
                                                        <Badge className={`text-xs ${
                                                            m.significance === 'exceptional' ? 'bg-yellow-100 text-yellow-700' :
                                                            m.significance === 'major' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>{m.significance}</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upcoming Milestones */}
                                    {aiMilestones.upcomingMilestones?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-blue-700 mb-2">Coming Up Next</p>
                                            {aiMilestones.upcomingMilestones.slice(0, 3).map((m: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 mb-1">
                                                    <Target className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <span className="text-xs font-medium text-gray-900">{m.title}</span>
                                                        {m.estimatedDate && <p className="text-xs text-gray-400">Est: {m.estimatedDate}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(!aiMilestones.newMilestones?.length && !aiMilestones.upcomingMilestones?.length) && (
                                        <p className="text-xs text-gray-400 italic text-center py-2">Keep training to unlock milestones!</p>
                                    )}
                                </div>
                            ) : !aiStreakRisk ? (
                                <div className="text-center py-4">
                                    <Flame className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Start attending classes to build your streak</p>
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Classes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Upcoming Classes</CardTitle>
                        <Button id="user-dashboard-view-all-classes-btn" variant="ghost" size="sm" onClick={() => router.push('/user/my-classes')}>
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {upcomingClasses.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No upcoming classes</p>
                            <p className="text-gray-400 text-sm mt-1">Book a class to get started!</p>
                            <Button id="user-dashboard-book-class-empty-btn" size="sm" className="mt-4" onClick={() => router.push('/user/my-classes')}>
                                <BookOpen className="w-4 h-4 mr-2" /> Browse Classes
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingClasses.map((cls, index) => (
                                <motion.div key={cls.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {cls.schedule?.date?.split('-')[2] || cls.date?.split('-')[2] || '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                                            <p className="text-sm text-gray-500">
                                                {cls.coach} {cls.schedule?.time || cls.time ? `\u2022 ${cls.schedule?.time || cls.time}` : ''} {cls.location ? `\u2022 ${cls.location}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={(cls.status === 'confirmed' || cls.status === 'upcoming') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {cls.status}
                                        </Badge>
                                        <Button id={`user-dashboard-view-class-${cls.id}-btn`} variant="outline" size="sm" onClick={() => router.push('/user/my-classes')}>View</Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Progress Overview</CardTitle>
                        <Button id="user-dashboard-view-progress-btn" variant="ghost" size="sm" onClick={() => router.push('/user/progress')}>
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {progressData ? (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-sm text-emerald-600 font-bold">{progressData.overallProgress || 0}%</span>
                                </div>
                                <Progress value={progressData.overallProgress || 0} className="h-2" />
                            </div>
                            {progressData.skillsProgress?.slice(0, 3).map((skill: any, i: number) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{skill.skillName}</span>
                                        <span className="text-sm text-emerald-600 font-bold">{skill.progress}%</span>
                                    </div>
                                    <Progress value={skill.progress} className="h-2" />
                                </div>
                            ))}
                            {(!progressData.skillsProgress || progressData.skillsProgress.length === 0) && (
                                <>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Monthly Attendance</span>
                                            <span className="text-sm text-emerald-600 font-bold">{progressData.performanceMetrics?.attendance || 0}%</span>
                                        </div>
                                        <Progress value={progressData.performanceMetrics?.attendance || 0} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Participation</span>
                                            <span className="text-sm text-emerald-600 font-bold">{progressData.performanceMetrics?.participation || 0}%</span>
                                        </div>
                                        <Progress value={progressData.performanceMetrics?.participation || 0} className="h-2" />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No progress data yet. Start attending classes!</p>
                            <Button id="user-dashboard-start-progress-btn" size="sm" variant="outline" className="mt-3" onClick={() => router.push('/user/progress')}>
                                View Progress
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
