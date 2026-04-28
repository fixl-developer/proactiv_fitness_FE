'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Calendar, XCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { BookingService } from '@/services/operationsService'
import { apiClient } from '@/services/api/client'
import { extractList } from '@/utils/apiResponse'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
  validateRequired,
  validateSelect,
  validateTextArea,
} from '@/utils/validation'

// Backend session IDs are 24-char hex Mongo ObjectIds — only validated when supplied
const MONGO_ID_PATTERN = /^[a-f\d]{24}$/i

interface Booking {
  id: string
  customerId: string
  customerName?: string
  programId: string
  programName?: string
  sessionId: string
  date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  notes?: string
  createdAt?: string
}

interface CustomerOption {
  id: string
  name: string
  email: string
}

interface ProgramOption {
  id: string
  name: string
}

const BOOKING_TYPES: { value: string; label: string }[] = [
  { value: 'drop_in', label: 'Drop-in / Class' },
  { value: 'trial', label: 'Trial' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'term_enrollment', label: 'Term Enrollment' },
  { value: 'private_lesson', label: 'Private Lesson' },
  { value: 'camp', label: 'Camp' },
  { value: 'event', label: 'Event' },
  { value: 'party', label: 'Party' },
  { value: 'makeup', label: 'Makeup' },
]

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [programs, setPrograms] = useState<ProgramOption[]>([])

  const [formData, setFormData] = useState({
    customerId: '',
    programId: '',
    sessionId: '',
    date: '',
    bookingType: 'drop_in',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    paymentStatus: 'pending' as 'pending' | 'paid' | 'refunded',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load customers + programs once for the create/edit drawer dropdowns
  useEffect(() => {
    ;(async () => {
      try {
        const [usersRes, programsRes] = await Promise.all([
          apiClient.get<any>('/users', { params: { limit: 200 } }),
          apiClient.get<any>('/programs', { params: { limit: 200 } }),
        ])

        // Customers = end users + parents only. Showing admins/coaches/managers
        // here would let an admin "book" themselves, which isn't the intent of
        // a manual customer reservation.
        const userList = extractList<any>(usersRes)
        const customerRoles = new Set(['USER', 'PARENT', 'CUSTOMER'])
        setCustomers(
          userList
            .filter((u: any) => customerRoles.has(String(u.role || '').toUpperCase()))
            .map((u: any) => ({
              id: u.id || u._id,
              name: u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
              email: u.email,
            }))
            .filter((c: any) => c.id),
        )

        const progList = extractList<any>(programsRes)
        setPrograms(
          progList.map((p: any) => ({
            id: p.id || p._id,
            name: p.name || p.title || p.programName || 'Untitled program',
          })).filter((p: any) => p.id),
        )
      } catch (error) {
        console.error('Failed to load customers/programs:', error)
      }
    })()
  }, [])

  // Load bookings
  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await BookingService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setBookings(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [currentPage, searchTerm])

  // Validate form using shared validators per field
  const validateFormData = () => {
    const e: Record<string, string> = {}

    const customerErr = validateSelect(formData.customerId, 'Customer')
    if (customerErr) e.customerId = customerErr

    const programErr = validateSelect(formData.programId, 'Program')
    if (programErr) e.programId = programErr

    const typeErr = validateSelect(formData.bookingType, 'Booking type')
    if (typeErr) e.bookingType = typeErr

    const dateErr = validateRequired(formData.date, 'Date')
    if (dateErr) e.date = dateErr
    else {
      const d = new Date(formData.date)
      if (isNaN(d.getTime())) e.date = 'Please enter a valid date'
    }

    const statusErr = validateSelect(formData.status, 'Status')
    if (statusErr) e.status = statusErr

    const paymentErr = validateSelect(formData.paymentStatus, 'Payment status')
    if (paymentErr) e.paymentStatus = paymentErr

    if (formData.sessionId && !MONGO_ID_PATTERN.test(formData.sessionId.trim())) {
      e.sessionId = 'Session ID must be a 24-character Mongo ObjectId, or leave blank'
    }

    if (formData.notes) {
      const notesErr = validateTextArea(formData.notes, 'Notes', 0, 1000)
      if (notesErr) e.notes = notesErr
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFormData()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        await BookingService.update(editingId, formData as any)
        toast.success('Booking updated successfully')
      } else {
        await BookingService.create(formData as any)
        toast.success('Booking created successfully')
      }

      setShowForm(false)
      resetForm()
      loadBookings()
    } catch (error) {
      console.error('Error saving booking:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (booking: Booking) => {
    setFormData({
      customerId: booking.customerId,
      programId: booking.programId,
      sessionId: booking.sessionId || '',
      date: booking.date ? new Date(booking.date).toISOString().slice(0, 10) : '',
      bookingType: (booking as any).bookingType || 'drop_in',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes || '',
    })
    setEditingId(booking.id)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await BookingService.delete(id)
      toast.success('Booking deleted successfully')
      setDeleteConfirm(null)
      loadBookings()
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Handle cancel booking
  const handleCancelBooking = async (id: string) => {
    try {
      await BookingService.cancel(id)
      toast.success('Booking cancelled successfully')
      loadBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      customerId: '',
      programId: '',
      sessionId: '',
      date: '',
      bookingType: 'drop_in',
      status: 'pending',
      paymentStatus: 'pending',
      notes: '',
    })
    setErrors({})
    setEditingId(null)
  }

  // Handle close drawer
  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (raw: string) => {
    if (!raw) return '-'
    const d = new Date(raw)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Manual Bookings</h1>
          </div>
          <p className="text-slate-600">Walk-in &amp; phone bookings — record reservations on behalf of customers who can&apos;t book online.</p>

          {/* Channel-purpose callout — clarifies this page vs. the public Book Now flow */}
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 space-y-1">
              <p><strong>When to use this page:</strong> walk-in customers, phone bookings, VIP/internal reservations, or fixing a botched online booking.</p>
              <p><strong>Customers should self-book:</strong> direct them to the public <code className="px-1 py-0.5 bg-white rounded text-blue-700">/book-now</code> page or their parent dashboard — every booking made there shows up here too.</p>
              <p><strong>No slots available?</strong> Sessions only appear after admin <em>generates &amp; publishes</em> a schedule under <code className="px-1 py-0.5 bg-white rounded text-blue-700">Programs &amp; Scheduling → Schedule</code>.</p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex gap-4 items-center"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Booking
          </button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No bookings found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Program</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Payment</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {booking.customerName || booking.customerId || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {booking.programName || (booking.programId ? `${String(booking.programId).slice(0, 8)}…` : '-')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(booking.date)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                                title="Cancel Booking"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(booking.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Form Drawer */}
        <SlideInDrawer
          isOpen={showForm}
          onClose={handleCloseDrawer}
          title={editingId ? 'Edit Booking' : 'Manual Booking — on behalf of customer'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => {
                  setFormData({ ...formData, customerId: e.target.value })
                  if (errors.customerId) setErrors({ ...errors, customerId: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.customerId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `— ${c.email}` : ''}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
              {!errors.customerId && customers.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">No users found — add a user first under User Management</p>
              )}
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Program <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.programId}
                onChange={(e) => {
                  setFormData({ ...formData, programId: e.target.value })
                  if (errors.programId) setErrors({ ...errors, programId: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.programId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.programId && <p className="mt-1 text-sm text-red-600">{errors.programId}</p>}
              {!errors.programId && programs.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">No programs found — add one in Programs & Scheduling</p>
              )}
            </div>

            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Booking Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bookingType}
                onChange={(e) => {
                  setFormData({ ...formData, bookingType: e.target.value })
                  if (errors.bookingType) setErrors({ ...errors, bookingType: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.bookingType ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select booking type</option>
                {BOOKING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.bookingType && <p className="mt-1 text-sm text-red-600">{errors.bookingType}</p>}
            </div>

            {/* Session ID (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Session ID <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={formData.sessionId}
                maxLength={24}
                onChange={(e) => {
                  // Only allow hex chars while typing (Mongo ObjectId is 24 hex chars)
                  const v = e.target.value.replace(/[^a-fA-F0-9]/g, '').toLowerCase()
                  setFormData({ ...formData, sessionId: v })
                  if (errors.sessionId) setErrors({ ...errors, sessionId: '' })
                }}
                placeholder="24-character Mongo Session ID — leave blank if not assigning a specific session"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.sessionId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              />
              {errors.sessionId
                ? <p className="mt-1 text-sm text-red-600">{errors.sessionId}</p>
                : <p className="mt-1 text-xs text-slate-500">Only set this if you have a real 24-char ObjectId from the schedule (a-f, 0-9 only)</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value })
                  if (errors.date) setErrors({ ...errors, date: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value as any })
                  if (errors.status) setErrors({ ...errors, status: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Payment Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => {
                  setFormData({ ...formData, paymentStatus: e.target.value as any })
                  if (errors.paymentStatus) setErrors({ ...errors, paymentStatus: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.paymentStatus ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select payment status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
              {errors.paymentStatus && <p className="mt-1 text-sm text-red-600">{errors.paymentStatus}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value })
                  if (errors.notes) setErrors({ ...errors, notes: '' })
                }}
                placeholder="Optional notes..."
                rows={4}
                maxLength={1000}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              />
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Booking' : 'Create Booking'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Booking?</h3>
              <p className="text-slate-600 mb-6">
                This action cannot be undone. The booking will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
