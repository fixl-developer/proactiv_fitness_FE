'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, Calendar, Users, BarChart3,
    MessageSquare, User, Clock, Target,
    ArrowRight, CheckCircle, Star, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService } from '@/services/modules/coach.service'

const CoachHomePage = () => {
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        todayClasses: 0,
        totalStudents: 0,
        weeklyHours: 0,
        rating: 0
    })
    const [highlights, setHighlights] = useState({
        classesCompleted: 0,
        totalClasses: 0,
        pendingAssessments: 0,
        studentsLeveledUp: 0
    })

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) {
            window.location.href = '/login'
            return
        }
        loadHomeData()
    }, [isAuthenticated])

    const loadHomeData = async () => {
        try {
            const coachId = user?.id || ''
            if (!coachId) {
                setIsLoading(false)
                return
            }

            const [dashboardData, profileData] = await Promise.allSettled([
                coachService.getDashboardData(coachId),
                coachService.getProfile(coachId)
            ])

            const dashboard = dashboardData.status === 'fulfilled' ? dashboardData.value : null
            const profile = profileData.status === 'fulfilled' ? profileData.value : null

            setStats({
                todayClasses: dashboard?.todayClasses || 0,
                totalStudents: dashboard?.totalStudents || profile?.totalStudents || 0,
                weeklyHours: profile?.totalClasses ? Math.round(profile.totalClasses * 1.5) : 0,
                rating: profile?.rating || 0
            })

            // Calculate highlights from dashboard data
            const todaySchedule = dashboard?.todaySchedule || []
            const now = new Date()
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()
            const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

            let completed = 0
            todaySchedule.forEach((cls: any) => {
                const endTime = cls.endTime || ''
                if (endTime && endTime <= currentTimeStr) {
                    completed++
                }
            })

            setHighlights({
                classesCompleted: completed,
                totalClasses: todaySchedule.length,
                pendingAssessments: dashboard?.activePrograms || 0,
                studentsLeveledUp: 0
            })
        } catch (error) {
            console.error('Error loading home data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Coach Navigation Items
    const coachSections = [
        {
            title: 'Dashboard',
            description: 'Overview of your coaching activities',
            icon: LayoutDashboard,
            href: '/coach/dashboard',
            color: 'bg-blue-500',
            stats: 'Today\'s overview',
            priority: 'high'
        },
        {
            title: 'Schedule',
            description: 'View and manage your class schedule',
            icon: Calendar,
            href: '/coach/schedule',
            color: 'bg-green-500',
            stats: stats.todayClasses > 0 ? `${stats.todayClasses} classes today` : 'No classes today',
            priority: 'high'
        },
        {
            title: 'Students',
            description: 'Manage your student roster',
            icon: Users,
            href: '/coach/students',
            color: 'bg-purple-500',
            stats: stats.totalStudents > 0 ? `${stats.totalStudents} students` : 'View students',
            priority: 'medium'
        },
        {
            title: 'Availability',
            description: 'Set your available hours',
            icon: Clock,
            href: '/coach/availability',
            color: 'bg-orange-500',
            stats: 'Manage schedule',
            priority: 'medium'
        },
        {
            title: 'Feedback',
            description: 'Student progress and feedback',
            icon: MessageSquare,
            href: '/coach/feedback',
            color: 'bg-red-500',
            stats: 'Send feedback',
            priority: 'medium'
        },
        {
            title: 'Reports',
            description: 'Performance and attendance reports',
            icon: BarChart3,
            href: '/coach/reports',
            color: 'bg-indigo-500',
            stats: 'View reports',
            priority: 'low'
        },
        {
            title: 'Profile',
            description: 'Manage your coach profile',
            icon: User,
            href: '/coach/profile',
            color: 'bg-pink-500',
            stats: stats.rating > 0 ? `${stats.rating} rating` : 'View profile',
            priority: 'low'
        }
    ]

    // Quick Stats
    const quickStats = [
        {
            label: 'Today\'s Classes',
            value: stats.todayClasses.toString(),
            icon: Calendar,
            color: 'text-blue-600'
        },
        {
            label: 'Active Students',
            value: stats.totalStudents.toString(),
            icon: Users,
            color: 'text-green-600'
        },
        {
            label: 'Weekly Hours',
            value: stats.weeklyHours > 0 ? `${stats.weeklyHours} hrs` : '—',
            icon: Clock,
            color: 'text-purple-600'
        },
        {
            label: 'Rating',
            value: stats.rating > 0 ? stats.rating.toFixed(1) : '—',
            icon: Star,
            color: 'text-yellow-600'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Coach Portal</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Welcome back! Manage your classes and students
                    </p>
                </div>
                <Button id="coach-goto-dashboard-btn" onClick={() => window.location.href = '/coach/dashboard'}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Go to Dashboard
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-xs text-gray-600">{stat.label}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Coach Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {coachSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card
                            id={`coach-section-${section.title.toLowerCase()}-card`}
                            className={`hover:shadow-lg transition-all cursor-pointer group ${section.priority === 'high' ? 'ring-2 ring-blue-200' : ''
                                }`}
                            onClick={() => window.location.href = section.href}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${section.color} text-white group-hover:scale-110 transition-transform`}>
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                                {section.title}
                                            </CardTitle>
                                            {section.priority === 'high' && (
                                                <Badge variant="default" className="text-xs">
                                                    Priority
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">
                                        {section.stats}
                                    </span>
                                    <Button id={`coach-section-${section.title.toLowerCase()}-open-btn`} variant="ghost" size="sm" className="group-hover:bg-blue-50">
                                        Open <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Today's Highlights */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Today&apos;s Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                                <div className="font-semibold text-gray-900">Classes Completed</div>
                                <div className="text-sm text-gray-600">
                                    {highlights.classesCompleted} of {highlights.totalClasses} classes done
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <Target className="w-6 h-6 text-blue-600" />
                            <div>
                                <div className="font-semibold text-gray-900">Active Programs</div>
                                <div className="text-sm text-gray-600">
                                    {highlights.pendingAssessments} programs running
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-600" />
                            <div>
                                <div className="font-semibold text-gray-900">Students</div>
                                <div className="text-sm text-gray-600">
                                    {stats.totalStudents} active students
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachHomePage
