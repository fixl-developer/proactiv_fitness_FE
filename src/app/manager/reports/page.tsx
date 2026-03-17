'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, RefreshCw,
    FileText, PieChart, Activity, Target, ArrowUp, ArrowDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const ManagerReportsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'MANAGER') {
                window.location.href = '/login'
                return
            }
        }
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    const reportStats = {
        totalRevenue: 485000,
        totalStudents: 89,
        classesCompleted: 156,
        averageAttendance: 87.5,
        revenueGrowth: 12.5,
        studentGrowth: 8.3,
        attendanceRate: 92.1
    }

    const monthlyData = [
        { month: 'Jan', revenue: 45000, students: 78, classes: 120 },
        { month: 'Feb', revenue: 52000, students: 82, classes: 135 },
        { month: 'Mar', revenue: 48000, students: 85, classes: 142 },
        { month: 'Apr', revenue: 55000, students: 89, classes: 156 }
    ]

    const programPerformance = [
        { program: 'Beginner Gymnastics', students: 35, revenue: 168000, growth: 15.2 },
        { program: 'Intermediate Gymnastics', students: 28, revenue: 201600, growth: 8.7 },
        { program: 'Advanced Gymnastics', students: 18, revenue: 172800, growth: 12.1 },
        { program: 'Private Coaching', students: 8, revenue: 128000, growth: 22.5 }
    ]

    const coachPerformance = [
        { name: 'Sarah Johnson', students: 24, rating: 4.9, revenue: 115200 },
        { name: 'Mike Chen', students: 18, rating: 4.7, revenue: 86400 },
        { name: 'Lisa Zhang', students: 12, rating: 4.8, revenue: 76800 },
        { name: 'Tom Wilson', students: 15, rating: 4.5, revenue: 72000 }
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-2">Location performance insights and metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['week', 'month', 'quarter'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period as any)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${reportStats.totalRevenue.toLocaleString()}</div>
                            <div className="flex items-center mt-1">
                                <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                                <span className="text-sm text-green-600 font-medium">+{reportStats.revenueGrowth}%</span>
                            </div>
                            <Progress value={85} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                            <Users className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{reportStats.totalStudents}</div>
                            <div className="flex items-center mt-1">
                                <ArrowUp className="w-4 h-4 text-blue-600 mr-1" />
                                <span className="text-sm text-blue-600 font-medium">+{reportStats.studentGrowth}%</span>
                            </div>
                            <Progress value={78} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Classes Completed</CardTitle>
                            <Activity className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{reportStats.classesCompleted}</div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-purple-600 font-medium">This month</span>
                            </div>
                            <Progress value={92} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
                            <Target className="h-5 w-5 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{reportStats.attendanceRate}%</div>
                            <div className="flex items-center mt-1">
                                <ArrowUp className="w-4 h-4 text-orange-600 mr-1" />
                                <span className="text-sm text-orange-600 font-medium">Excellent</span>
                            </div>
                            <Progress value={reportStats.attendanceRate} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Program Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Program Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {programPerformance.map((program, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{program.program}</h4>
                                        <p className="text-sm text-gray-600">{program.students} students enrolled</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-purple-600">HK${program.revenue.toLocaleString()}</p>
                                    <div className="flex items-center">
                                        <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                                        <span className="text-sm text-green-600 font-medium">+{program.growth}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Coach Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Coach Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {coachPerformance.map((coach, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {coach.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{coach.name}</h4>
                                        <p className="text-sm text-gray-600">{coach.students} students • ⭐ {coach.rating}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">HK${coach.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Revenue generated</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Reports */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <FileText className="w-6 h-6" />
                            <span>Monthly Report</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <PieChart className="w-6 h-6" />
                            <span>Revenue Analysis</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Users className="w-6 h-6" />
                            <span>Student Report</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Download className="w-6 h-6" />
                            <span>Export Data</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerReportsPage
