'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, Users, TrendingUp, Calendar, LineChart as LineChartIcon,
    Clock, DollarSign, Activity, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { LocationManagerService, LocationAnalytics } from '@/services/locationManagerService'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export default function LocationAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('30d')
    const [analyticsData, setAnalyticsData] = useState<any>(null)

    const fetchAnalytics = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await LocationManagerService.getAnalytics(timeRange)
            setAnalyticsData(result)
        } catch (err: any) {
            console.error('Error fetching analytics:', err)
            setError(err.message || 'Failed to fetch analytics')
            setAnalyticsData(null)
        } finally {
            setIsLoading(false)
        }
    }, [timeRange])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const totalStudents = analyticsData?.totalStudents ?? analyticsData?.students?.total ?? 0
    const avgAttendance = analyticsData?.avgAttendance ?? 0
    const classesPerWeek = analyticsData?.classesPerWeek ?? 0
    const satisfaction = analyticsData?.satisfaction ?? 0
    const attendanceData = analyticsData?.attendanceData ?? analyticsData?.students?.growth ?? []
    const classPerformance = analyticsData?.classPerformance ?? analyticsData?.classes?.performance ?? []
    const peakHours = analyticsData?.peakHours ?? []
    const revenueTrend = analyticsData?.revenueTrend ?? []

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // Prepare pie chart data from class performance
    const classPieData = classPerformance.map((cls: any) => ({
        name: cls.name,
        value: cls.students,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Location Analytics</h1>
                    <p className="text-gray-600 mt-1">Track location performance and metrics</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button id="admin-location-analytics-btn"
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

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Students', value: totalStudents, icon: Users, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
                    { title: 'Avg Attendance', value: `${avgAttendance}%`, icon: BarChart3, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
                    { title: 'Classes/Week', value: classesPerWeek, icon: Calendar, cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600', titleColor: 'text-purple-700', valueColor: 'text-purple-900' },
                    { title: 'Satisfaction', value: satisfaction ? `${satisfaction}/5.0` : 'N/A', icon: TrendingUp, cardBg: 'bg-gradient-to-br from-orange-50 to-orange-100', iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600', titleColor: 'text-orange-700', valueColor: 'text-orange-900' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`${metric.cardBg} border-0 shadow-sm hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${metric.titleColor}`}>{metric.title}</p>
                                        <p className={`text-2xl font-bold ${metric.valueColor} mt-2`}>{metric.value}</p>
                                    </div>
                                    <div className={`${metric.iconBg} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row - Attendance Trend & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChartIcon className="w-5 h-5 text-blue-600" />
                                Attendance Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {attendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                        <Legend />
                                        <Bar dataKey="attended" fill="#3b82f6" name="Attended" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="noshow" fill="#ef4444" name="No-Show" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No attendance data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Revenue Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Revenue Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={revenueTrend}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                        <Legend />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient)" name="Revenue" strokeWidth={2} />
                                        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" name="Bookings" strokeWidth={2} dot={{ r: 4 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    <div className="text-center">
                                        <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No revenue data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Class Performance & Student Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Class Performance Table */}
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-purple-600" />
                                Class Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classPerformance.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classPerformance.map((cls: any, idx: number) => (
                                                <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                            <p className="font-medium text-gray-900">{cls.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm font-medium text-gray-700">{cls.students}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${cls.attendance >= 80 ? 'bg-green-500' : cls.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${cls.attendance}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">{cls.attendance}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            <span className="text-sm font-medium text-gray-700">{cls.satisfaction}</span>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] text-gray-400">
                                    <p className="text-sm">No class performance data</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Student Distribution Pie */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Student Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classPieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={classPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {classPieData.map((_: any, idx: number) => (
                                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-2">
                                        {classPieData.slice(0, 5).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                    <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                                                </div>
                                                <span className="font-medium text-gray-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] text-gray-400">
                                    <p className="text-sm">No student data</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Peak Hours */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            Peak Hours Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {peakHours.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {peakHours.map((slot: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + idx * 0.05 }}
                                        className={`p-4 rounded-xl border transition-shadow hover:shadow-md ${
                                            slot.utilization >= 90 ? 'bg-red-50 border-red-200' :
                                            slot.utilization >= 70 ? 'bg-orange-50 border-orange-200' :
                                            slot.utilization >= 50 ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-green-50 border-green-200'
                                        }`}
                                    >
                                        <p className="font-semibold text-gray-900 text-sm">{slot.time}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{slot.classes} classes</span>
                                            <Badge variant={
                                                slot.utilization >= 90 ? 'destructive' :
                                                slot.utilization >= 70 ? 'default' : 'secondary'
                                            }>
                                                {slot.utilization}%
                                            </Badge>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    slot.utilization >= 90 ? 'bg-red-500' :
                                                    slot.utilization >= 70 ? 'bg-orange-500' :
                                                    slot.utilization >= 50 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${slot.utilization}%` }}
                                            ></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[100px] text-gray-400">
                                <p className="text-sm">No peak hours data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {!analyticsData && !error && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No analytics data available</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
