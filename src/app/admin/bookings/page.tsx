'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, RefreshCw, Eye, Trash2, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Booking {
    id: string
    _id?: string
    studentName?: string
    student?: { firstName?: string; lastName?: string; name?: string }
    programName?: string
    program?: { name?: string }
    locationName?: string
    location?: { name?: string }
    coachName?: string
    coach?: { firstName?: string; lastName?: string; name?: string }
    date?: string
    startTime?: string
    endTime?: string
    status: string
    createdAt?: string
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 20

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true)
            const params: Record<string, string | number> = { page, limit }
            if (statusFilter !== 'all') params.status = statusFilter
            if (searchTerm) params.search = searchTerm

            const response = await apiClient.get<any>('/bookings', { params })
            const list = response?.bookings || response?.data || (Array.isArray(response) ? response : [])
            const totalCount = response?.total ?? response?.meta?.total ?? list.length
            const pages = response?.totalPages ?? response?.meta?.totalPages ?? Math.ceil(totalCount / limit)

            setBookings(list)
            setTotal(totalCount)
            setTotalPages(pages)
        } catch (error: any) {
            console.error('Failed to load bookings:', error)
            if (error?.response?.status !== 404) {
                toast.error('Failed to load bookings')
            }
            setBookings([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter, searchTerm])

    useEffect(() => {
        loadBookings()
    }, [loadBookings])

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return
        try {
            await apiClient.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' })
            toast.success('Booking cancelled successfully')
            loadBookings()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to cancel booking')
        }
    }

    const handleDelete = async (bookingId: string) => {
        if (!confirm('Are you sure you want to delete this booking? This cannot be undone.')) return
        try {
            await apiClient.delete(`/bookings/${bookingId}`)
            toast.success('Booking deleted successfully')
            loadBookings()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete booking')
        }
    }

    const getStudentName = (b: Booking) => {
        if (b.studentName) return b.studentName
        if (b.student?.name) return b.student.name
        if (b.student?.firstName) return `${b.student.firstName} ${b.student.lastName || ''}`.trim()
        return 'N/A'
    }

    const getProgramName = (b: Booking) => b.programName || b.program?.name || 'N/A'
    const getLocationName = (b: Booking) => b.locationName || b.location?.name || 'N/A'
    const getCoachName = (b: Booking) => {
        if (b.coachName) return b.coachName
        if (b.coach?.name) return b.coach.name
        if (b.coach?.firstName) return `${b.coach.firstName} ${b.coach.lastName || ''}`.trim()
        return 'N/A'
    }

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            'no-show': 'bg-gray-100 text-gray-800',
        }
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
    }

    const confirmedCount = bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length
    const pendingCount = bookings.filter(b => b.status?.toLowerCase() === 'pending').length
    const cancelledCount = bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
                    <p className="text-gray-600 mt-1">View and manage all bookings</p>
                </div>
                <button
                    onClick={() => loadBookings()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Bookings', value: total, icon: Calendar, bg: 'from-blue-50 to-blue-100' },
                    { title: 'Confirmed', value: confirmedCount, icon: CheckCircle, bg: 'from-green-50 to-emerald-100' },
                    { title: 'Pending', value: pendingCount, icon: Clock, bg: 'from-yellow-50 to-yellow-100' },
                    { title: 'Cancelled', value: cancelledCount, icon: XCircle, bg: 'from-red-50 to-red-100' },
                ].map((stat, idx) => (
                    <div key={idx} className={`rounded-lg bg-gradient-to-br ${stat.bg} p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-4">Loading bookings...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coach</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id || booking._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getStudentName(booking)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {getProgramName(booking)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {getLocationName(booking)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {getCoachName(booking)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>
                                                {booking.date ? new Date(booking.date).toLocaleDateString() : '-'}
                                            </div>
                                            {booking.startTime && (
                                                <div className="text-xs text-gray-400">
                                                    {booking.startTime}{booking.endTime ? ` - ${booking.endTime}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {booking.status?.toLowerCase() !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(booking.id || booking._id || '')}
                                                        className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded transition"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(booking.id || booking._id || '')}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {bookings.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No bookings found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {total > 0 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
                    <div className="text-sm text-gray-700">
                        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
