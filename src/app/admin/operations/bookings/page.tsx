'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// ── Fallback mock data ──────────────────────────────────────────────
const MOCK_BOOKINGS = [
  { _id: 'bk-1', userId: { _id: 'u1', firstName: 'Alice', lastName: 'Wong' }, sessionId: { _id: 's1', name: 'Morning Yoga', date: '2025-10-02T08:00:00Z' }, status: 'confirmed', createdAt: '2025-09-28T10:00:00Z', notes: '' },
  { _id: 'bk-2', userId: { _id: 'u2', firstName: 'Bob', lastName: 'Lee' }, sessionId: { _id: 's2', name: 'HIIT Blast', date: '2025-10-02T10:00:00Z' }, status: 'pending', createdAt: '2025-09-29T14:30:00Z', notes: 'First timer' },
  { _id: 'bk-3', userId: { _id: 'u3', firstName: 'Cara', lastName: 'Kim' }, sessionId: { _id: 's1', name: 'Morning Yoga', date: '2025-10-02T08:00:00Z' }, status: 'cancelled', createdAt: '2025-09-27T09:00:00Z', notes: '' },
]

const MOCK_STATS = { totalBookings: 3, confirmed: 1, pending: 1, cancelled: 1, revenue: 450 }

// ── Types ───────────────────────────────────────────────────────────
interface Booking {
  _id: string
  userId: any
  sessionId: any
  status: string
  createdAt: string
  notes?: string
}

interface BookingStats {
  totalBookings: number
  confirmed: number
  pending: number
  cancelled: number
  revenue?: number
}

// ── Component ───────────────────────────────────────────────────────
export default function OperationsBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiFailed, setApiFailed] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ userId: '', sessionId: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  // ── Load data ───────────────────────────────────────────────────
  const loadBookings = useCallback(async () => {
    try {
      const params: Record<string, any> = { page, limit }
      if (statusFilter) params.status = statusFilter
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const data = await apiClient.get<any>('/bookings', { params })
      const raw = data?.data ?? data
      if (Array.isArray(raw)) {
        setBookings(raw)
        setTotalPages(1)
      } else {
        const list = raw?.bookings ?? raw?.data ?? []
        setBookings(Array.isArray(list) ? list : [])
        setTotalPages(raw?.totalPages ?? raw?.pagination?.totalPages ?? data?.totalPages ?? 1)
      }
      setApiFailed(false)
    } catch (error: any) {
      console.error('Failed to load bookings:', error)
      setBookings(MOCK_BOOKINGS)
      setTotalPages(1)
      setApiFailed(true)
    }
  }, [page, statusFilter, dateFrom, dateTo])

  const loadStats = useCallback(async () => {
    try {
      const data = await apiClient.get<any>('/bookings/statistics')
      const raw = data?.data ?? data
      setStats({
        totalBookings: raw?.totalBookings ?? raw?.total ?? 0,
        confirmed: raw?.confirmed ?? 0,
        pending: raw?.pending ?? 0,
        cancelled: raw?.cancelled ?? 0,
        revenue: raw?.revenue ?? raw?.totalRevenue ?? 0,
      })
    } catch {
      setStats(MOCK_STATS)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadBookings(), loadStats()])
      setLoading(false)
    }
    init()
  }, [loadBookings, loadStats])

  // ── Create booking ────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.userId || !createForm.sessionId) {
      toast.error('User ID and Session ID are required')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post('/bookings', {
        userId: createForm.userId,
        sessionId: createForm.sessionId,
        notes: createForm.notes || undefined,
      })
      toast.success('Booking created successfully')
      setShowCreate(false)
      setCreateForm({ userId: '', sessionId: '', notes: '' })
      await Promise.all([loadBookings(), loadStats()])
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to create booking'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Cancel booking ────────────────────────────────────────────
  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await apiClient.patch(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      await Promise.all([loadBookings(), loadStats()])
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to cancel booking'
      toast.error(msg)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const userName = (b: Booking) => {
    if (typeof b.userId === 'object' && b.userId) return `${b.userId.firstName ?? ''} ${b.userId.lastName ?? ''}`.trim()
    return b.userId ?? '-'
  }
  const sessionName = (b: Booking) => {
    if (typeof b.sessionId === 'object' && b.sessionId) return b.sessionId.name ?? b.sessionId._id
    return b.sessionId ?? '-'
  }
  const sessionDate = (b: Booking) => {
    const d = typeof b.sessionId === 'object' ? b.sessionId?.date : null
    if (!d) return '-'
    try { return new Date(d).toLocaleDateString() } catch { return d }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    }
    return map[status] ?? 'bg-gray-100 text-gray-600'
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <button id="btn-admin-operations-bookings-1" onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Booking
        </button>
      </div>

      {apiFailed && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm">
          Unable to reach the bookings API. Showing fallback demo data.
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
            { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
            { label: 'Revenue', value: stats.revenue != null ? `$${stats.revenue}` : '-', icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
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
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select id="select-admin-operations-bookings-12" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input id={`input-date-admin-operations-bookings-${stat}`} type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input id="input-date-admin-operations-bookings" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button id="btn-admin-operations-bookings-2" onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50">
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">No bookings found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Member</th>
                <th className="px-4 py-3 font-medium text-gray-600">Session</th>
                <th className="px-4 py-3 font-medium text-gray-600">Session Date</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600">Booked On</th>
                <th className="px-4 py-3 font-medium text-gray-600">Notes</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{userName(b)}</td>
                  <td className="px-4 py-3 text-gray-600">{sessionName(b)}</td>
                  <td className="px-4 py-3 text-gray-600">{sessionDate(b)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusBadge(b.status)}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{b.notes || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button id="btn-admin-operations-bookings-3" onClick={() => handleCancel(b._id)} className="text-red-600 hover:text-red-800 font-medium text-sm">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button id="btn-admin-operations-bookings-4" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button id="btn-admin-operations-bookings-5" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">New Booking</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">User ID *</label>
                <input id="input-text-admin-operations-bookings" type="text" value={createForm.userId} onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })} placeholder="e.g. user-xyz456" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Session ID *</label>
                <input id="input-text-admin-operations-bookings" type="text" value={createForm.sessionId} onChange={(e) => setCreateForm({ ...createForm, sessionId: e.target.value })} placeholder="e.g. session-abc123" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} rows={3} placeholder="Optional notes..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button id="btn-admin-operations-bookings-6" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button id="btn-admin-operations-bookings-7" onClick={handleCreate} disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
