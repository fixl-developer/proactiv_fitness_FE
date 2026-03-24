'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// ── Fallback mock data ──────────────────────────────────────────────
const MOCK_RECORDS = [
  { _id: 'att-1', userId: { _id: 'u1', firstName: 'Alice', lastName: 'Wong' }, sessionId: { _id: 's1', name: 'Morning Yoga' }, status: 'present', checkInTime: '2025-10-01T08:05:00Z', date: '2025-10-01' },
  { _id: 'att-2', userId: { _id: 'u2', firstName: 'Bob', lastName: 'Lee' }, sessionId: { _id: 's1', name: 'Morning Yoga' }, status: 'late', checkInTime: '2025-10-01T08:25:00Z', date: '2025-10-01' },
  { _id: 'att-3', userId: { _id: 'u3', firstName: 'Cara', lastName: 'Kim' }, sessionId: { _id: 's2', name: 'HIIT Blast' }, status: 'absent', checkInTime: null, date: '2025-10-01' },
]

const MOCK_STATS = { totalRecords: 3, presentCount: 1, lateCount: 1, absentCount: 1, attendanceRate: 66.7 }

// ── Types ───────────────────────────────────────────────────────────
interface AttendanceRecord {
  _id: string
  userId: any
  sessionId: any
  status: string
  checkInTime: string | null
  date: string
}

interface AttendanceStats {
  totalRecords: number
  presentCount: number
  lateCount: number
  absentCount: number
  attendanceRate: number
}

// ── Component ───────────────────────────────────────────────────────
export default function OperationsAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiFailed, setApiFailed] = useState(false)

  // Filters
  const [dateFilter, setDateFilter] = useState('')
  const [sessionFilter, setSessionFilter] = useState('')

  // Check-in modal
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkInForm, setCheckInForm] = useState({ sessionId: '', userId: '', status: 'present' })
  const [submitting, setSubmitting] = useState(false)

  // ── Load data ───────────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (dateFilter) params.date = dateFilter
      if (sessionFilter) params.sessionId = sessionFilter
      const data = await apiClient.get<any>('/attendance/records', { params })
      const raw = data?.data ?? data
      const list = Array.isArray(raw) ? raw : raw?.records ?? raw?.data ?? []
      setRecords(Array.isArray(list) ? list : [])
      setApiFailed(false)
    } catch (error: any) {
      console.error('Failed to load attendance:', error)
      setRecords(MOCK_RECORDS)
      setApiFailed(true)
    }
  }, [dateFilter, sessionFilter])

  const loadStats = useCallback(async () => {
    try {
      const data = await apiClient.get<any>('/attendance/statistics')
      const raw = data?.data ?? data
      setStats({
        totalRecords: raw?.totalRecords ?? raw?.total ?? 0,
        presentCount: raw?.presentCount ?? raw?.present ?? 0,
        lateCount: raw?.lateCount ?? raw?.late ?? 0,
        absentCount: raw?.absentCount ?? raw?.absent ?? 0,
        attendanceRate: raw?.attendanceRate ?? raw?.rate ?? 0,
      })
    } catch {
      setStats(MOCK_STATS)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadRecords(), loadStats()])
      setLoading(false)
    }
    init()
  }, [loadRecords, loadStats])

  // ── Check-in ──────────────────────────────────────────────────
  const handleCheckIn = async () => {
    if (!checkInForm.sessionId || !checkInForm.userId) {
      toast.error('Session ID and User ID are required')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post('/attendance/check-in', {
        sessionId: checkInForm.sessionId,
        userId: checkInForm.userId,
        status: checkInForm.status,
      })
      toast.success('Check-in recorded successfully')
      setShowCheckIn(false)
      setCheckInForm({ sessionId: '', userId: '', status: 'present' })
      await Promise.all([loadRecords(), loadStats()])
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Check-in failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const userName = (r: AttendanceRecord) => {
    if (typeof r.userId === 'object' && r.userId) return `${r.userId.firstName ?? ''} ${r.userId.lastName ?? ''}`.trim()
    return r.userId ?? '-'
  }
  const sessionName = (r: AttendanceRecord) => {
    if (typeof r.sessionId === 'object' && r.sessionId) return r.sessionId.name ?? r.sessionId._id
    return r.sessionId ?? '-'
  }
  const formatTime = (t: string | null) => {
    if (!t) return '-'
    try { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return t }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
    }
    return map[status] ?? 'bg-gray-100 text-gray-600'
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <button id="btn-admin-operations-attendance-1" onClick={() => setShowCheckIn(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Check In
        </button>
      </div>

      {apiFailed && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm">
          Unable to reach the attendance API. Showing fallback demo data.
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Records', value: stats.totalRecords, icon: ClipboardList, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
            { label: 'Present', value: stats.presentCount, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
            { label: 'Late', value: stats.lateCount, icon: Clock, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
            { label: 'Absent', value: stats.absentCount, icon: XCircle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
            { label: 'Attendance Rate', value: `${stats.attendanceRate ?? 0}%`, icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input id="input-date-admin-operations-attendance"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Session ID</label>
          <input id={`input-text-admin-operations-attendance-${stat}`}
            type="text"
            placeholder="Filter by session ID..."
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button id="btn-admin-operations-attendance-2" onClick={() => { setDateFilter(''); setSessionFilter('') }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50">
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading attendance records...</div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">No attendance records found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Member</th>
                <th className="px-4 py-3 font-medium text-gray-600">Session</th>
                <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 font-medium text-gray-600">Check-In Time</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{userName(r)}</td>
                  <td className="px-4 py-3 text-gray-600">{sessionName(r)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatTime(r.checkInTime)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusBadge(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Record Check-In</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Session ID *</label>
                <input id={`input-text-admin-operations-attendance-${r}`} type="text" value={checkInForm.sessionId} onChange={(e) => setCheckInForm({ ...checkInForm, sessionId: e.target.value })} placeholder="e.g. session-abc123" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">User ID *</label>
                <input id="input-text-admin-operations-attendance" type="text" value={checkInForm.userId} onChange={(e) => setCheckInForm({ ...checkInForm, userId: e.target.value })} placeholder="e.g. user-xyz456" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select id="select-admin-operations-attendance-9" value={checkInForm.status} onChange={(e) => setCheckInForm({ ...checkInForm, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button id="btn-admin-operations-attendance-3" onClick={() => setShowCheckIn(false)} className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button id="btn-admin-operations-attendance-4" onClick={handleCheckIn} disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
                {submitting ? 'Saving...' : 'Check In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
