'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Users, CheckCircle, XCircle, Clock, Calendar, Download,
    Filter, Search, TrendingUp, Brain, Loader2, RefreshCw, Sparkles, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LocationManagerService } from '@/services/locationManagerService'
import { smartSchedulerService } from '@/services/advancedAIServices'

export default function LocationAttendancePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterClass, setFilterClass] = useState('all')
    const [timeRange, setTimeRange] = useState('30d')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attendanceData, setAttendanceData] = useState<any>(null)
    const [aiPredictions, setAiPredictions] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiPredictions = async () => {
        setAiLoading(true)
        try {
            const result = await smartSchedulerService.predictAttendance({ classId: 'location-all', date: new Date().toISOString() })
            setAiPredictions(result?.data || result)
        } catch (err) {
            console.error('AI attendance prediction unavailable:', err)
        } finally {
            setAiLoading(false)
        }
    }

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
        loadAiPredictions()
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
                        <button id="admin-location-attendance-btn"
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
                    { label: 'Total Enrolled', value: totalEnrolled, icon: Users, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
                    { label: 'Present Today', value: presentToday, icon: CheckCircle, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
                    { label: 'Absent Today', value: absentToday, icon: XCircle, cardBg: 'bg-gradient-to-br from-red-50 to-red-100', iconBg: 'bg-gradient-to-br from-red-500 to-red-600', titleColor: 'text-red-700', valueColor: 'text-red-900' },
                    { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: TrendingUp, cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600', titleColor: 'text-purple-700', valueColor: 'text-purple-900' },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className={`${stat.cardBg} border-0 shadow-sm hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${stat.titleColor}`}>{stat.label}</p>
                                        <p className={`text-3xl font-bold ${stat.valueColor} mt-2`}>{stat.value}</p>
                                    </div>
                                    <div className={`${stat.iconBg} p-2.5 rounded-lg shadow-md`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
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

            {/* AI Attendance Predictions */}
            <Card className="border-purple-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Attendance Predictions</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                        </div>
                        <button onClick={loadAiPredictions} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Analyzing attendance patterns...</p>
                        </div>
                    ) : aiPredictions ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-700 uppercase">No-Show Rate</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">
                                    {Math.round((aiPredictions.classNoShowRate || aiPredictions.noShowProbability || 0.15) * 100)}%
                                </p>
                                <p className="text-xs text-blue-600 mt-1">AI predicted no-show probability</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-semibold text-green-700 uppercase">Overbooking</span>
                                </div>
                                <p className="text-2xl font-bold text-green-900">
                                    +{aiPredictions.recommendedOverbooking || 1}
                                </p>
                                <p className="text-xs text-green-600 mt-1">Recommended overbooking slots</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-700 uppercase">AI Insight</span>
                                </div>
                                <p className="text-sm font-medium text-purple-900">
                                    {aiPredictions.insights || 'Analyzing patterns for better predictions...'}
                                </p>
                                <Badge className="mt-2 bg-purple-100 text-purple-700 text-xs">
                                    {aiPredictions.aiPowered ? 'AI Active' : 'Fallback Mode'}
                                </Badge>
                            </div>
                            {/* Per-student predictions */}
                            {aiPredictions.predictions && Array.isArray(aiPredictions.predictions) && aiPredictions.predictions.length > 0 && (
                                <div className="col-span-full">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        High No-Show Risk Students
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {aiPredictions.predictions
                                            .filter((p: any) => p.noShowProbability > 0.3)
                                            .slice(0, 6)
                                            .map((pred: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-200">
                                                    <span className="text-sm text-gray-700">{pred.studentId}</span>
                                                    <Badge variant="destructive" className="text-xs">
                                                        {Math.round(pred.noShowProbability * 100)}% risk
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">AI predictions unavailable</p>
                            <button onClick={loadAiPredictions} className="mt-2 text-sm text-purple-600 hover:underline">Generate Predictions</button>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                        <select id="select-admin-location-attendance-1" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
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
