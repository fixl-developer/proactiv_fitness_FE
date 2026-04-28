'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { RevenueService } from '@/services/financeService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
  validateRequired,
  validateCurrency,
  validateSelect,
  validateTextArea,
  PATTERNS,
} from '@/utils/validation'

interface Revenue {
  id: string
  date: string
  source: string
  amount: number
  currency: string
  locationId?: string
  category: 'recurring' | 'one-time'
  notes?: string
  createdAt?: string
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'HKD', 'JPY', 'AUD', 'CAD', 'SGD', 'CNY']
const SOURCES = ['bookings', 'memberships', 'products', 'events', 'other']
const CATEGORIES = ['recurring', 'one-time']
const LOCATION_ID_PATTERN = /^[A-Za-z0-9_-]*$/

export default function RevenueReportsPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  const [formData, setFormData] = useState({
    date: '',
    source: 'bookings',
    amount: '',
    currency: 'USD',
    locationId: '',
    category: 'recurring',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadRevenues = async () => {
    try {
      setLoading(true)
      const response: any = await RevenueService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        startDate,
        endDate,
        source: sourceFilter,
      })
      setRevenues(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading revenues:', error)
      toast.error('Failed to load revenue reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRevenues()
  }, [currentPage, searchTerm, startDate, endDate, sourceFilter])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    const dateErr = validateRequired(formData.date, 'Date')
    if (dateErr) newErrors.date = dateErr
    else {
      const d = new Date(formData.date)
      if (isNaN(d.getTime())) newErrors.date = 'Please enter a valid date'
      else if (d > new Date(Date.now() + 24 * 60 * 60 * 1000)) newErrors.date = 'Date cannot be in the future'
    }

    const sourceErr = validateSelect(formData.source, 'Source')
    if (sourceErr) newErrors.source = sourceErr

    const amountErr = validateCurrency(formData.amount, 'Amount')
    if (amountErr) newErrors.amount = amountErr
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0'

    const currencyErr = validateSelect(formData.currency, 'Currency')
    if (currencyErr) newErrors.currency = currencyErr

    const categoryErr = validateSelect(formData.category, 'Category')
    if (categoryErr) newErrors.category = categoryErr

    if (formData.locationId && !LOCATION_ID_PATTERN.test(formData.locationId)) {
      newErrors.locationId = 'Letters, digits, hyphens and underscores only'
    }

    if (formData.notes) {
      const notesErr = validateTextArea(formData.notes, 'Notes', 0, 500)
      if (notesErr) newErrors.notes = notesErr
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFormData()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    try {
      setSubmitting(true)
      const submitData = {
        date: formData.date,
        source: formData.source,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        locationId: formData.locationId.trim() || undefined,
        category: formData.category,
        notes: formData.notes,
      }

      if (editingId) {
        await RevenueService.update(editingId, submitData)
        toast.success('Revenue updated successfully')
      } else {
        await RevenueService.create(submitData)
        toast.success('Revenue created successfully')
      }

      setShowForm(false)
      resetForm()
      loadRevenues()
    } catch (error) {
      console.error('Error saving revenue:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (revenue: Revenue) => {
    setFormData({
      date: revenue.date ? new Date(revenue.date).toISOString().slice(0, 10) : '',
      source: revenue.source,
      amount: revenue.amount.toString(),
      currency: revenue.currency,
      locationId: revenue.locationId || '',
      category: revenue.category,
      notes: revenue.notes || '',
    })
    setEditingId(revenue.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await RevenueService.delete(id)
      toast.success('Revenue deleted successfully')
      setDeleteConfirm(null)
      loadRevenues()
    } catch (error) {
      console.error('Error deleting revenue:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({
      date: '',
      source: 'bookings',
      amount: '',
      currency: 'USD',
      locationId: '',
      category: 'recurring',
      notes: '',
    })
    setErrors({})
    setEditingId(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const getCategoryColor = (category: string) =>
    category === 'recurring' ? 'bg-green-100 text-green-800'
      : category === 'one-time' ? 'bg-blue-100 text-blue-800'
        : 'bg-slate-100 text-slate-800'

  const totalRevenueNumber = revenues.reduce((sum, r) => sum + Number(r.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Revenue Reports</h1>
          </div>
          <p className="text-slate-600">Track and manage revenue from all sources</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">${totalRevenueNumber.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Total Entries</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{revenues.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Average Entry</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              ${revenues.length > 0 ? (totalRevenueNumber / revenues.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search revenue..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Sources</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1) }}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1) }}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Revenue
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading revenue reports...</p>
            </div>
          ) : revenues.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No revenue records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Source</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {revenues.map((revenue) => (
                      <tr key={revenue.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{new Date(revenue.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{revenue.source}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{Number(revenue.amount).toFixed(2)} {revenue.currency}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(revenue.category)}`}>{revenue.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{revenue.locationId || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(revenue)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(revenue.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer} title={editingId ? 'Edit Revenue' : 'Add New Revenue'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Date <span className="text-red-500">*</span></label>
              <input type="date" value={formData.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Source <span className="text-red-500">*</span></label>
              <select value={formData.source}
                onChange={(e) => { setFormData({ ...formData, source: e.target.value }); if (errors.source) setErrors({ ...errors, source: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.source ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Source</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Amount <span className="text-red-500">*</span></label>
              <input type="text" inputMode="decimal" value={formData.amount}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '' || PATTERNS.currencyAmount.test(v) || /^\d+\.?$/.test(v)) {
                    setFormData({ ...formData, amount: v })
                    if (errors.amount) setErrors({ ...errors, amount: '' })
                  }
                }}
                placeholder="0.00"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.amount
                ? <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                : <p className="mt-1 text-xs text-slate-500">Numbers only, up to 2 decimal places</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Currency <span className="text-red-500">*</span></label>
              <select value={formData.currency}
                onChange={(e) => { setFormData({ ...formData, currency: e.target.value }); if (errors.currency) setErrors({ ...errors, currency: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.currency ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Currency</option>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Category <span className="text-red-500">*</span></label>
              <select value={formData.category}
                onChange={(e) => { setFormData({ ...formData, category: e.target.value }); if (errors.category) setErrors({ ...errors, category: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Location ID (Optional)</label>
              <input type="text" value={formData.locationId}
                onChange={(e) => {
                  const v = e.target.value
                  if (LOCATION_ID_PATTERN.test(v)) {
                    setFormData({ ...formData, locationId: v })
                    if (errors.locationId) setErrors({ ...errors, locationId: '' })
                  }
                }}
                placeholder="e.g. LOC-MUMBAI-01"
                maxLength={64}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.locationId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.locationId
                ? <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>
                : <p className="mt-1 text-xs text-slate-500">Letters, digits, hyphens and underscores only</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Notes (Optional)</label>
              <textarea value={formData.notes} rows={3} maxLength={500}
                onChange={(e) => { setFormData({ ...formData, notes: e.target.value }); if (errors.notes) setErrors({ ...errors, notes: '' }) }}
                placeholder="Optional notes about this revenue"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button type="button" onClick={handleCloseDrawer}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {submitting ? 'Saving...' : editingId ? 'Update Revenue' : 'Create Revenue'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Revenue Record?</h3>
              <p className="text-slate-600 mb-6">This action cannot be undone. The revenue record will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
