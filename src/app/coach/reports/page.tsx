'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, Users, Calendar, Star, Award,
    Download, Filter, RefreshCw, Eye, FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const CoachReportsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState('month')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800)
    }, [])

    const performanceMetrics = {
        totalClasses: 48,
        totalStudents: 89,
        averageAttendance: 87.5,
        averageRating: 4.8,
        totalHours: 72,
        studentRetention: 92,
        parentSatisfaction: 4.9,
        skillProgressions: 156
    }

    const monthlyData = [
        { month: 'Jan', classes: 48, students: 89, attendance: 87.5, rating: 4.8 },
        { month: 'Dec', classes: 45, students: 85, attendance: 85.2, rating: 4.7 },
        { month: 'Nov', classes: 42, students: 82, attendance: 88.1, rating: 4.6 },
        { month: 'Oct', classes: 40, students: 78, attendance: 86.3, rating: 4.5 },
        { month: 'Sep', classes: 38, students: 75, attendance: 84.7, rating: 4.4 },
        { month: 'Aug', classes: 35, students: 72, attendance: 83.2, rating: 4.3 }
    ]

    const classReports = [
        {
            class: 'GYMTOTS (3-4 years)',
            totalSessions: 16,
            avgAttendance: 6.2,
            capacity: 8,
            attendanceRate: 78,
            avgRating: 4.9,
            skillsAchieved: 24,
            parentFeedback: 'Excellent'
        },
        {
            class: 'Beginner 1 (5-7 years)',
            totalSessions: 12,
            avgAttendance: 7.1,
            capacity: 8,
            attendanceRate: 89,
            avgRating: 4.7,
            skillsAchieved: 36,
            parentFeedback: 'Very Good'
        },
        {
            class: 'Intermediate (8-10 years)',
            totalSessions: 14,
            avgAttendance: 6.8,
            capacity: 8,
            attendanceRate: 85,
            avgRating: 4.8,
            skillsAchieved: 42,
            parentFeedback: 'Excellent'
        },
        {
            class: 'Advanced (11+ years)',
            totalSessions: 6,
            avgAttendance: 4.5,
            capacity: 6,
            attendanceRate: 75,
            avgRating: 4.6,
            skillsAchieved: 28,
            parentFeedback: 'Good'
        }
    ]

    const studentProgress = [
        {
            student: 'Emma Wong',
            program: 'GYMTOTS',
            skillsLearned: 8,
            attendanceRate: 86,
            progressRating: 'Excellent',
            parentRating: 5.0
        },
        {
            student: 'Lucas Chen',
            program: 'Beginner 1',
            skillsLearned: 12,
            attendanceRate: 88,
            progressRating: 'Very Good',
            parentRating: 4.8
        },
        {
            student: 'Sophia Li',
            program: 'Intermediate',
            skillsLearned: 15,
            attendanceRate: 94,
            progressRating: 'Outstanding',
            parentRating: 4.9
        },
        {
            student: 'Ryan Kim',
            program: 'Beginner 1',
            skillsLearned: 6,
            attendanceRate: 80,
            progressRating: 'Good',
            parentRating: 4.7
        },
        {
            student: 'Mia Zhang',
            program: 'Intermediate',
            skillsLearned: 14,
            attendanceRate: 90,
            progressRating: 'Excellent',
            parentRating: 4.9
        }
    ]

    const getProgressColor = (rating: string) => {
        const colors = {
            'Outstanding': 'text-green-600 bg-green-50',
            'Excellent': 'text-blue-600 bg-blue-50',
            'Very Good': 'text-purple-600 bg-purple-50',
            'Good': 'text-yellow-600 bg-yellow-50',
            'Needs Improvement': 'text-red-600 bg-red-50'
        }
        return colors[rating as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="coach" userName="Sarah Chen">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="coach" userName="Sarah Chen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Reports & Analytics</h1>
                        <p className="text-gray-600">Track your teaching performance and student progress</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            {['week', 'month', 'quarter'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Quarter'}
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: 'Total Classes',
                            value: performanceMetrics.totalClasses,
                            change: '+8 vs last month',
                            icon: Calendar,
                            color: 'text-blue-600',
                            progress: 85
                        },
                        {
                            title: 'Total Students',
                            value: performanceMetrics.totalStudents,
                            change: '+12 vs last month',
                            icon: Users,
                            color: 'text-green-600',
                            progress: 78
                        },
                        {
                            title: 'Avg Attendance',
                            value: `${performanceMetrics.averageAttendance}%`,
                            change: '+2.3% vs last month',
                            icon: TrendingUp,
                            color: 'text-purple-600',
                            progress: performanceMetrics.averageAttendance
                        },
                        {
                            title: 'Avg Rating',
                            value: performanceMetrics.averageRating,
                            change: '+0.1 vs last month',
                            icon: Star,
                            color: 'text-yellow-600',
                            progress: (performanceMetrics.averageRating / 5) * 100
                        }
                    ].map((metric, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                                    <div className="flex items-center mt-1">
                                        <TrendingUp className={`w-4 h-4 ${metric.color} mr-1`} />
                                        <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                                    </div>
                                    <Progress value={metric.progress} className="mt-3 h-2" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Class Performance Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle>Class Performance Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {classReports.map((classReport, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900">{classReport.class}</h4>
                                        <Badge className={getProgressColor(classReport.parentFeedback)}>
                                            {classReport.parentFeedback}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Sessions</p>
                                            <p className="font-semibold">{classReport.totalSessions}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Avg Attendance</p>
                                            <p className="font-semibold">{classReport.avgAttendance}/{classReport.capacity}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Attendance Rate</p>
                                            <p className="font-semibold">{classReport.attendanceRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Skills Achieved</p>
                                            <p className="font-semibold">{classReport.skillsAchieved}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <Progress value={classReport.attendanceRate} className="h-2" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Student Progress Tracking */}
                <Card>
                    <CardHeader>
                        <CardTitle>Individual Student Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {studentProgress.map((student, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {student.student.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{student.student}</h4>
                                            <p className="text-sm text-gray-600">{student.program}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Skills</p>
                                            <p className="font-semibold">{student.skillsLearned}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Attendance</p>
                                            <p className="font-semibold">{student.attendanceRate}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Rating</p>
                                            <p className="font-semibold">{student.parentRating}</p>
                                        </div>
                                        <Badge className={getProgressColor(student.progressRating)}>
                                            {student.progressRating}
                                        </Badge>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {monthlyData.map((month, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="font-medium text-gray-900">{month.month} 2024</div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <p className="text-gray-600">Classes</p>
                                            <p className="font-semibold">{month.classes}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-600">Students</p>
                                            <p className="font-semibold">{month.students}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-600">Attendance</p>
                                            <p className="font-semibold">{month.attendance}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-600">Rating</p>
                                            <p className="font-semibold">{month.rating}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default CoachReportsPage