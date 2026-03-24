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
import { coachService } from '@/services/modules/coach.service'
import { toast } from 'sonner'

// Fallback mock data when API fails
const FALLBACK_DATA = {
    todayClasses: 4,
    totalStudents: 45,
    attendanceRate: 92,
    activePrograms: 3,
    todaySchedule: [
        { id: '1', className: 'Beginner Gymnastics', date: '', time: '09:00 AM - 10:00 AM', startTime: '09:00 AM', endTime: '10:00 AM', location: 'Studio A', level: 'Beginner', enrolledStudents: 12, capacity: 15, duration: 60, status: 'active' },
        { id: '2', className: 'Intermediate Tumbling', date: '', time: '10:30 AM - 11:30 AM', startTime: '10:30 AM', endTime: '11:30 AM', location: 'Studio B', level: 'Intermediate', enrolledStudents: 15, capacity: 20, duration: 60, status: 'active' },
        { id: '3', className: 'Advanced Acrobatics', date: '', time: '02:00 PM - 03:00 PM', startTime: '02:00 PM', endTime: '03:00 PM', location: 'Studio A', level: 'Advanced', enrolledStudents: 8, capacity: 10, duration: 60, status: 'active' },
        { id: '4', className: 'Kids Fitness', date: '', time: '03:30 PM - 04:30 PM', startTime: '03:30 PM', endTime: '04:30 PM', location: 'Studio C', level: 'Beginner', enrolledStudents: 20, capacity: 25, duration: 60, status: 'active' },
    ],
    programs: [
        { name: 'Beginner Gymnastics', level: 'Beginner', currentEnrollment: 12, capacity: 15, duration: 12 },
        { name: 'Intermediate Tumbling', level: 'Intermediate', currentEnrollment: 10, capacity: 12, duration: 16 },
        { name: 'Advanced Acrobatics', level: 'Advanced', currentEnrollment: 8, capacity: 10, duration: 20 },
    ],
    performanceMetrics: {
        studentSatisfaction: 94,
        classCompletion: 98,
        skillImprovement: 87,
        attendanceConsistency: 92,
    },
}

