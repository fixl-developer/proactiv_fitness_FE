'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Users, Calendar, TrendingUp, Award, Clock, AlertCircle,
    CheckCircle, BarChart3, Target, Zap, BookOpen, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'
import { attendanceService } from '@/services/modules/attendance.service'
import programService from '@/services/modules/program.service'
import { schedulingService } from '@/services/modules/scheduling.service'
import { analyticsService } from '@/services/modules/analytics.service'

const CoachDashboard = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // State for data
    const [todayClasses, setTodayClasses] = useState(0)
    const [totalStudents, setTotalStudents] = useState(0)
    const [attendanceRate, setAttendanceRate] = useState(0)
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
    const [recentAttendance, setRecentAttendance] = useState<any[]>([])
    const [programs, setPrograms] = useState<any[]>([])
    const [analytics, setAnalytics] = useState<any>(null)

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        // Check if user is coach
        if (!rbacManager.isCoach() && !rbacManager.isSuperAdmin()) {
            router.push('/parent/dashboard')
            return
        }

        loadDashboardData()
    }, [isAuthenticated, router])

    const loadDashboardData = async () => {
        setIsLoading(true)

        // Run all API calls independently so one failure doesn't block others
        const [schedulesResult, programsResult, attendanceResult, analyticsResult] = await Promise.allSettled([
            schedulingService.getSchedules(1, 10, {
                coachId: user?.id,
                date: new Date().toISOString().split('T')[0]
            }),
            programService.getPrograms({ limit: 5 }),
            attendanceService.getAttendance({ limit: 10 }),
            analyticsService.getDashboardMetrics()
        ])

        setTodayClasses(
            schedulesResult.status === 'fulfilled'
                ? schedulesResult.value?.data?.schedules?.length ?? 0
                : 0
        )
        setPrograms(
            programsResult.status === 'fulfilled'
                ? programsResult.value?.data?.programs ?? []
                : []
        )
        setRecentAttendance(
            attendanceResult.status === 'fulfilled'
                ? attendanceResult.value?.data?.records ?? []
                : []
        )
        setAnalytics(
            analyticsResult.status === 'fulfilled'
                ? analyticsResult.value?.data ?? null
                : null
        )

        // Set mock data for demo
        setTotalStudents(45)
        setAttendanceRate(92)
        setIsLoading(false)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboardData()
        setRefreshing(false)
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
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
                    <h1 className={responsiveClasses.headerTitle}>Coach Dashboard</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Welcome back! Here's your coaching overview
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="w-full sm:w-auto"
                >
                    <Zap className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    {
                        title: 'Today\'s Classes',
                        value: todayClasses,
                        icon: Calendar,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Total Students',
                        value: totalStudents,
                        icon: Users,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Attendance Rate',
                        value: `${attendanceRate}%`,
                        icon: CheckCircle,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        title: 'Active Programs',
                        value: programs.length,
                        icon: BookOpen,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    }
                ].map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card className="relative overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                                    {metric.title}
                                </CardTitle>
                                <metric.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {metric.value}
                                </div>
                                <div className={`text-xs sm:text-sm font-medium mt-2 ${metric.color}`}>
                                    {metric.title === 'Attendance Rate' ? 'Excellent' : 'Active'}
                                </div>
                                <div className={`mt-3 h-1 sm:h-2 rounded-full ${metric.bgColor}`}></div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Today's Schedule</CardTitle>
                                </div>
                                <Badge variant="outline">
                                    {todayClasses} Classes
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { time: '09:00 AM', class: 'Beginner Gymnastics', students: 12, location: 'Studio A' },
                                    { time: '10:30 AM', class: 'Intermediate Tumbling', students: 15, location: 'Studio B' },
                                    { time: '02:00 PM', class: 'Advanced Acrobatics', students: 8, location: 'Studio A' },
                                    { time: '03:30 PM', class: 'Kids Fitness', students: 20, location: 'Studio C' }
                                ].slice(0, todayClasses || 4).map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{item.class}</div>
                                            <div className="text-sm text-gray-600">{item.time} • {item.location}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{item.students}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <Button className="w-full mt-4" variant="outline">
                                View Full Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { icon: CheckCircle, label: 'Mark Attendance', href: '/coach/attendance' },
                                { icon: Users, label: 'View Students', href: '/coach/students' },
                                { icon: MessageSquare, label: 'Send Feedback', href: '/coach/feedback' },
                                { icon: BarChart3, label: 'View Reports', href: '/coach/reports' },
                                { icon: Clock, label: 'Set Availability', href: '/coach/availability' },
                                { icon: Target, label: 'View Goals', href: '/coach/profile' }
                            ].map((action, index) => (
                                <Button
                                    key={index}
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => router.push(action.href)}
                                >
                                    <action.icon className="w-4 h-4 mr-2" />
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Programs & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Programs */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <CardTitle>Active Programs</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {programs.slice(0, 3).map((program, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{program.name}</h4>
                                        <Badge variant="outline">{program.level}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>{program.currentEnrollment}/{program.capacity} Students</span>
                                        <span>{program.duration} weeks</span>
                                    </div>
                                    <Progress value={(program.currentEnrollment / program.capacity) * 100} className="h-2" />
                                </motion.div>
                            ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            View All Programs
                        </Button>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <CardTitle>Performance Metrics</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Student Satisfaction', value: 94, color: 'bg-green-500' },
                                { label: 'Class Completion Rate', value: 98, color: 'bg-blue-500' },
                                { label: 'Skill Improvement', value: 87, color: 'bg-purple-500' },
                                { label: 'Attendance Consistency', value: 92, color: 'bg-orange-500' }
                            ].map((metric, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                                    </div>
                                    <Progress value={metric.value} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CoachDashboard
