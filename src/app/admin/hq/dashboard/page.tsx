'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Users, DollarSign, Building2, Calendar,
    AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown,
    Globe, Zap, Activity, Target, BarChart3, PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function HQAdminDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        // Simulate API call to fetch HQ dashboard data
        setTimeout(() => {
            setDashboardData({
                totalLocations: 16,
                totalFranchises: 8,
                totalUsers: 245,
                totalRevenue: 2850000,
                monthlyRevenue: 485000,
                revenueGrowth: 18.5,
                activeStudents: 3420,
                conversionRate: 68.5,
                systemHealth: 98.5,
                pendingApprovals: 12,
                criticalAlerts: 3,
                warnings: 8
            })
            setIsLoading(false)
        }, 1000)
    }, [])

    // Revenue trend data
    const revenueData = [
        { month: 'Jan', revenue: 2100000, target: 2000000 },
        { month: 'Feb', revenue: 2350000, target: 2200000 },
        { month: 'Mar', revenue: 2650000, target: 2400000 },
        { month: 'Apr', revenue: 2850000, target: 2600000 },
        { month: 'May', revenue: 3100000, target: 2800000 },
        { month: 'Jun', revenue: 3450000, target: 3000000 },
    ]

    // Location performance data
    const locationData = [
        { name: 'Cyberport', students: 450, revenue: 425000, status: 'excellent' },
        { name: 'Wan Chai', students: 380, revenue: 385000, status: 'excellent' },
        { name: 'School Programs', students: 1200, revenue: 998000, status: 'excellent' },
        { name: 'Partner Gyms', students: 280, revenue: 327000, status: 'good' },
        { name: 'Camps', students: 110, revenue: 100000, status: 'needs-attention' },
    ]

    // System metrics
    const systemMetrics = [
        { name: 'API Uptime', value: 99.9, unit: '%', status: 'excellent' },
        { name: 'Response Time', value: 145, unit: 'ms', status: 'excellent' },
        { name: 'Error Rate', value: 0.02, unit: '%', status: 'excellent' },
        { name: 'Database Load', value: 65, unit: '%', status: 'good' },
    ]

    // Franchise performance
    const franchiseData = [
        { name: 'NYC Franchise', locations: 4, revenue: 1200000, growth: 15.2 },
        { name: 'LA Franchise', locations: 3, revenue: 950000, growth: 12.8 },
        { name: 'Chicago Franchise', locations: 3, revenue: 850000, growth: 18.5 },
        { name: 'Boston Franchise', locations: 2, revenue: 650000, growth: 8.3 },
        { name: 'Miami Franchise', locations: 2, revenue: 550000, growth: -2.1 },
        { name: 'Seattle Franchise', locations: 2, revenue: 450000, growth: 22.5 },
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
                    <h1 className="text-3xl font-bold text-gray-900">HQ Dashboard</h1>
                    <p className="text-gray-600 mt-1">System-wide operations overview</p>
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
                        title: 'Total Locations',
                        value: dashboardData?.totalLocations,
                        icon: Building2,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        change: '+2 this month'
                    },
                    {
                        title: 'Total Franchises',
                        value: dashboardData?.totalFranchises,
                        icon: Globe,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50',
                        change: '+1 this month'
                    },
                    {
                        title: 'System Users',
                        value: dashboardData?.totalUsers,
                        icon: Users,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50',
                        change: '+18 this month'
                    },
                    {
                        title: 'Total Revenue',
                        value: `$${(dashboardData?.totalRevenue / 1000000).toFixed(2)}M`,
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

            {/* System Health & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Health */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Overall Status</span>
                                    <span className="text-lg font-bold text-green-600">{dashboardData?.systemHealth}%</span>
                                </div>
                                <Progress value={dashboardData?.systemHealth} className="h-2" />
                            </div>
                            {systemMetrics.map((metric, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-700">{metric.name}</span>
                                    <span className="font-semibold text-gray-900">{metric.value}{metric.unit}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            System Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                                    <span className="text-sm font-medium text-red-900">Payment Gateway Issue</span>
                                </div>
                                <p className="text-xs text-red-700">Stripe experiencing 15% failure rate</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">Warning</Badge>
                                    <span className="text-sm font-medium text-yellow-900">High API Load</span>
                                </div>
                                <p className="text-xs text-yellow-700">API response time increased to 245ms</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="text-xs">Info</Badge>
                                    <span className="text-sm font-medium text-blue-900">Pending Approvals</span>
                                </div>
                                <p className="text-xs text-blue-700">{dashboardData?.pendingApprovals} franchise applications waiting</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Key Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">Active Students</span>
                                    <span className="font-bold text-gray-900">{dashboardData?.activeStudents.toLocaleString()}</span>
                                </div>
                                <Progress value={85} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">Conversion Rate</span>
                                    <span className="font-bold text-gray-900">{dashboardData?.conversionRate}%</span>
                                </div>
                                <Progress value={dashboardData?.conversionRate} className="h-2" />
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-2">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">${(dashboardData?.monthlyRevenue / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <ArrowUp className="w-3 h-3" />
                                    {dashboardData?.revenueGrowth}% from last month
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
                            <Tooltip formatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location Performance & Franchise Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Locations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Top Performing Locations
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

                {/* Franchise Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-green-600" />
                            Franchise Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {franchiseData.map((franchise, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{franchise.name}</p>
                                        <p className="text-xs text-gray-600">{franchise.locations} locations • ${(franchise.revenue / 1000000).toFixed(2)}M</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${franchise.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {franchise.growth >= 0 ? '+' : ''}{franchise.growth}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Pending Approvals & Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { type: 'Franchise Application', name: 'New York Expansion', date: '2 days ago', priority: 'high' },
                            { type: 'Location Setup', name: 'Boston Downtown', date: '1 day ago', priority: 'medium' },
                            { type: 'Staff Onboarding', name: 'Coach - Sarah Mitchell', date: '3 hours ago', priority: 'medium' },
                            { type: 'Payment Verification', name: 'Partner Gym - Chicago', date: '5 hours ago', priority: 'low' },
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