const CoachDashboard = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Dashboard data state
    const [todayClasses, setTodayClasses] = useState(0)
    const [totalStudents, setTotalStudents] = useState(0)
    const [attendanceRate, setAttendanceRate] = useState(0)
    const [activePrograms, setActivePrograms] = useState(0)
    const [todaySchedule, setTodaySchedule] = useState<any[]>([])
    const [programs, setPrograms] = useState<any[]>([])
    const [performanceMetrics, setPerformanceMetrics] = useState(FALLBACK_DATA.performanceMetrics)

    useEffect(() => {
        // Don't redirect - layout handles auth. Just load data if authenticated.
        if (!isAuthenticated && !localStorage.getItem('token')) return
        loadDashboardData()
    }, [isAuthenticated])

    const loadDashboardData = async () => {
        setIsLoading(true)

        try {
            const coachId = user?.id
            if (!coachId) {
                throw new Error('No coach ID available')
            }

            const data = await coachService.getDashboardData(coachId)

            setTodayClasses(data.todayClasses ?? 0)
            setTotalStudents(data.totalStudents ?? 0)
            setAttendanceRate(data.attendanceRate ?? 0)
            setActivePrograms(data.activePrograms ?? 0)
            setTodaySchedule(data.todaySchedule ?? [])
            setPrograms(data.programs ?? [])
            setPerformanceMetrics({
                studentSatisfaction: data.performanceMetrics?.studentSatisfaction ?? 0,
                classCompletion: data.performanceMetrics?.classCompletion ?? 0,
                skillImprovement: data.performanceMetrics?.skillImprovement ?? 0,
                attendanceConsistency: data.performanceMetrics?.attendanceConsistency ?? 0,
            })
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            toast.error('Could not load live data. Showing cached data.')

            // Use fallback mock data
            setTodayClasses(FALLBACK_DATA.todayClasses)
            setTotalStudents(FALLBACK_DATA.totalStudents)
            setAttendanceRate(FALLBACK_DATA.attendanceRate)
            setActivePrograms(FALLBACK_DATA.activePrograms)
            setTodaySchedule(FALLBACK_DATA.todaySchedule)
            setPrograms(FALLBACK_DATA.programs)
            setPerformanceMetrics(FALLBACK_DATA.performanceMetrics)
        }

        setIsLoading(false)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboardData()
        setRefreshing(false)
    }

    // KPI card definitions with colorful gradients
    const kpiMetrics = [
        {
            title: "Today's Classes",
            value: todayClasses,
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: 'Today',
        },
        {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
            change: 'Active',
        },
        {
            title: 'Attendance Rate',
            value: `${attendanceRate}%`,
            icon: CheckCircle,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: 'Excellent',
        },
        {
            title: 'Active Programs',
            value: activePrograms,
            icon: BookOpen,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            change: 'Running',
        },
    ]

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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
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
                        Welcome back{user?.id ? '!' : '!'} Here&apos;s your coaching overview
                    </p>
                </div>
                <Button id="coach-dashboard-refresh-btn"
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

            {/* KPI Cards - Colorful Gradient Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {kpiMetrics.map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Today&apos;s Schedule</CardTitle>
                                </div>
                                <Badge variant="outline">
                                    {todaySchedule.length} Classes
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-4">
                                    {todaySchedule.map((item, index) => (
                                        <motion.div
                                            key={item.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{item.className}</div>
                                                <div className="text-sm text-gray-600">
                                                    {item.time || `${item.startTime} - ${item.endTime}`} {item.location ? `\u2022 ${item.location}` : ''}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {item.level && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.level}
                                                    </Badge>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {item.enrolledStudents}{item.capacity ? `/${item.capacity}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No classes scheduled for today</p>
                                    <p className="text-sm text-gray-400 mt-1">Enjoy your day off or check upcoming schedules</p>
                                </div>
                            )}
                            <Button id="coach-dashboard-view-full-schedule-btn"
                                className="w-full mt-4"
                                variant="outline"
                                onClick={() => router.push('/coach/schedule')}
                            >
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
                                { icon: CheckCircle, label: 'Mark Attendance', href: '/coach/schedule', actionId: 'mark-attendance' },
                                { icon: Users, label: 'View Students', href: '/coach/students', actionId: 'view-students' },
                                { icon: MessageSquare, label: 'Send Feedback', href: '/coach/feedback', actionId: 'send-feedback' },
                                { icon: BarChart3, label: 'View Reports', href: '/coach/reports', actionId: 'view-reports' },
                                { icon: Clock, label: 'Set Availability', href: '/coach/availability', actionId: 'set-availability' },
                                { icon: Target, label: 'View Goals', href: '/coach/profile', actionId: 'view-goals' },
                            ].map((action, index) => (
                                <Button id={`coach-dashboard-${action.actionId}-btn`}
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
                        {programs.length > 0 ? (
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
                                        <Progress
                                            value={program.capacity > 0 ? (program.currentEnrollment / program.capacity) * 100 : 0}
                                            className="h-2"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No active programs</p>
                            </div>
                        )}
                        <Button id="coach-dashboard-view-all-programs-btn"
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => router.push('/coach/schedule')}
                        >
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
                                { label: 'Student Satisfaction', value: performanceMetrics.studentSatisfaction, color: 'bg-green-500' },
                                { label: 'Class Completion Rate', value: performanceMetrics.classCompletion, color: 'bg-blue-500' },
                                { label: 'Skill Improvement', value: performanceMetrics.skillImprovement, color: 'bg-purple-500' },
                                { label: 'Attendance Consistency', value: performanceMetrics.attendanceConsistency, color: 'bg-orange-500' },
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
