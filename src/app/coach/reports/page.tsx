'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    BarChart3, Download, Filter, TrendingUp, Users, Calendar,
    Award, Target, AlertCircle, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'

const CoachReportsPage = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [reportType, setReportType] = useState('overview')
    const [dateRange, setDateRange] = useState('month')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (!rbacManager.hasPermission('coach_reports')) {
            router.push('/parent/dashboard')
            return
        }

        loadReports()
    }, [isAuthenticated, router])

    const loadReports = async () => {
        try {
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading reports:', error)
            setIsLoading(false)
        }
    }

    const handleDownload = (format: string) => {
        console.log(`Downloading report as ${format}`)
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Reports</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        View and analyze coaching performance reports
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="overview">Overview</option>
                                <option value="students">Student Progress</option>
                                <option value="attendance">Attendance</option>
                                <option value="performance">Performance</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button variant="outline" className="flex-1 sm:flex-none">
                                <Filter className="w-4 h-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overview Report */}
            {reportType === 'overview' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Classes', value: '48', icon: Calendar, color: 'text-blue-600' },
                            { label: 'Total Students', value: '45', icon: Users, color: 'text-green-600' },
                            { label: 'Avg Attendance', value: '92%', icon: CheckCircle, color: 'text-purple-600' },
                            { label: 'Avg Rating', value: '4.7/5', icon: Award, color: 'text-orange-600' }
                        ].map((metric, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">{metric.label}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                                            </div>
                                            <metric.icon className={`w-8 h-8 ${metric.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: 'Beginner', count: 18, percentage: 37.5 },
                                    { name: 'Intermediate', count: 20, percentage: 41.7 },
                                    { name: 'Advanced', count: 10, percentage: 20.8 }
                                ].map((level, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">{level.name}</span>
                                            <span className="text-sm font-bold text-gray-900">{level.count} classes</span>
                                        </div>
                                        <Progress value={level.percentage} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Student Progress Report */}
            {reportType === 'students' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Student Progress Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Aarav Patel', progress: 75, trend: 'up' },
                                { name: 'Priya Singh', progress: 85, trend: 'up' },
                                { name: 'Rohan Kumar', progress: 92, trend: 'up' },
                                { name: 'Ananya Sharma', progress: 65, trend: 'stable' },
                                { name: 'Vikram Desai', progress: 78, trend: 'up' }
                            ].map((student, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">{student.progress}%</span>
                                            <TrendingUp className={`w-4 h-4 ${student.trend === 'up' ? 'text-green-600' : 'text-gray-400'
                                                }`} />
                                        </div>
                                    </div>
                                    <Progress value={student.progress} className="h-2" />
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Attendance Report */}
            {reportType === 'attendance' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { day: 'Monday', attended: 42, total: 45, percentage: 93 },
                                { day: 'Tuesday', attended: 41, total: 45, percentage: 91 },
                                { day: 'Wednesday', attended: 44, total: 45, percentage: 98 },
                                { day: 'Thursday', attended: 40, total: 45, percentage: 89 },
                                { day: 'Friday', attended: 43, total: 45, percentage: 96 },
                                { day: 'Saturday', attended: 38, total: 40, percentage: 95 }
                            ].map((day, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{day.day}</h4>
                                        <span className="text-sm font-bold text-gray-900">
                                            {day.attended}/{day.total} ({day.percentage}%)
                                        </span>
                                    </div>
                                    <Progress value={day.percentage} className="h-2" />
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Performance Report */}
            {reportType === 'performance' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { metric: 'Student Satisfaction', value: 94 },
                                { metric: 'Class Completion Rate', value: 98 },
                                { metric: 'Skill Improvement', value: 87 },
                                { metric: 'Attendance Consistency', value: 92 }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                    <Progress value={item.value} className="h-3" />
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Download Options */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Export Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload('pdf')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload('excel')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download as Excel
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload('csv')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download as CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachReportsPage
