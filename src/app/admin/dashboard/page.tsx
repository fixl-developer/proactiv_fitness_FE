'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    Clock, Activity, BarChart3, Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        if (authLoading) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboardData()
    }, [isAuthenticated, authLoading, router])

    const loadDashboardData = async () => {
        try {
            setIsLoading(true)
            setTimeout(() => {
                setDashboardData({
                    totalLocations: 3,
                    totalStudents: 1200,
                    totalRevenue: 450000,
                    staffMembers: 45,
                    activeClasses: 89,
                    revenueGrowth: 12.5,
                    studentGrowth: 8.3,
                    occupancyRate: 82.5,
                    staffUtilization: 85.0,
                    customerSatisfaction: 4.7
                })
                setIsLoading(false)
            }, 1000)
        } catch (error) {
            console.error('Error loading dashboard:', error)
            setIsLoading(false)
        }
    }

    const revenueData = [
        { month: 'Jan', revenue: 380000, target: 400000 },
        { month: 'Feb', revenue: 395000, target: 410000 },
        { month: 'Mar', revenue: 410000, target: 420000 },
        { month: 'Apr', revenue: 425000, target: 430000 },
        { month: 'May', revenue: 440000, target: 440000 },
        { month: 'Jun', revenue: 450000, target: 450000 },
    ]

    const studentData = [
        { month: 'Jan', students: 1050 },
        { month: 'Feb', students: 1080 },
        { month: 'Mar', students: 1110 },
        { month: 'Apr', students: 1145 },
        { month: 'May', students: 1175 },
        { month: 'Jun', students: 1200 },
    ]

    const recentActivities = [
        { type: 'enrollment', title: 'New Student Enrolled', description: 'Sarah Johnson - Beginner Class', time: '5 min ago', icon: Users, color: 'text-green-600' },
        { type: 'payment', title: 'Payment Received', description: '$250 from John Smith', time: '15 min ago', icon: DollarSign, color: 'text-blue-600' },
        { type: 'staff', title: 'New Coach Added', description: 'Mike Chen - Advanced Gymnastics', time: '1 hour ago', icon: Users, color: 'text-purple-600' },
        { type: 'booking', title: 'Class Booking', description: '3 students booked for Saturday', time: '2 hours ago', icon: Calendar, color: 'text-orange-600' },
    ]

    const alerts = [
        { type: 'warning', title: 'Low Occupancy Alert', description: 'Boston Suburbs location at 65% capacity', priority: 'medium' },
        { type: 'info', title: 'Upcoming Holiday', description: 'Memorial Day - May 27th', priority: 'low' },
        { type: 'success', title: 'Revenue Target Met', description: 'June revenue target achieved', priority: 'low' },
    ]

    if (!isAuthenticated && !authLoading) return null

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Business Overview & Key Metrics</p>
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { title: 'Total Locations', value: dashboardData?.totalLocations, icon: Building2, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: '+1 this year' },
                    { title: 'Total Students', value: dashboardData?.totalStudents?.toLocaleString(), icon: Users, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: `+${dashboardData?.studentGrowth}%` },
                    { title: 'Total Revenue', value: `$${((dashboardData?.totalRevenue || 0) / 1000).toFixed(0)}K`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: `+${dashboardData?.revenueGrowth}%` },
                    { title: 'Staff Members', value: dashboardData?.staffMembers, icon: Users, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', change: '+3 this month' },
                    { title: 'Active Classes', value: dashboardData?.activeClasses, icon: Calendar, gradient: 'from-pink-500 to-pink-600', bgGradient: 'from-pink-50 to-pink-100', change: '+5 this month' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
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

            {/* Business Metrics, Recent Activities, Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Business Metrics
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
                                <Progress value={((dashboardData?.customerSatisfaction || 0) / 5) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Recent Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className={`${activity.color} mt-1`}>
                                        <activity.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                        <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-600" />
                            Alerts & Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.map((alert, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                    alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                        'bg-green-50 border-green-200'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={alert.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                            {alert.priority}
                                        </Badge>
                                        <span className="text-sm font-medium text-gray-900">{alert.title}</span>
                                    </div>
                                    <p className="text-xs text-gray-700">{alert.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Revenue Trend vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${(Number(value) / 1000).toFixed(0)}K`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Student Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Student Growth Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={studentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} name="Total Students" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
