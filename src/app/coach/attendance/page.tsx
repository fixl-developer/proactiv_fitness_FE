'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, Search, RefreshCw, Check, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { coachService, type AttendanceRosterItem, type AttendanceHistoryItem } from '@/services/modules/coach.service'

type Status = 'present' | 'absent' | 'late' | 'excused'

export default function CoachAttendancePage() {
    const [tab, setTab] = useState<'today' | 'history'>('today')
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState<any[]>([])
    const [roster, setRoster] = useState<AttendanceRosterItem[]>([])
    const [history, setHistory] = useState<AttendanceHistoryItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [savingFor, setSavingFor] = useState<string | null>(null)

    const loadToday = async () => {
        try {
            setLoading(true)
            const data = await coachService.getAttendanceToday()
            setSessions(data.sessions || [])
            setRoster(data.roster || [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load roster')
        } finally {
            setLoading(false)
        }
    }

    const loadHistory = async () => {
        try {
            setLoading(true)
            const data = await coachService.getAttendanceHistory(30)
            setHistory(Array.isArray(data) ? data : [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load history')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (tab === 'today') loadToday()
        else loadHistory()
    }, [tab])

    const markStatus = async (item: AttendanceRosterItem, status: Status) => {
        try {
            setSavingFor(`${item.sessionId}|${item.studentId}`)
            await coachService.markAttendance({
                studentId: item.studentId,
                classId: item.sessionId,
                date: new Date().toISOString().slice(0, 10),
                status,
            })
            toast.success(`${item.studentName} marked ${status}`)
            await loadToday()
        } catch (e: any) {
            toast.error(e?.message || 'Failed to mark')
        } finally {
            setSavingFor(null)
        }
    }

    const filteredRoster = roster.filter(r =>
        !searchTerm || r.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredHistory = history.filter(h =>
        !searchTerm || h.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const statusColor = (s: string) => {
        switch (s) {
            case 'present': return 'bg-green-100 text-green-800'
            case 'absent': return 'bg-red-100 text-red-800'
            case 'late': return 'bg-amber-100 text-amber-800'
            case 'excused': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ClipboardCheck className="w-8 h-8 text-green-600" />
                        <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
                    </div>
                    <p className="text-slate-600 text-sm">Mark today's attendance and review your past records</p>
                </motion.div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setTab('today')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition ${tab === 'today' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                    >
                        Today's Roster
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition ${tab === 'history' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                    >
                        History (30 days)
                    </button>
                </div>

                {/* Search + refresh */}
                <div className="mb-4 flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button
                        onClick={() => tab === 'today' ? loadToday() : loadHistory()}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Today */}
                {tab === 'today' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-3" />
                                <p className="text-slate-600 text-sm">Loading roster...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No sessions scheduled for today</p>
                            </div>
                        ) : filteredRoster.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">No students found</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Session</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredRoster.map((r) => {
                                        const key = `${r.sessionId}|${r.studentId}`
                                        return (
                                            <tr key={key} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.studentName}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{r.sessionTime}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex gap-1">
                                                        {(['present', 'absent', 'late', 'excused'] as Status[]).map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => markStatus(r, s)}
                                                                disabled={savingFor === key}
                                                                title={`Mark ${s}`}
                                                                className={`px-2 py-1 text-xs rounded transition ${r.status === s ? `${statusColor(s)} ring-2 ring-offset-1` : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} disabled:opacity-50`}
                                                            >
                                                                {s.charAt(0).toUpperCase()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* History */}
                {tab === 'history' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-3" />
                                <p className="text-slate-600 text-sm">Loading history...</p>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="p-12 text-center">
                                <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No attendance records yet</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredHistory.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(h.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{h.studentName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(h.status)}`}>{h.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{h.notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
