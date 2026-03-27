'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import { Calendar, Clock, TrendingUp, Award, BookOpen, CreditCard, ArrowRight, RefreshCw, Target, Flame, Brain, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
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
            {/* Header skeleton */}
            <div className="animate-pulse flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-72" />
                    <div className="h-4 bg-gray-200 rounded w-48" />
                </div>
                <div className="h-9 w-24 bg-gray-200 rounded" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                        <div className="h-[120px] bg-gray-200 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Quick actions skeleton */}
            <div className="animate-pulse h-[140px] bg-gray-200 rounded-lg" />

            {/* Content sections skeleton */}
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
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
            </Button>
        </div>
    )
}

export default function UserDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS)
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
    const [progressData, setProgressData] = useState<any>(null)
    const [aiRecommendations, setAiRecommendations] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)
            setHasError(false)

            // Try the consolidated dashboard endpoint first
            let dashboardData: any = null
            try {
                const dashboardRes = await apiClient.get<any>('/user/dashboard')
                dashboardData = dashboardRes?.data ?? dashboardRes
            } catch {
                // Consolidated endpoint unavailable, fall back to individual calls
            }

            // If we got dashboard data, use it; otherwise fetch individually
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
                // Fallback: individual service calls, each wrapped safely
                let upcoming: any[] = []
                let allClasses: any[] = []
                let progress: any = null
                let achievementsStats: any = null

                try {
                    const classesService = new UserClassesService()
                    upcoming = await classesService.getUpcomingClasses()
                } catch {
                    upcoming = []
                }

                try {
                    const classesService = new UserClassesService()
                    allClasses = await classesService.getClasses()
                } catch {
                    allClasses = []
                }

                try {
                    const progressService = new UserProgressService()
                    progress = await progressService.getProgress()
                } catch {
                    progress = null
                }

                try {
                    const achievementsService = new UserAchievementsService()
                    achievementsStats = await achievementsService.getStats()
                } catch {
                    achievementsStats = null
                }

                setUpcomingClasses(Array.isArray(upcoming) ? upcoming.slice(0, 5) : [])

                const completedCount = Array.isArray(allClasses)
                    ? allClasses.filter((c: any) => c.status === 'completed').length
                    : 0
                const upcomingCount = Array.isArray(upcoming) ? upcoming.length : 0
                const totalCount = Array.isArray(allClasses) ? allClasses.length : 0

                setStats({
                    upcomingClasses: upcomingCount,
                    completedClasses: completedCount,
                    totalBookings: totalCount,
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
        }
    }, [])

    const loadAiRecommendations = useCallback(async () => {
        setAiLoading(true)
        try {
            const userId = user?.id || ''
            const tenantId = (user as any)?.tenantId || 'proactiv-hq'

            let progress: any = null
            let recommendations: any = null

            try {
                progress = await aiCoachService.predictProgress(userId, tenantId)
            } catch {
                progress = null
            }

            try {
                recommendations = await aiCoachService.getRecommendations({ studentId: userId, skillLevel: 'all' })
            } catch {
                recommendations = null
            }

            const recList = recommendations?.data?.recommendations || recommendations?.recommendations || []
            const assessment = recommendations?.data?.overallAssessment || recommendations?.overallAssessment || ''
            const focus = recommendations?.data?.focusArea || recommendations?.focusArea || ''

            if (recList.length > 0 || assessment) {
                setAiRecommendations({
                    progressPrediction: progress?.data || progress,
                    recommendations: recList,
                    overallAssessment: assessment,
                    focusArea: focus,
                    aiPowered: true,
                })
            } else {
                // No real data -- show fallback tips
                setAiRecommendations({
                    progressPrediction: null,
                    recommendations: FALLBACK_AI_TIPS.map(tip => ({ suggestion: tip })),
                    overallAssessment: 'Keep up the great work! Here are some general fitness tips to help you on your journey.',
                    focusArea: '',
                    aiPowered: false,
                })
            }
        } catch (err) {
            console.error('AI recommendations unavailable:', err)
            // Show fallback tips instead of nothing
            setAiRecommendations({
                progressPrediction: null,
                recommendations: FALLBACK_AI_TIPS.map(tip => ({ suggestion: tip })),
                overallAssessment: 'Keep up the great work! Here are some general fitness tips to help you on your journey.',
                focusArea: '',
                aiPowered: false,
            })
        } finally {
            setAiLoading(false)
        }
    }, [user])

    useRealtimeRefresh(['booking', 'attendance', 'payment', 'program'], loadDashboard)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboard()
        loadAiRecommendations()
    }, [isAuthenticated, router, loadDashboard, loadAiRecommendations])

    const handleRefresh = async () => {
        setRefreshing(true)
        await Promise.all([loadDashboard(), loadAiRecommendations()])
        setRefreshing(false)
    }

    const displayName = user?.name || (user as any)?.firstName || 'User'

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />
    }

    // Error state with retry
    if (hasError) {
        return <ErrorState onRetry={handleRefresh} />
    }

    const statCards = [
        {
            title: 'Upcoming Classes',
            value: stats.upcomingClasses,
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            badge: `${stats.upcomingClasses} scheduled`,
            badgeColor: 'text-blue-600 bg-blue-100',
        },
        {
            title: 'Completed',
            value: stats.completedClasses,
            icon: TrendingUp,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-50 to-green-100',
            badge: 'classes done',
            badgeColor: 'text-green-600 bg-green-100',
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: BookOpen,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            badge: 'all time',
            badgeColor: 'text-purple-600 bg-purple-100',
        },
        {
            title: 'Achievements',
            value: stats.achievements,
            icon: Award,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            badge: `${stats.totalPoints} pts`,
            badgeColor: 'text-orange-600 bg-orange-100',
        },
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
                    <p className="text-gray-600 mt-2">Here&apos;s your fitness overview</p>
                </div>
                <Button id="user-dashboard-refresh-btn" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Colorful Stats Cards - Admin Style Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium ${metric.badgeColor} px-2 py-1 rounded-full`}>
                                        {metric.badge}
                                    </span>
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
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <Button
                                    id={`user-dashboard-action-${action.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                    key={action.label}
                                    variant="outline"
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

            {/* AI Recommendations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Recommendations</CardTitle>
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
                        <div className="space-y-3">
                            {aiRecommendations.overallAssessment && (
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-purple-900">{aiRecommendations.overallAssessment}</p>
                                    </div>
                                </div>
                            )}
                            {aiRecommendations.recommendations?.slice(0, 3).map((rec: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <Target className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{rec.skill || rec.suggestion || rec}</p>
                                        {rec.suggestion && rec.skill && (
                                            <p className="text-xs text-gray-600 mt-0.5">{rec.suggestion}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {aiRecommendations.focusArea && (
                                <p className="text-xs text-purple-600 font-medium">Focus Area: {aiRecommendations.focusArea}</p>
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
                                <BookOpen className="w-4 h-4 mr-2" />
                                Browse Classes
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingClasses.map((cls, index) => (
                                <motion.div
                                    key={cls.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
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
                                        <Badge className={
                                            (cls.status === 'confirmed' || cls.status === 'upcoming')
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }>
                                            {cls.status}
                                        </Badge>
                                        <Button id={`user-dashboard-view-class-${cls.id}-btn`} variant="outline" size="sm" onClick={() => router.push('/user/my-classes')}>
                                            View
                                        </Button>
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
                                            <span className="text-sm text-emerald-600 font-bold">
                                                {progressData.performanceMetrics?.attendance || 0}%
                                            </span>
                                        </div>
                                        <Progress value={progressData.performanceMetrics?.attendance || 0} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Participation</span>
                                            <span className="text-sm text-emerald-600 font-bold">
                                                {progressData.performanceMetrics?.participation || 0}%
                                            </span>
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
