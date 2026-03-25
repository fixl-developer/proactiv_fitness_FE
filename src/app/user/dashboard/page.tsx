'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import { Calendar, Clock, TrendingUp, Award, BookOpen, CreditCard, ArrowRight, RefreshCw, Target, Flame } from 'lucide-react'
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

export default function UserDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState({
        upcomingClasses: 0,
        completedClasses: 0,
        totalBookings: 0,
        achievements: 0,
        currentStreak: 0,
        totalPoints: 0
    })
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
    const [progressData, setProgressData] = useState<any>(null)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)

            const classesService = new UserClassesService()
            const progressService = new UserProgressService()
            const achievementsService = new UserAchievementsService()

            // Fetch all data in parallel from backend
            const [dashboardRes, upcomingRes, allClassesRes, progressRes, achievementsStatsRes] = await Promise.allSettled([
                apiClient.get<any>('/user/dashboard').catch(() => null),
                classesService.getUpcomingClasses().catch(() => []),
                classesService.getClasses().catch(() => []),
                progressService.getProgress().catch(() => null),
                achievementsService.getStats().catch(() => null)
            ])

            // Dashboard stats from API
            const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value : null
            const upcoming = upcomingRes.status === 'fulfilled' ? upcomingRes.value : []
            const allClasses = allClassesRes.status === 'fulfilled' ? allClassesRes.value : []
            const progress = progressRes.status === 'fulfilled' ? progressRes.value : null
            const achievementsStats = achievementsStatsRes.status === 'fulfilled' ? achievementsStatsRes.value : null

            // Set upcoming classes
            setUpcomingClasses(Array.isArray(upcoming) ? upcoming.slice(0, 5) : [])

            // Calculate stats from real data
            const completedCount = Array.isArray(allClasses) ? allClasses.filter((c: any) => c.status === 'completed').length : 0
            const upcomingCount = Array.isArray(upcoming) ? upcoming.length : 0
            const totalCount = Array.isArray(allClasses) ? allClasses.length : 0

            setStats({
                upcomingClasses: dashboard?.data?.stats?.upcomingClasses ?? upcomingCount,
                completedClasses: dashboard?.data?.stats?.completedClasses ?? completedCount,
                totalBookings: dashboard?.data?.stats?.totalBookings ?? totalCount,
                achievements: achievementsStats?.unlockedAchievements ?? achievementsStats?.totalPoints ?? 0,
                currentStreak: progress?.currentStreak ?? 0,
                totalPoints: achievementsStats?.totalPoints ?? 0
            })

            // Set progress data
            setProgressData(progress)
        } catch (err) {
            console.error('Error loading dashboard:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useRealtimeRefresh(['booking', 'attendance', 'payment', 'program'], loadDashboard)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboard()
    }, [isAuthenticated, router, loadDashboard])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboard()
        setRefreshing(false)
    }

    const displayName = user?.name || (user as any)?.firstName || 'User'

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    const statCards = [
        {
            title: 'Upcoming Classes',
            value: stats.upcomingClasses,
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: `${stats.upcomingClasses} scheduled`
        },
        {
            title: 'Completed',
            value: stats.completedClasses,
            icon: TrendingUp,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
            change: 'classes done'
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: BookOpen,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: 'all time'
        },
        {
            title: 'Achievements',
            value: stats.achievements,
            icon: Award,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-100',
            change: `${stats.totalPoints} pts`
        }
    ]

    const quickActions = [
        { label: 'Book a Class', href: '/user/my-classes', icon: BookOpen },
        { label: 'View Bookings', href: '/user/bookings', icon: Calendar },
        { label: 'My Progress', href: '/user/progress', icon: TrendingUp },
        { label: 'Payments', href: '/user/payments', icon: CreditCard }
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

            {/* Colorful Stats Cards - Admin Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-full">
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
                                                {cls.coach} • {cls.schedule?.time || cls.time} • {cls.location}
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
