'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Users, CheckCircle, XCircle, Clock, Calendar, Download,
    Filter, Search, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LocationManagerService } from '@/services/locationManagerService'

export default function LocationAttendancePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterClass, setFilterClass] = useState('all')
    const [timeRange, setTimeRange] = useState('30d')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attendanceData, setAttendanceData] = useState<any>(null)

    const fetchAttendance = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await LocationManagerService.getAttendance(timeRange, searchTerm || undefined, filterClass)
            setAttendanceData(result)
        } catch (err: any) {
            console.error('Error fetching attendance:', err)
            setError(err.message || 'Failed to fetch attendance')
            setAttendanceData(null)
        } finally {
            setIsLoading(false)
        }
    }, [timeRange, searchTerm, filterClass])

    useEffect(() => {
        fetchAttendance()
    }, [fetchAttendance])

    const summary = attendanceData?.summary || attendanceData?.statusCounts || {}
    const weeklyTrend = attendanceData?.weeklyTrend || []
    const classAttendance = attendanceData?.classAttendance || []
    const records = attendanceData?.records || attendanceData?.data || []

    const totalEnrolled = summary.totalEnrolled ?? summary.total ?? 0
    const presentToday = summary.presentToday ?? summary.present ?? summary.checked_in ?? 0
    const absentToday = summary.absentToday ?? summary.absent ?? summary.no_show ?? 0
    const avgAttendance = summary.avgAttendance ?? (totalEnrolled > 0 ? Math.round((presentToday / totalEnrolled) * 100) : 0)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
                    <p className="text-gray-600 mt-1">Monitor student attendance records</p>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Enrolled', value: totalEnrolled, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Present Today', value: presentToday, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Absent Today', value: absentToday, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Avg Attendance', value: `${avgAttendance}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, idx) => (
                    <Card key={idx}>
                        <CardContent className="pt-6">
                            <div className={`${stat.bg} p-4 rounded-lg`}>
                                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Attendance Trend Chart */}
            {weeklyTrend.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Weekly Attendance Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="attended" stroke="#3b82f6" name="Attended" strokeWidth={2} />
                                <Line type="monotone" dataKey="rate" stroke="#10b981" name="Attendance %" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Class Attendance */}
            {classAttendance.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance by Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {classAttendance.map((cls: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{cls.name}</p>
                                            <p className="text-xs text-gray-600">{cls.attended}/{cls.enrolled} students</p>
                                        </div>
                                        <Badge variant={cls.rate >= 95 ? 'default' : 'secondary'}>
                                            {cls.rate}%
                                        </Badge>
                                    </div>
                                    <Progress value={cls.rate} className="h-2" />
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search & Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Attendance Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <select data-testid="select-admin-location-attendance-1" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Classes</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="elite">Elite</option>
                        </select>
                    </div>

                    {/* Attendance Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check In</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record: any, idx: number) => (
                                    <tr key={record.id || record._id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{record.studentName || record.personName || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.className || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={record.status === 'checked_in' || record.status === 'present' ? 'default' : 'secondary'}>
                                                {record.status || 'N/A'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">No attendance records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
