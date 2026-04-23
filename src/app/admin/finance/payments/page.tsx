'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, DollarSign, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { PaymentService } from '@/services/financeService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Payment {
  id: string
  transactionId: string
  amount: number
  currency: string
  paymentMethod: string
  gateway: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  description?: string
  customerId: string
  metadata?: any
  createdAt?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [refundingId, setRefundingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    transactionId: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'card',
    gateway: 'stripe',
    status: 'pending',
    description: '',
    customerId: '',
    metadata: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const currencies = ['USD', 'EUR', 'GBP', 'AED', 'HKD', 'JPY', 'AUD', 'CAD', 'SGD', 'CNY']
  const paymentMethods = ['card', 'cash', 'bank_transfer', 'wallet']
  const gateways = ['stripe', 'paypay', 'manual']
  const statuses = ['pending', 'completed', 'failed', 'refunded']

  // Load payments
  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await PaymentService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setPayments(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [currentPage, searchTerm])

  // Validate form
  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.transactionId) newErrors.transactionId = 'Transaction ID is required'
    if (!formData.amount) newErrors.amount = 'Amount is required'
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0'

    if (!formData.currency) newErrors.currency = 'Currency is required'
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'
    if (!formData.gateway) newErrors.gateway = 'Gateway is required'
    if (!formData.status) newErrors.status = 'Status is required'
    if (!formData.customerId) newErrors.customerId = 'Customer ID is required'

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

      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        metadata: formData.metadata ? JSON.parse(formData.metadata) : undefined,
      }

      if (editingId) {
        await PaymentService.update(editingId, submitData)
        toast.success('Payment updated successfully')
      } else {
        await PaymentService.create(submitData)
        toast.success('Payment created successfully')
      }

      setShowForm(false)
      resetForm()
      loadPayments()
    } catch (error) {
      console.error('Error saving payment:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (payment: Payment) => {
    setFormData({
      transactionId: payment.transactionId,
      amount: payment.amount.toString(),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      gateway: payment.gateway,
      status: payment.status,
      description: payment.description || '',
      customerId: payment.customerId,
      metadata: payment.metadata ? JSON.stringify(payment.metadata) : '',
    })
    setEditingId(payment.id)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await PaymentService.delete(id)
      toast.success('Payment deleted successfully')
      setDeleteConfirm(null)
      loadPayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Handle refund
  const handleRefund = async (transactionId: string) => {
    try {
      setRefundingId(transactionId)
      await PaymentService.refund(transactionId, {})
      toast.success('Refund processed successfully')
      setRefundingId(null)
      loadPayments()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error(getErrorMessage(error))
      setRefundingId(null)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      transactionId: '',
      amount: '',
      currency: 'USD',
      paymentMethod: 'card',
      gateway: 'stripe',
      status: 'pending',
      description: '',
      customerId: '',
      metadata: '',
    })
    setErrors({})
    setEditingId(null)
  }

  // Handle close drawer
  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
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
            <DollarSign className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Payment Management</h1>
          </div>
          <p className="text-slate-600">Manage all payment transactions and refunds</p>
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
              placeholder="Search by transaction ID or customer..."
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
            Add Payment
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
              <p className="mt-4 text-slate-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No payments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Method</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Gateway</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{payment.transactionId}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {payment.amount.toFixed(2)} {payment.currency}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{payment.paymentMethod}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium capitalize">
                            {payment.gateway}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            {payment.status === 'completed' && (
                              <button
                                onClick={() => handleRefund(payment.transactionId)}
                                disabled={refundingId === payment.transactionId}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded transition disabled:opacity-50"
                                title="Refund Payment"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(payment)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(payment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
          title={editingId ? 'Edit Payment' : 'Add New Payment'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => {
                  setFormData({ ...formData, transactionId: e.target.value })
                  if (errors.transactionId) setErrors({ ...errors, transactionId: '' })
                }}
                placeholder="e.g., TXN-2024-001"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.transactionId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.transactionId && <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value })
                  if (errors.amount) setErrors({ ...errors, amount: '' })
                }}
                placeholder="0.00"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => {
                  setFormData({ ...formData, currency: e.target.value })
                  if (errors.currency) setErrors({ ...errors, currency: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.currency ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => {
                  setFormData({ ...formData, paymentMethod: e.target.value })
                  if (errors.paymentMethod) setErrors({ ...errors, paymentMethod: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.paymentMethod ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
            </div>

            {/* Gateway */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Gateway <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gateway}
                onChange={(e) => {
                  setFormData({ ...formData, gateway: e.target.value })
                  if (errors.gateway) setErrors({ ...errors, gateway: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.gateway ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Gateway</option>
                {gateways.map((gateway) => (
                  <option key={gateway} value={gateway}>
                    {gateway.toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.gateway && <p className="mt-1 text-sm text-red-600">{errors.gateway}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value })
                  if (errors.status) setErrors({ ...errors, status: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>

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
                placeholder="e.g., CUST-001"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.customerId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional payment description"
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Metadata */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Metadata (JSON)</label>
              <textarea
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">Optional JSON metadata for additional information</p>
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
                {submitting ? 'Saving...' : editingId ? 'Update Payment' : 'Create Payment'}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Payment?</h3>
              <p className="text-slate-600 mb-6">
                This action cannot be undone. The payment record will be permanently deleted.
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
