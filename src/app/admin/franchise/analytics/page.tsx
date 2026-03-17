'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, Users, TrendingUp, Calendar, Filter,
    LineChart as LineChartIcon, PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function FranchiseAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }, [])

    // Student enrollment data
    const enrollmentData = [
        { month: 'Jan', students: 280, newEnrollments: 25, churn: 8 },
        { month: 'Feb', students: 295, newEnrollments: 28, churn: 13 },
        { month: 'Mar', students: 310, newEnrollments: 32, churn: 17 },
        { month: 'Apr', students: 325, newEnrollments: 35, churn: 20 },
        { month: 'May', students: 340, newEnrollments: 38, churn: 23 },
        { month: 'Jun', students: 355, newEnrollments: 40, churn: 25 },
    ]

    // Class utilization data
    const classUtilizationData = [
        { name: 'Beginner', utilization: 85, capacity: 20, enrolled: 17 },
        { name: 'Intermediate', utilization: 90, capacity: 18, enrolled: 16 },
        { name: 'Advanced', utilization: 75, capacity: 15, enrolled: 11 },
        { name: 'Elite', utilization: 95, capacity: 12, enrolled: 11 },
    ]

    // Program performance
    const programPerformance = [
        { program: 'Classes', students: 220, revenue: 180000, satisfaction: 4.6 },
        { program: 'Birthday Parties', students: 85, revenue: 120000, satisfaction: 4.8 },
        { program: 'Private Coaching', students: 35, revenue: 80000, satisfaction: 4.7 },
        { program: 'Camps', students: 15, revenue: 20000, satisfaction: 4.4 },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

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
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
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
                {[
                    {
                        title: 'Total Students',
                        value: '355',
                        icon: Users,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        change: '+27% YoY'
                    },
                    {
                        title: 'Avg Satisfaction',
                        value: '4.6/5.0',
                        icon: BarChart3,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50',
                        change: '+0.3 vs last month'
                    },
                    {
                        title: 'Class Utilization',
                        value: '86.3%',
                        icon: TrendingUp,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50',
                        change: '+5.2% vs last month'
                    },
                    {
                        title: 'Churn Rate',
                        value: '7.0%',
                        icon: Calendar,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50',
                        change: '-1.2% vs last month'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                        <p className="text-xs text-gray-500 mt-2">{metric.change}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
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
                    <CardTitle className="f
lex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-blue-600" />
                        Student Enrollment Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={enrollmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="students" stroke="#3b82f6" name="Total Students" strokeWidth={2} />
                            <Line type="monotone" dataKey="newEnrollments" stroke="#10b981" name="New Enrollments" strokeWidth={2} />
                            <Line type="monotone" dataKey="churn" stroke="#ef4444" name="Churn" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
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
                                        <span className="text-xs text-gray-600">{cls.enrolled}/{cls.capacity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Program Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Program Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {programPerformance.map((program, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{program.program}</p>
                                        <p className="text-xs text-gray-600">{program.students} students • ${(program.revenue / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{program.satisfaction}/5.0</p>
                                        <p className="text-xs text-gray-600">satisfaction</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enrollment Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { stage: 'Website Visitors', count: 2500, percentage: 100 },
                            { stage: 'Trial Class Bookings', count: 450, percentage: 18 },
                            { stage: 'Trial Class Attended', count: 380, percentage: 15.2 },
                            { stage: 'Enrolled Students', count: 355, percentage: 14.2 },
                        ].map((item, idx) => (
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
                                <span className="text-sm font-semibold text-gray-700 w-12 text-right">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
