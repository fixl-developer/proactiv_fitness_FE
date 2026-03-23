'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, TrendingUp, Users, DollarSign, MapPin, Loader2 } from 'lucide-react'
import { RegionalAdminService, RegionalAnalytics } from '@/services/regionalAdminService'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16']

export default function RegionalAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d')
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState<RegionalAnalytics | null>(null)

    const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; target: number }>>([])
    const [studentData, setStudentData] = useState<Array<{ month: string; students: number; newEnrollments: number; churn: number }>>([])
    const [locationBreakdown, setLocationBreakdown] = useState<Array<{ name: string; value: number; color: string }>>([])

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true)
            try {
                const data = await RegionalAdminService.getAnalytics(timeRange)
                setAnalytics(data)

                // Map revenue monthly data for LineChart
                setRevenueData(data.revenue?.monthly ?? [])

                // Map student growth data for BarChart
                setStudentData(data.students?.growth ?? [])

                // Map students by location for PieChart, adding colors
                const byLocation = data.students?.byLocation ?? []
                setLocationBreakdown(
                    byLocation.map((item, index) => ({
                        name: item.location,
                        value: item.count,
                        color: PIE_COLORS[index % PIE_COLORS.length],
                    }))
                )
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
                setAnalytics(null)
                setRevenueData([])
                setStudentData([])
                setLocationBreakdown([])
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [timeRange])

    // Compute summary values
    const totalRevenue = analytics?.totalRevenue ?? analytics?.revenue?.total ?? 0
    const totalStudents = analytics?.totalStudents ?? analytics?.students?.total ?? 0
    const activeLocations = analytics?.locations?.active ?? 0
    const staffUtilization = analytics?.staff?.byRole?.length
        ? Math.round(
              analytics.staff.byRole.reduce((sum, r) => sum + (r.utilization ?? 0), 0) /
                  analytics.staff.byRole.length
          )
        : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 text-lg">Loading analytics...</span>
            </div>
        )
    }

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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${totalRevenue.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalStudents.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Locations</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {activeLocations}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Staff Utilization</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {staffUtilization}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                            <Bar dataKey="newEnrollments" fill="#10b981" name="New Enrollments" />
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
