'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Calendar, TrendingUp, LogIn, LogOut, AlertCircle, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { attendanceService } from '@/services/modules/attendance.service'

interface AttendanceRecord {
    _id: string
    date: string
    checkInTime: string
    checkOutTime?: string
    duration: string
    status: 'present' | 'absent' | 'late'
}

interface AttendanceStats {
    totalDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    attendancePercentage: number
}

export default function AttendancePage() {
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [checkInTime, setCheckInTime] = useState<string | null>(null)
    const [currentDuration, setCurrentDuration] = useState('00:00:00')
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
    const [stats, setStats] = useState<AttendanceStats>({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

    // Fetch attendance data on mount
    useEffect(() => {
        fetchAttendanceData()
    }, [])

    // Duration timer
    useEffect(() => {
        if (!isCheckedIn) return

        const interval = setInterval(() => {
            if (checkInTime) {
                const now = new Date()
                const checkIn = new Date(checkInTime)
                const diff = Math.floor((now.getTime() - checkIn.getTime()) / 1000)

                const hours = Math.floor(diff / 3600)
                const minutes = Math.floor((diff % 3600) / 60)
                const seconds = diff % 60

                setCurrentDuration(
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                )
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isCheckedIn, checkInTime])

    const fetchAttendanceData = async () => {
        try {
            setLoading(true)
            const [historyRes, statsRes] = await Promise.all([
                attendanceService.getHistory(),
                attendanceService.getStats()
            ])

            if (historyRes.success) {
                setAttendanceRecords(historyRes.data || [])
            }
            if (statsRes.success) {
                setStats(statsRes.data)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch attendance data')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckIn = async () => {
        try {
            const now = new Date()
            setCheckInTime(now.toISOString())
            setIsCheckedIn(true)

            // Call backend
            const res = await attendanceService.checkIn()
            if (!res.success) {
                setError(res.error || 'Check-in failed')
                setIsCheckedIn(false)
            }
        } catch (err: any) {
            setError(err.message || 'Check-in failed')
            setIsCheckedIn(false)
        }
    }

    const handleCheckOut = async () => {
        try {
            if (checkInTime) {
                const checkIn = new Date(checkInTime)
                const checkOut = new Date()
                const durationMs = checkOut.getTime() - checkIn.getTime()
                const durationMinutes = Math.floor(durationMs / 60000)
                const hours = Math.floor(durationMinutes / 60)
                const minutes = durationMinutes % 60

                // Call backend
                const res = await attendanceService.checkOut()
                if (res.success) {
                    const newRecord: AttendanceRecord = {
                        _id: res.data._id,
                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                        checkInTime: checkIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        checkOutTime: checkOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        duration: `${hours}h ${minutes}m`,
                        status: 'present'
                    }

                    setAttendanceRecords([newRecord, ...attendanceRecords])
                    setIsCheckedIn(false)
                    setCheckInTime(null)
                    setCurrentDuration('00:00:00')

                    // Refresh stats
                    await fetchAttendanceData()
                } else {
                    setError(res.error || 'Check-out failed')
                }
            }
        } catch (err: any) {
            setError(err.message || 'Check-out failed')
        }
    }

    const handleDownloadReport = () => {
        const csvContent = [
            ['Date', 'Check-in', 'Check-out', 'Duration', 'Status'],
            ...attendanceRecords.map(r => [r.date, r.checkInTime, r.checkOutTime || '--', r.duration, r.status])
        ]
            .map(row => row.join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-report-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading attendance data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-gray-600 mt-2 text-sm font-medium">Track your check-ins and attendance records</p>
            </div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-semibold text-sm">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Today's Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Today's Status</h2>
                            <p className="text-gray-600 text-sm mt-1 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-semibold text-sm ${isCheckedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {isCheckedIn ? '✓ Checked In' : '○ Not Checked In'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Check-in Time */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                                <LogIn className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-semibold text-gray-700">Check-in Time</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {checkInTime ? new Date(checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">Duration</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 font-mono">{currentDuration}</p>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                <span className="text-sm font-semibold text-gray-700">Status</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {isCheckedIn ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleCheckIn}
                            disabled={isCheckedIn}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Check In
                        </Button>
                        <Button
                            onClick={handleCheckOut}
                            disabled={!isCheckedIn}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Check Out
                        </Button>
                    </div>
                </Card>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
                {/* Total Days */}
                <Card className="p-4 border-gray-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700 font-semibold">Total Days</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDays}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                {/* Present Days */}
                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Present</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.presentDays}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </Card>

                {/* Absent Days */}
                <Card className="p-4 border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-semibold">Absent</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">{stats.absentDays}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </Card>

                {/* Late Days */}
                <Card className="p-4 border-yellow-200/50 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-semibold">Late</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.lateDays}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </Card>

                {/* Attendance % */}
                <Card className="p-4 border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-700 font-semibold">Attendance %</p>
                            <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.attendancePercentage}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                </Card>
            </motion.div>

            {/* Attendance History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Check-ins</h2>
                        <Button
                            onClick={handleDownloadReport}
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200/50">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Check-in</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Check-out</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Duration</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.length > 0 ? (
                                    attendanceRecords.map((record, index) => (
                                        <motion.tr
                                            key={record._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{record.date}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{record.checkInTime}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">{record.checkOutTime || '--:--'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{record.duration}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'present'
                                                    ? 'bg-green-100 text-green-700'
                                                    : record.status === 'late'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 px-4 text-center text-gray-500 font-medium">
                                            No attendance records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
