'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    User, Calendar, TrendingUp, Award, BookOpen, RefreshCw, Target, Zap,
    Clock, MapPin, ArrowRight, Bell, Star, Activity, CheckCircle, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserService, { UserDashboardData } from '@/services/modules/user.service'
import UserClassesService from '@/services/modules/user-classes.service'
import UserProgressService from '@/services/modules/user-progress.service'

const userService = new UserService()
const classesService = new UserClassesService()
const progressService = new UserProgressService()

const UserDashboard = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7d' | '30d'>('7d')
    const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [skillsProgress, setSkillsProgress] = useState<any[]>([])
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const loadDashboardData = useCallback(async () => {
        try {
            const [data, classes, progress] = await Promise.all([
                userService.getDashboardData(),
                classesService.getUpcomingClasses().catch(() => []),
                progressService.getSkills().catch(() => [])
            ])

            setDashboardData(data)
            setUpcomingClasses(classes.slice(0, 3))
            setSkillsProgress(progress.slice(0, 4))

            // Mock recent activity
            setRecentActivity([
                { type: 'class', title: 'Completed Beginner Gymnastics', time: '2h ago', icon: CheckCircle, color: 'text-green-600' },
                { type: 'achievement', title: 'Earned "Perfect Attendance" badge', time: '1d ago', icon: Award, color: 'text-yellow-600' },
                { type: 'progress', title: 'Balance skill improved to Level 3', time: '2d ago', icon: TrendingUp, color: 'text-blue-600' }
            ])
        } catch (err: any) {
            if (err?.response?.status === 401) {
                router.push('/login')
                return
            }
            console.error('Error loading dashboard:', err)
            try {
                const profile = await userService.getProfile()
                setDashboardData({
                    profile,
                    stats: profile.stats || {
                        totalClasses: 0,
                        completedClasses: 0,
                        upcomingClasses: 0,
                        totalSpent: 0,
                        currentStreak: 0,
                        achievements: 0
                    },
                    recentActivity: [],
                    upcomingClasses: [],
                    progress: null
                })
            } catch {
                setDashboardData(null)
            }
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboardData().finally(() => setIsLoading(false))
    }, [isAuthenticated, router, loadDashboardData])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboardData()
        setRefreshing(false)
    }

    const stats = dashboardData?.stats || {
        totalClasses: 0,
        completedClasses: 0,
        currentStreak: 0,
        totalSpent: 0,
        achievements: 0,
        upcomingClasses: 0
    }

    const totalProgress = stats.totalClasses > 0
        ? Math.round((stats.completedClasses / stats.totalClasses) * 100)
        : 0

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        <p className="text-gray-600">{user?.name || 'User'}</p>
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg ml-4">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-emerald-700">Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button data-testid="btn-refresh-user-dashboard" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['today', '7d', '30d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setSelectedTimeRange(range as any)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedTimeRange === range
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
                            <BookOpen className="h-5 w-5 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalClasses}</div>
                            <p className="text-xs text-emerald-600 font-medium mt-1">{stats.completedClasses} completed</p>
                            <Progress value={totalProgress} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
                            <Zap className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</div>
                            <p className="text-xs text-blue-600 font-medium mt-1">Keep it up!</p>
                            <Progress value={Math.min(stats.currentStreak * 3, 100)} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
                            <Target className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.upcomingClasses}</div>
                            <p className="text-xs text-purple-600 font-medium mt-1">scheduled classes</p>
                            <Progress value={stats.upcomingClasses > 0 ? 50 : 0} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Achievements</CardTitle>
                            <Award className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.achievements}</div>
                            <p className="text-xs text-yellow-600 font-medium mt-1">badges earned</p>
                            <Progress value={stats.achievements > 0 ? 60 : 0} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Upcoming Classes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <CardTitle>Upcoming Classes</CardTitle>
                            <Badge>{upcomingClasses.length} classes</Badge>
                        </div>
                        <Button data-testid="btn-router-user-dashboard" variant="outline" size="sm" onClick={() => router.push('/user/my-classes')}>
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {upcomingClasses.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No upcoming classes</p>
                            <Button className="mt-4" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Book a Class
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingClasses.map((cls, index) => (
                                <motion.div
                                    key={cls.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-lg hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => router.push('/user/my-classes')}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {cls.schedule?.date?.split('-')[2] || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{cls.schedule?.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{cls.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-800">{cls.status}</Badge>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Skills Progress & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Progress */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <CardTitle>Skills Progress</CardTitle>
                            </div>
                            <Button data-testid="btn-router-user-dashboard" variant="ghost" size="sm" onClick={() => router.push('/user/progress')}>
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {skillsProgress.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No skills data available</p>
                            ) : (
                                skillsProgress.map((skill: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{skill.skillName || skill.name}</span>
                                                <Badge variant="outline" className="text-xs">Level {skill.level || 1}</Badge>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">{skill.progress || 0}%</span>
                                        </div>
                                        <Progress value={skill.progress || 0} className="h-2" />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-600" />
                            <CardTitle>Recent Activity</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => {
                                const Icon = activity.icon
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${activity.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                            variant="outline"
                            onClick={() => router.push('/user/my-classes')}
                        >
                            <Calendar className="w-6 h-6" />
                            <span>My Classes</span>
                        </Button>
                        <Button
                            className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                            variant="outline"
                            onClick={() => router.push('/user/progress')}
                        >
                            <TrendingUp className="w-6 h-6" />
                            <span>Progress</span>
                        </Button>
                        <Button
                            className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                            variant="outline"
                            onClick={() => router.push('/user/achievements')}
                        >
                            <Award className="w-6 h-6" />
                            <span>Achievements</span>
                        </Button>
                        <Button
                            className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                            variant="outline"
                            onClick={() => router.push('/user/profile')}
                        >
                            <User className="w-6 h-6" />
                            <span>Profile</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default UserDashboard
