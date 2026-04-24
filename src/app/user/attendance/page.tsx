'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle2, Clock, Calendar, TrendingUp, AlertCircle, Download, Flame, RefreshCw, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { apiClient } from '@/services/api/client'
import { attendanceService } from '@/services/modules/attendance.service'
import { validateTextArea } from '@/utils/validation'
import { toast } from 'sonner'

interface AttendanceRecord {
    _id: string
    id?: string
    date: string
    className?: string
    coach?: string
    program?: string
    status: 'present' | 'absent' | 'late' | 'excused'
    checkInTime?: string
    checkOutTime?: string
    duration?: string
}

interface AttendanceSummary {
    totalAttended: number
    attendancePercentage: number
    currentStreak: number
    longestStreak: number
}

type DatePreset = 'this-week' | 'this-month' | 'last-3-months' | 'custom'

function formatDateISO(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function computeRangeFromPreset(preset: DatePreset, custom?: { from: string; to: string }): { from: string; to: string } {
    const now = new Date()
    const to = new Date(now)
    to.setHours(23, 59, 59, 999)
    let from = new Date(now)
    if (preset === 'this-week') {
        from.setDate(now.getDate() - now.getDay()) // Sunday
    } else if (preset === 'this-month') {
        from = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (preset === 'last-3-months') {
        from = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    } else if (preset === 'custom') {
        return {
            from: custom?.from || formatDateISO(new Date(now.getFullYear(), 0, 1)),
            to: custom?.to || formatDateISO(to),
        }
    }
    from.setHours(0, 0, 0, 0)
    return { from: formatDateISO(from), to: formatDateISO(to) }
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [summary, setSummary] = useState<AttendanceSummary>({
        totalAttended: 0,
        attendancePercentage: 0,
        currentStreak: 0,
        longestStreak: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [datePreset, setDatePreset] = useState<DatePreset>('this-month')
    const [customRange, setCustomRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [programFilter, setProgramFilter] = useState<string>('all')

    const [excuseDrawer, setExcuseDrawer] = useState<AttendanceRecord | null>(null)
    const [excuseReason, setExcuseReason] = useState('')
    const [excuseError, setExcuseError] = useState<string | null>(null)
    const [submittingExcuse, setSubmittingExcuse] = useState(false)

    const effectiveRange = useMemo(() => {
        return computeRangeFromPreset(datePreset, customRange)
    }, [datePreset, customRange])

    const computeSummaryFromList = (list: AttendanceRecord[]): AttendanceSummary => {
        const attended = list.filter(r => r.status === 'present' || r.status === 'late').length
        const total = list.length
        const pct = total > 0 ? Math.round((attended / total) * 100) : 0
        // Streaks from chronologically-sorted list
        const sorted = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        let current = 0, longest = 0, run = 0
        sorted.forEach(r => {
            if (r.status === 'present' || r.status === 'late') {
                run += 1
                if (run > longest) longest = run
            } else {
                run = 0
            }
        })
        // current streak = tail run
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (sorted[i].status === 'present' || sorted[i].status === 'late') current += 1
            else break
        }
        return { totalAttended: attended, attendancePercentage: pct, currentStreak: current, longestStreak: longest }
    }

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const { from, to } = effectiveRange

            // Primary: /user/attendance?from=&to=
            let list: AttendanceRecord[] = []
            try {
                const res: any = await apiClient.get(`/user/attendance?from=${from}&to=${to}`)
                list = (res?.data || res || []) as AttendanceRecord[]
                if (!Array.isArray(list)) list = []
            } catch {
                // Fallback to existing attendanceService.getHistory()
                const res: any = await attendanceService.getHistory(100)
                if (res?.success) list = (res.data || []) as AttendanceRecord[]
            }

            // Fallback: if range filtering didn't apply server-side, filter client-side when date parses
            const fromTs = new Date(from).getTime()
            const toTs = new Date(to).getTime()
            const filtered = list.filter(r => {
                const t = new Date(r.date).getTime()
                if (isNaN(t)) return true
                return t >= fromTs && t <= toTs
            })

            setRecords(filtered)

            // Summary: try /user/attendance/summary first, else compute client-side
            try {
                const summaryRes: any = await apiClient.get(`/user/attendance/summary?from=${from}&to=${to}`)
                const data = summaryRes?.data || summaryRes
                if (data && typeof data === 'object') {
                    setSummary({
                        totalAttended: data.totalAttended ?? data.presentDays ?? 0,
                        attendancePercentage: data.attendancePercentage ?? 0,
                        currentStreak: data.currentStreak ?? 0,
                        longestStreak: data.longestStreak ?? 0,
                    })
                } else {
                    setSummary(computeSummaryFromList(filtered))
                }
            } catch {
                setSummary(computeSummaryFromList(filtered))
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to load attendance')
            setRecords([])
        } finally {
            setLoading(false)
        }
    }, [effectiveRange])

    useEffect(() => {
        // Only refetch with API params when preset changes OR custom dates complete
        if (datePreset !== 'custom' || (customRange.from && customRange.to)) {
            fetchData()
        }
    }, [fetchData, datePreset, customRange.from, customRange.to])

    const programs = useMemo(() => {
        const set = new Set<string>()
        records.forEach(r => { if (r.program) set.add(r.program) })
        return Array.from(set)
    }, [records])

    const visible = useMemo(() => {
        return records.filter(r => {
            if (statusFilter !== 'all' && r.status !== statusFilter) return false
            if (programFilter !== 'all' && r.program !== programFilter) return false
            return true
        })
    }, [records, statusFilter, programFilter])

    const getStatusStyles = (s: string) => {
        switch (s) {
            case 'present': return 'bg-green-100 text-green-700'
            case 'late': return 'bg-yellow-100 text-yellow-700'
            case 'absent': return 'bg-red-100 text-red-700'
            case 'excused': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const handleDownloadReport = () => {
        const csvContent = [
            ['Date', 'Class', 'Coach', 'Status', 'Check-in'],
            ...visible.map(r => [r.date, r.className || '-', r.coach || '-', r.status, r.checkInTime || '-']),
        ]
            .map(row => row.join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-report-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const openExcuseDrawer = (record: AttendanceRecord) => {
        setExcuseDrawer(record)
        setExcuseReason('')
        setExcuseError(null)
    }

    const handleSubmitExcuse = async () => {
        if (!excuseDrawer) return
        const err = validateTextArea(excuseReason, 'Reason', 10, 500)
        if (err) {
            setExcuseError(err)
            return
        }
        const id = excuseDrawer._id || excuseDrawer.id
        if (!id) return
        try {
            setSubmittingExcuse(true)
            await apiClient.post(`/user/attendance/${id}/excuse`, {
                date: excuseDrawer.date,
                reason: excuseReason,
            })
            toast.success('Excuse request submitted.')
            setRecords(prev => prev.map(r => (r._id === id ? { ...r, status: 'excused' } : r)))
            setExcuseDrawer(null)
        } catch {
            toast.error('Unable to submit excuse request.')
        } finally {
            setSubmittingExcuse(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">Review your attendance history and trends</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleDownloadReport}
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                    </Button>
                </div>
            </div>

            {/* Error */}
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

            {/* Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Classes Attended</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalAttended}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>
                <Card className="p-4 border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-700 font-semibold">Attendance %</p>
                            <p className="text-2xl font-bold text-emerald-900 mt-1">{summary.attendancePercentage}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                </Card>
                <Card className="p-4 border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-700 font-semibold">Current Streak</p>
                            <p className="text-2xl font-bold text-orange-900 mt-1">{summary.currentStreak}</p>
                        </div>
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                </Card>
                <Card className="p-4 border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-semibold">Longest Streak</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">{summary.longestStreak}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-purple-500" />
                    </div>
                </Card>
            </motion.div>

            {/* Filters */}
            <Card className="p-4 border-gray-200/50">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {([
                            { key: 'this-week', label: 'This Week' },
                            { key: 'this-month', label: 'This Month' },
                            { key: 'last-3-months', label: 'Last 3 Months' },
                            { key: 'custom', label: 'Custom' },
                        ] as { key: DatePreset; label: string }[]).map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setDatePreset(opt.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${datePreset === opt.key ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        {datePreset === 'custom' && (
                            <div className="flex items-center gap-2 ml-2">
                                <input
                                    type="date"
                                    value={customRange.from}
                                    onChange={(e) => setCustomRange(r => ({ ...r, from: e.target.value }))}
                                    className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                                />
                                <span className="text-gray-500 text-sm">to</span>
                                <input
                                    type="date"
                                    value={customRange.to}
                                    onChange={(e) => setCustomRange(r => ({ ...r, to: e.target.value }))}
                                    className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                            <option value="excused">Excused</option>
                        </select>
                        <select
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                        >
                            <option value="all">All Programs</option>
                            {programs.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Records Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance Records</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="text-center py-10">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No attendance records for the selected filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Class</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Coach</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Check-in</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((record, index) => (
                                        <motion.tr
                                            key={record._id || record.id || index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.02 }}
                                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{record.date}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">{record.className || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{record.coach || '-'}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={getStatusStyles(record.status)}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                                    {record.checkInTime || '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {record.status === 'absent' && (
                                                    <Button variant="outline" size="sm" onClick={() => openExcuseDrawer(record)}>
                                                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                                        Request Excuse
                                                    </Button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Request Excuse Drawer */}
            <SlideInDrawer
                isOpen={!!excuseDrawer}
                onClose={() => !submittingExcuse && setExcuseDrawer(null)}
                title="Request Excuse"
                description={excuseDrawer ? `For ${excuseDrawer.date}${excuseDrawer.className ? ' • ' + excuseDrawer.className : ''}` : undefined}
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setExcuseDrawer(null)} disabled={submittingExcuse}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitExcuse} disabled={submittingExcuse}>
                            {submittingExcuse ? 'Submitting…' : 'Submit Excuse'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="text"
                            readOnly
                            value={excuseDrawer?.date || ''}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={excuseReason}
                            onChange={(e) => { setExcuseReason(e.target.value); if (excuseError) setExcuseError(null) }}
                            maxLength={500}
                            rows={5}
                            placeholder="Explain your reason for absence (at least 10 characters)"
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-sm resize-none ${excuseError ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'}`}
                        />
                        <div className="flex justify-between mt-1">
                            {excuseError ? (
                                <p className="text-xs text-red-600">{excuseError}</p>
                            ) : <span className="text-xs text-gray-400">Minimum 10 characters</span>}
                            <span className="text-xs text-gray-400">{excuseReason.length}/500</span>
                        </div>
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
