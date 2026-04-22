'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Calendar, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { BookingService } from '@/services/operationsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Booking {
  id: string
  customerId: string
  programId: string
  sessionId: string
  date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  notes?: string
  createdAt?: string
}

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

  const [formData, setFormData] = useState({
    customerId: '',
    programId: '',
    sessionId: '',
    date: '',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    paymentStatus: 'pending' as 'pending' | 'paid' | 'refunded',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  // Validate form
  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerId) newErrors.customerId = 'Customer ID is required'
    if (!formData.programId) newErrors.programId = 'Program ID is required'
    if (!formData.sessionId) newErrors.sessionId = 'Session ID is required'
    if (!formData.date) newErrors.date = 'Date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
        await BookingService.update(editingId, formData)
        toast.success('Booking updated successfully')
      } else {
        await BookingService.create(formData)
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
      sessionId: booking.sessionId,
      date: booking.date,
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
            <h1 className="text-4xl font-bold text-slate-900">Booking Management</h1>
          </div>
          <p className="text-slate-600">Manage customer bookings and reservations</p>
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Customer ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Program ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Session ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Payment</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{booking.customerId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{booking.programId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{booking.sessionId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
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
          title={editingId ? 'Edit Booking' : 'Add New Booking'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer ID */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Customer ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerId}
                onChange={(e) => {
                  setFormData({ ...formData, customerId: e.target.value })
                  if (errors.customerId) setErrors({ ...errors, customerId: '' })
                }}
                placeholder="e.g., CUST-12345"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.customerId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
            </div>

            {/* Program ID */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Program ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.programId}
                onChange={(e) => {
                  setFormData({ ...formData, programId: e.target.value })
                  if (errors.programId) setErrors({ ...errors, programId: '' })
                }}
                placeholder="e.g., PROG-67890"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.programId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.programId && <p className="mt-1 text-sm text-red-600">{errors.programId}</p>}
            </div>

            {/* Session ID */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Session ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sessionId}
                onChange={(e) => {
                  setFormData({ ...formData, sessionId: e.target.value })
                  if (errors.sessionId) setErrors({ ...errors, sessionId: '' })
                }}
                placeholder="e.g., SESS-11111"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.sessionId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.sessionId && <p className="mt-1 text-sm text-red-600">{errors.sessionId}</p>}
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
              <label className="block text-sm font-medium text-slate-900 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'confirmed' | 'cancelled' | 'completed' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'pending' | 'paid' | 'refunded' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
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
