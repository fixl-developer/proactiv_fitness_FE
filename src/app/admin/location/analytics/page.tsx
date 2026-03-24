'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, Users, TrendingUp, Calendar, LineChart as LineChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LocationManagerService, LocationAnalytics } from '@/services/locationManagerService'

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
                    <h1 className="text-3xl font-bold text-gray-900">Location Analytics</h1>
                    <p className="text-gray-600 mt-1">Track location performance and metrics</p>
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
                    { title: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
                    { title: 'Avg Attendance', value: `${avgAttendance}%`, icon: BarChart3, color: 'text-green-600', bgColor: 'bg-green-50' },
                    { title: 'Classes/Week', value: classesPerWeek, icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
                    { title: 'Satisfaction', value: satisfaction ? `${satisfaction}/5.0` : 'N/A', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
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

            {/* Attendance Trend */}
            {attendanceData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChartIcon className="w-5 h-5 text-blue-600" />
                            Weekly Attendance Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attended" fill="#3b82f6" name="Attended" />
                                <Bar dataKey="noshow" fill="#ef4444" name="No-Show" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Class Performance */}
            {classPerformance.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Class Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Satisfaction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classPerformance.map((cls: any, idx: number) => (
                                        <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4"><p className="font-medium text-gray-900">{cls.name}</p></td>
                                            <td className="py-3 px-4"><p className="text-sm text-gray-600">{cls.students}</p></td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-600" style={{ width: `${cls.attendance}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{cls.attendance}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{cls.satisfaction}/5.0</Badge>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Peak Hours */}
            {peakHours.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Peak Hours Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {peakHours.map((slot: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{slot.time}</p>
                                        <p className="text-xs text-gray-600">{slot.classes} classes</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600" style={{ width: `${slot.utilization}%` }}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-10 text-right">{slot.utilization}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
