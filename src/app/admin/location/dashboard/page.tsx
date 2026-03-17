'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown,
    Zap, Activity, Target, BarChart3, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function LocationManagerDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        // Simulate API call to fetch Location dashboard data
        setTimeout(() => {
            setDashboardData({
                locationName: 'Boston Downtown',
                totalClasses: 24,
                totalStaff: 8,
                totalStudents: 320,
                monthlyRevenue: 185000,
                revenueGrowth: 8.5,
                occupancyRate: 85.0,
                staffUtilization: 88.0,
                customerSatisfaction: 4.8,
                todayClasses: 6,
                todayAttendance: 145,
                pendingApprovals: 2,
                criticalAlerts: 0,
                warnings: 1
            })
            setIsLoading(false)
        }, 1000)
    }, [])

    // Daily revenue data
    const revenueData = [
        { day: 'Mon', revenue: 28000, target: 30000 },
        { day: 'Tue', revenue: 29500, target: 30000 },
        { day: 'Wed', revenue: 31000, target: 30000 },
        { day: 'Thu', revenue: 30500, target: 30000 },
        { day: 'Fri', revenue: 32000, target: 30000 },
        { day: 'Sat', revenue: 34000, target: 35000 },
    ]

    // Class schedule
    const todayClasses = [
        { time: '09:00 AM', name: 'Beginner Gymnastics', coach: 'Sarah', students: 12, room: 'A1' },
        { time: '10:30 AM', name: 'Intermediate Gymnastics', coach: 'Mike', students: 15, room: 'A2' },
        { time: '12:00 PM', name: 'Advanced Gymnastics', coach: 'John', students: 10, room: 'A1' },
        { time: '02:00 PM', name: 'Kids Gymnastics', coach: 'Emma', students: 18, room: 'B1' },
        { time: '03:30 PM', name: 'Teen Gymnastics', coach: 'David', students: 14, room: 'B2' },
        { time: '05:00 PM', name: 'Adult Fitness', coach: 'Lisa', students: 8, room: 'A1' },
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
                    <h1 className="text-3xl font-bold text-gray-900">Location Dashboard</h1>
                    <p className="text-gray-600 mt-1">{dashboardData?.locationName} - Daily Operations</p>
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

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Classes',
                        value: dashboardData?.totalClasses,
                        icon: Calendar,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        change: 'This month'
                    },
                    {
                        title: 'Total Students',
                        value: dashboardData?.totalStudents,
                        icon: Users,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50',
                        change: '+15 this month'
                    },
                    {
                        title: 'Staff Members',
                        value: dashboardData?.totalStaff,
                        icon: Users,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50',
                        change: 'Full team'
                    },
                    {
                        title: 'Monthly Revenue',
                        value: `${(dashboardData?.monthlyRevenue / 1000).toFixed(0)}K`,
                        icon: DollarSign,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50',
                        change: `+${dashboardData?.revenueGrowth}% vs last month`
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

            {/* Location Metrics & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Location Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Location Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                                    <span className="text-lg font-bold text-green-600">{dashboardData?.occupancyRate}%</span>
                                </div>
                                <Progress value={dashboardData?.occupancyRate} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Staff Utilization</span>
                                    <span className="text-lg font-bold text-blue-600">{dashboardData?.staffUtilization}%</span>
                                </div>
                                <Progress value={dashboardData?.staffUtilization} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                                    <span className="text-lg font-bold text-purple-600">{dashboardData?.customerSatisfaction}/5.0</span>
                                </div>
                                <Progress value={(dashboardData?.customerSatisfaction / 5) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Today's Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="text-xs">Classes</Badge>
                                    <span className="text-sm font-medium text-blue-900">Today's Schedule</span>
                                </div>
                                <p className="text-xs text-blue-700">{dashboardData?.todayClasses} classes scheduled</p>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">Attendance</Badge>
                                    <span className="text-sm font-medium text-green-900">Current Attendance</span>
                                </div>
                                <p className="text-xs text-green-700">{dashboardData?.todayAttendance} students present</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">Alert</Badge>
                                    <span className="text-sm font-medium text-yellow-900">Facility Status</span>
                                </div>
                                <p className="text-xs text-yellow-700">All systems operational</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Check In Students
                            </button>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                Mark Attendance
                            </button>
                            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                                Report Issue
                            </button>
                            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                                View Reports
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Weekly Revenue vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip formatter={(value) => typeof value === 'number' ? `${(value / 1000).toFixed(0)}K` : value} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Today's Class Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Today's Class Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {todayClasses.map((cls, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{cls.time}</span>
                                        <span className="font-medium text-gray-900">{cls.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Coach: {cls.coach} • Room: {cls.room}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{cls.students}</p>
                                    <p className="text-xs text-gray-600">students</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
