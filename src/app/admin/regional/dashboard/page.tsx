'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown,
    MapPin, Zap, Activity, Target, BarChart3, PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RegionalAdminDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        // Simulate API call to fetch Regional dashboard data
        setTimeout(() => {
            setDashboardData({
                regionName: 'Northeast Region',
                totalLocations: 5,
                totalStaff: 45,
                totalStudents: 1250,
                totalRevenue: 850000,
                monthlyRevenue: 142000,
                revenueGrowth: 12.3,
                occupancyRate: 78.5,
                staffUtilization: 82.0,
                customerSatisfaction: 4.6,
                pendingApprovals: 5,
                criticalAlerts: 1,
                warnings: 3
            })
            setIsLoading(false)
        }, 1000)
    }, [])

    // Revenue trend data
    const revenueData = [
        { month: 'Jan', revenue: 120000, target: 130000 },
        { month: 'Feb', revenue: 128000, target: 135000 },
        { month: 'Mar', revenue: 135000, target: 140000 },
        { month: 'Apr', revenue: 138000, target: 142000 },
        { month: 'May', revenue: 140000, target: 145000 },
        { month: 'Jun', revenue: 142000, target: 150000 },
    ]

    // Location performance data
    const locationData = [
        { name: 'Boston Downtown', students: 320, revenue: 185000, status: 'excellent' },
        { name: 'Boston Suburbs', students: 280, revenue: 165000, status: 'excellent' },
        { name: 'Providence', students: 210, revenue: 125000, status: 'good' },
        { name: 'Hartford', students: 240, revenue: 145000, status: 'good' },
        { name: 'New Haven', students: 200, revenue: 115000, status: 'needs-attention' },
    ]

    // Staff performance
    const staffData = [
        { name: 'Coaches', count: 18, utilization: 85 },
        { name: 'Managers', count: 8, utilization: 90 },
        { name: 'Support Staff', count: 19, utilization: 75 },
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
                    <h1 className="text-3xl font-bold text-gray-900">Regional Dashboard</h1>
                    <p className="text-gray-600 mt-1">{dashboardData?.regionName} - Operations Overview</p>
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
                        title: 'Regional Locations',
                        value: dashboardData?.totalLocations,
                        icon: Building2,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        change: '+1 this month'
                    },
                    {
                        title: 'Total Students',
                        value: dashboardData?.totalStudents,
                        icon: Users,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50',
                        change: '+85 this month'
                    },
                    {
                        title: 'Staff Members',
                        value: dashboardData?.totalStaff,
                        icon: Users,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50',
                        change: '+3 this month'
                    },
                    {
                        title: 'Regional Revenue',
                        value: `${(dashboardData?.totalRevenue / 1000).toFixed(0)}K`,
                        icon: DollarSign,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50',
                        change: `+${dashboardData?.revenueGrowth}% YoY`
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

            {/* Regional Metrics & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Regional Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Regional Metrics
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

                {/* Regional Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Regional Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                                    <span className="text-sm font-medium text-red-900">Boston Downtown Staffing</span>
                                </div>
                                <p className="text-xs text-red-700">2 coaches out sick, coverage needed</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">Warning</Badge>
                                    <span className="text-sm font-medium text-yellow-900">New Haven Performance</span>
                                </div>
                                <p className="text-xs text-yellow-700">Revenue below target by 15%</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="text-xs">Info</Badge>
                                    <span className="text-sm font-medium text-blue-900">Pending Approvals</span>
                                </div>
                                <p className="text-xs text-blue-700">{dashboardData?.pendingApprovals} items awaiting review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Monthly Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">Monthly Revenue</span>
                                    <span className="font-bold text-gray-900">${(dashboardData?.monthlyRevenue / 1000).toFixed(0)}K</span>
                                </div>
                                <Progress value={75} className="h-2" />
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-2">Revenue Growth</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardData?.revenueGrowth?.toFixed(1)}%</p>
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <ArrowUp className="w-3 h-3" />
                                    vs last month
                                </p>
                            </div>
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
                            <Tooltip formatter={(value) => typeof value === 'number' ? `${(value / 1000).toFixed(0)}K` : value} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location Performance & Staff Utilization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Location Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {locationData.map((location, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{location.name}</p>
                                        <p className="text-xs text-gray-600">{location.students} students • ${(location.revenue / 1000).toFixed(0)}K revenue</p>
                                    </div>
                                    <Badge variant={location.status === 'excellent' ? 'default' : 'secondary'}>
                                        {location.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Staff Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Staff Utilization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {staffData.map((staff, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{staff.name}</span>
                                        <span className="text-sm font-bold text-gray-900">{staff.count} • {staff.utilization}%</span>
                                    </div>
                                    <Progress value={staff.utilization} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Pending Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { type: 'Staff Approval', name: 'New Coach - John Smith', date: '2 days ago', priority: 'high' },
                            { type: 'Location Update', name: 'Boston Downtown - Facility Upgrade', date: '1 day ago', priority: 'medium' },
                            { type: 'Schedule Review', name: 'Summer Program Schedule', date: '3 hours ago', priority: 'medium' },
                            { type: 'Budget Approval', name: 'Q3 Regional Budget', date: '5 hours ago', priority: 'low' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.type}</p>
                                    <p className="text-sm text-gray-600">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}>
                                        {item.priority}
                                    </Badge>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                        Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
