'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { HQAdminService, AnalyticsData } from '@/services/hqAdminService'

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d')
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await HQAdminService.getAnalytics()
            setAnalyticsData(data)
        } catch (err: any) {
            console.error('Error fetching analytics:', err)
            setError(err.message || 'Failed to fetch analytics')
            // Use mock data for development
            setAnalyticsData({
                revenue: {
                    total: 3450000,
                    monthly: [
                        { month: 'Jan', amount: 2100000 },
                        { month: 'Feb', amount: 2350000 },
                        { month: 'Mar', amount: 2650000 },
                        { month: 'Apr', amount: 2850000 },
                        { month: 'May', amount: 3100000 },
                        { month: 'Jun', amount: 3450000 },
                    ],
                    byLocation: [
                        { location: 'Cyberport', amount: 425000 },
                        { location: 'Wan Chai', amount: 385000 },
                        { location: 'School Programs', amount: 998000 },
                        { location: 'Partner Gyms', amount: 327000 },
                        { location: 'Camps', amount: 100000 },
                    ]
                },
                users: {
                    total: 2650,
                    growth: [
                        { month: 'Jan', count: 1200 },
                        { month: 'Feb', count: 1450 },
                        { month: 'Mar', count: 1850 },
                        { month: 'Apr', count: 2100 },
                        { month: 'May', count: 2350 },
                        { month: 'Jun', count: 2650 },
                    ],
                    byRole: [
                        { role: 'PARENT', count: 1800 },
                        { role: 'COACH', count: 450 },
                        { role: 'ADMIN', count: 200 },
                        { role: 'MANAGER', count: 150 },
                        { role: 'SUPPORT', count: 50 },
                    ]
                },
                programs: {
                    total: 100,
                    distribution: [
                        { program: 'School Programs', count: 45 },
                        { program: 'Birthday Parties', count: 25 },
                        { program: 'Camps', count: 20 },
                        { program: 'Private Coaching', count: 10 },
                    ],
                    enrollment: [
                        { program: 'School Programs', enrolled: 1200, capacity: 1500 },
                        { program: 'Birthday Parties', enrolled: 450, capacity: 500 },
                        { program: 'Camps', enrolled: 350, capacity: 400 },
                        { program: 'Private Coaching', enrolled: 280, capacity: 300 },
                    ]
                },
                locations: {
                    total: 5,
                    active: 5,
                    performance: [
                        { location: 'Cyberport', revenue: 425000, enrollment: 450 },
                        { location: 'Wan Chai', revenue: 385000, enrollment: 380 },
                        { location: 'School Programs', revenue: 998000, enrollment: 1200 },
                        { location: 'Partner Gyms', revenue: 327000, enrollment: 280 },
                        { location: 'Camps', revenue: 100000, enrollment: 110 },
                    ]
                }
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const revenueData = analyticsData?.revenue.monthly || []
    const userGrowthData = analyticsData?.users.growth.map(item => ({
        month: item.month,
        users: item.count,
        activeUsers: Math.floor(item.count * 0.85)
    })) || []
    const programData = analyticsData?.programs.distribution.map((item, idx) => ({
        name: item.program,
        value: item.count,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][idx % 4]
    })) || []
    const locationPerformance = analyticsData?.locations.performance || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-gray-600 mt-1">System-wide performance analytics</p>
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

            {/* Revenue Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Revenue Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000000).toFixed(2)}M` : value} />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Revenue" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        User Growth Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="users" fill="#3b82f6" name="Total Users" />
                            <Bar dataKey="activeUsers" fill="#10b981" name="Active Users" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Program Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            Program Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={programData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {programData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Location Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-orange-600" />
                            Location Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {locationPerformance.map((loc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{loc.location}</p>
                                        <p className="text-xs text-gray-600">{loc.enrollment} students</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">${(loc.revenue / 1000).toFixed(0)}K</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
