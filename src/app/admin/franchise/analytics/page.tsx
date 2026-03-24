'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, Users, TrendingUp, Calendar,
    LineChart as LineChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { FranchiseOwnerService, FranchiseAnalytics } from '@/services/franchiseOwnerService'

const defaultAnalytics: FranchiseAnalytics = {
    students: {
        total: 0,
        growth: [],
        byProgram: [],
    },
    classes: {
        total: 0,
        utilization: [],
        performance: [],
    },
    enrollment: {
        funnel: [],
    },
}

interface DashboardOverview {
    totalStudents?: number
    avgSatisfaction?: number
    classUtilization?: number
    totalBookings?: number
    studentsChange?: string
    satisfactionChange?: string
    utilizationChange?: string
    bookingsChange?: string
}

export default function FranchiseAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('30d')
    const [analytics, setAnalytics] = useState<FranchiseAnalytics>(defaultAnalytics)
    const [overview, setOverview] = useState<DashboardOverview>({})

    const fetchData = useCallback(async (range: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const [analyticsResponse, overviewResponse] = await Promise.all([
                FranchiseOwnerService.getAnalytics(range).catch(() => ({ data: defaultAnalytics })),
                FranchiseOwnerService.getDashboardOverview().catch(() => ({ data: {} })),
            ])
            // Backend returns { success, data: { ... } } - unwrap properly
            const analyticsRaw = (analyticsResponse as any)?.data ?? analyticsResponse ?? {}
            const overviewRaw = (overviewResponse as any)?.data ?? overviewResponse ?? {}

            // Map analytics data to FranchiseAnalytics structure
            const mappedAnalytics: FranchiseAnalytics = {
                students: analyticsRaw.students ?? defaultAnalytics.students,
                classes: analyticsRaw.classes ?? defaultAnalytics.classes,
                enrollment: analyticsRaw.enrollment ?? defaultAnalytics.enrollment,
            }
            setAnalytics(mappedAnalytics)

            // Map overview data
            setOverview({
                totalStudents: analyticsRaw.totalStudents ?? overviewRaw.totalStudents,
                avgSatisfaction: analyticsRaw.avgSatisfaction ?? overviewRaw.customerSatisfaction,
                classUtilization: analyticsRaw.classUtilization,
                totalBookings: analyticsRaw.totalBookings,
                studentsChange: analyticsRaw.studentsChange,
                satisfactionChange: analyticsRaw.satisfactionChange,
                utilizationChange: analyticsRaw.utilizationChange,
                bookingsChange: analyticsRaw.bookingsChange,
            })
        } catch (err: any) {
            console.error('Failed to load analytics:', err)
            setError(err.message || 'Failed to load analytics data')
            setAnalytics(defaultAnalytics)
            setOverview({})
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(timeRange)
    }, [timeRange, fetchData])

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range)
    }

    const totalStudents = overview.totalStudents ?? analytics.students.total ?? 0
    const avgSatisfaction = overview.avgSatisfaction ?? 0
    const classUtilization = overview.classUtilization ?? 0
    const totalBookings = overview.totalBookings ?? 0

    const summaryCards = [
        {
            title: 'Total Students',
            value: totalStudents.toLocaleString(),
            icon: Users,
            gradientCard: 'bg-gradient-to-br from-blue-50 to-blue-100',
            gradientIcon: 'bg-gradient-to-br from-blue-500 to-blue-600',
            change: overview.studentsChange ?? '',
        },
        {
            title: 'Avg Satisfaction',
            value: avgSatisfaction ? `${avgSatisfaction.toFixed(1)}/5.0` : '0/5.0',
            icon: BarChart3,
            gradientCard: 'bg-gradient-to-br from-green-50 to-green-100',
            gradientIcon: 'bg-gradient-to-br from-green-500 to-green-600',
            change: overview.satisfactionChange ?? '',
        },
        {
            title: 'Class Utilization',
            value: classUtilization ? `${classUtilization.toFixed(1)}%` : '0%',
            icon: TrendingUp,
            gradientCard: 'bg-gradient-to-br from-purple-50 to-purple-100',
            gradientIcon: 'bg-gradient-to-br from-purple-500 to-purple-600',
            change: overview.utilizationChange ?? '',
        },
        {
            title: 'Bookings',
            value: totalBookings.toLocaleString(),
            icon: Calendar,
            gradientCard: 'bg-gradient-to-br from-orange-50 to-orange-100',
            gradientIcon: 'bg-gradient-to-br from-orange-500 to-orange-600',
            change: overview.bookingsChange ?? '',
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <button id="admin-franchise-analytics-btn-retry"
                    onClick={() => fetchData(timeRange)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    const enrollmentData = analytics.students.growth ?? []
    const classUtilizationData = analytics.classes.utilization ?? []
    const programPerformance = analytics.classes.performance ?? []
    const funnelData = analytics.enrollment.funnel ?? []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                    <p className="text-gray-600 mt-1">Comprehensive franchise performance metrics</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button id="admin-franchise-analytics-btn"
                            key={range}
                            onClick={() => handleTimeRangeChange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {summaryCards.map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`${metric.gradientCard} border-0 hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                        {metric.change && (
                                            <p className="text-xs text-gray-500 mt-2">{metric.change}</p>
                                        )}
                                    </div>
                                    <div className={`${metric.gradientIcon} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Student Enrollment Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-blue-600" />
                        Student Enrollment Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {enrollmentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={enrollmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total Students" strokeWidth={2} />
                                <Line type="monotone" dataKey="newEnrollments" stroke="#10b981" name="New Enrollments" strokeWidth={2} />
                                <Line type="monotone" dataKey="churn" stroke="#ef4444" name="Churn" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                            No enrollment data available for this period.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Class Utilization & Program Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Class Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {classUtilizationData.length > 0 ? (
                            <div className="space-y-4">
                                {classUtilizationData.map((cls, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{cls.name}</p>
                                            <Badge variant="outline">{cls.utilization}%</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600"
                                                    style={{ width: `${cls.utilization}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-600">
                                                {cls.enrolled}/{cls.capacity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-400">
                                No class utilization data available.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Program Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Program Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {programPerformance.length > 0 ? (
                            <div className="space-y-3">
                                {programPerformance.map((program, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{program.program}</p>
                                            <p className="text-xs text-gray-600">
                                                {program.students} students &bull; ${(program.revenue / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{program.satisfaction}/5.0</p>
                                            <p className="text-xs text-gray-600">satisfaction</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-400">
                                No program performance data available.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Enrollment Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                    {funnelData.length > 0 ? (
                        <div className="space-y-4">
                            {funnelData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{item.stage}</p>
                                            <span className="text-sm font-bold text-gray-700">{item.count}</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                                        {item.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400">
                            No enrollment funnel data available.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
