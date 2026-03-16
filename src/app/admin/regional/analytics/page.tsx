'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function RegionalAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d')

    const revenueData = [
        { month: 'Jan', revenue: 120000, target: 130000 },
        { month: 'Feb', revenue: 128000, target: 135000 },
        { month: 'Mar', revenue: 135000, target: 140000 },
        { month: 'Apr', revenue: 138000, target: 142000 },
        { month: 'May', revenue: 140000, target: 145000 },
        { month: 'Jun', revenue: 142000, target: 150000 },
    ]

    const studentData = [
        { month: 'Jan', students: 1050, active: 980 },
        { month: 'Feb', students: 1100, active: 1020 },
        { month: 'Mar', students: 1150, active: 1080 },
        { month: 'Apr', students: 1180, active: 1110 },
        { month: 'May', students: 1210, active: 1140 },
        { month: 'Jun', students: 1250, active: 1180 },
    ]

    const locationBreakdown = [
        { name: 'Boston Downtown', value: 320, color: '#3b82f6' },
        { name: 'Boston Suburbs', value: 280, color: '#10b981' },
        { name: 'Providence', value: 210, color: '#f59e0b' },
        { name: 'Hartford', value: 240, color: '#8b5cf6' },
        { name: 'New Haven', value: 200, color: '#ef4444' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Analytics</h1>
                    <p className="text-gray-600 mt-1">Detailed performance metrics and trends</p>
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
                            <Tooltip formatter={(value) => `${(Number(value) / 1000).toFixed(0)}K`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Actual Revenue" strokeWidth={2} />
                            <Line type="monotone" dataKey="target" stroke="#10b981" name="Target Revenue" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Student Growth */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Student Growth Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={studentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="students" fill="#3b82f6" name="Total Students" />
                            <Bar dataKey="active" fill="#10b981" name="Active Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Student Distribution by Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={locationBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {locationBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
