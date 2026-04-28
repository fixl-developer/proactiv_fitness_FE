'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { LedgerService } from '@/services/financeService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
  validateRequired,
  validateCurrency,
  validateSelect,
  validateTextArea,
  PATTERNS,
} from '@/utils/validation'

interface LedgerEntry {
  id: string
  date: string
  type: 'debit' | 'credit'
  account: string
  amount: number
  currency: string
  description: string
  reference?: string
  status: 'pending' | 'posted' | 'reconciled'
  createdAt?: string
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'HKD', 'JPY', 'AUD', 'CAD', 'SGD', 'CNY']
// Backend `type` enum on FinancialLedgerModel: credit | debit
const TYPES = ['debit', 'credit']
// Backend `category` enum on FinancialLedgerModel: payment | refund | fee | adjustment | commission
const ACCOUNTS = ['payment', 'refund', 'fee', 'adjustment', 'commission']
const STATUSES = ['pending', 'posted', 'reconciled']
const REFERENCE_PATTERN = /^[A-Za-z0-9_-]*$/

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: '',
    type: 'debit',
    account: 'payment',
    amount: '',
    currency: 'USD',
    description: '',
    reference: '',
    status: 'pending',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadEntries = async () => {
    try {
      setLoading(true)
      const response: any = await LedgerService.getAll({ page: currentPage, limit: 10, search: searchTerm })
      setEntries(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading ledger entries:', error)
      toast.error('Failed to load ledger entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [currentPage, searchTerm])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    const dateErr = validateRequired(formData.date, 'Date')
    if (dateErr) newErrors.date = dateErr

    const typeErr = validateSelect(formData.type, 'Type')
    if (typeErr) newErrors.type = typeErr

    const accountErr = validateSelect(formData.account, 'Account')
    if (accountErr) newErrors.account = accountErr

    const amountErr = validateCurrency(formData.amount, 'Amount')
    if (amountErr) newErrors.amount = amountErr
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0'

    const currencyErr = validateSelect(formData.currency, 'Currency')
    if (currencyErr) newErrors.currency = currencyErr

    const descErr = validateTextArea(formData.description, 'Description', 10, 1000)
    if (descErr) newErrors.description = descErr

    const statusErr = validateSelect(formData.status, 'Status')
    if (statusErr) newErrors.status = statusErr

    if (formData.reference && !REFERENCE_PATTERN.test(formData.reference)) {
      newErrors.reference = 'Letters, digits, hyphens and underscores only'
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
        type: formData.type,
        account: formData.account,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        reference: formData.reference,
        status: formData.status,
      }

      if (editingId) {
        await LedgerService.update(editingId, submitData)
        toast.success('Ledger entry updated successfully')
      } else {
        await LedgerService.create(submitData)
        toast.success('Ledger entry created successfully')
      }

      setShowForm(false)
      resetForm()
      loadEntries()
    } catch (error) {
      console.error('Error saving ledger entry:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (entry: LedgerEntry) => {
    setFormData({
      date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : '',
      type: entry.type,
      account: entry.account,
      amount: entry.amount.toString(),
      currency: entry.currency,
      description: entry.description,
      reference: entry.reference || '',
      status: entry.status,
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await LedgerService.delete(id)
      toast.success('Ledger entry deleted successfully')
      setDeleteConfirm(null)
      loadEntries()
    } catch (error) {
      console.error('Error deleting ledger entry:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({
      date: '', type: 'debit', account: 'payment', amount: '',
      currency: 'USD', description: '', reference: '', status: 'pending',
    })
    setErrors({})
    setEditingId(null)
  }

  const handleCloseDrawer = () => { setShowForm(false); resetForm() }

  const getTypeColor = (type: string) =>
    type === 'debit' ? 'bg-red-100 text-red-800' : type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'posted': return 'bg-blue-100 text-blue-800'
      case 'reconciled': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const totalDebits = entries.filter(e => e.type === 'debit').reduce((s, e) => s + Number(e.amount || 0), 0)
  const totalCredits = entries.filter(e => e.type === 'credit').reduce((s, e) => s + Number(e.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Financial Ledger</h1>
          </div>
          <p className="text-slate-600">Manage all financial ledger entries and transactions</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Total Debits</p>
            <p className="text-3xl font-bold text-red-600 mt-2">${totalDebits.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Total Credits</p>
            <p className="text-3xl font-bold text-green-600 mt-2">${totalCredits.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Balance</p>
            <p className={`text-3xl font-bold mt-2 ${totalCredits >= totalDebits ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalCredits - totalDebits).toFixed(2)}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search by description or reference..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading ledger entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No ledger entries found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Account</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(entry.type)}`}>{entry.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{entry.account}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{Number(entry.amount).toFixed(2)} {entry.currency}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{entry.description}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(entry.status)}`}>{entry.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(entry)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(entry.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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

        <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer} title={editingId ? 'Edit Ledger Entry' : 'Add New Ledger Entry'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Date <span className="text-red-500">*</span></label>
              <input type="date" value={formData.date}
                onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Type <span className="text-red-500">*</span></label>
              <select value={formData.type}
                onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (errors.type) setErrors({ ...errors, type: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Type</option>
                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Account <span className="text-red-500">*</span></label>
              <select value={formData.account}
                onChange={(e) => { setFormData({ ...formData, account: e.target.value }); if (errors.account) setErrors({ ...errors, account: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.account ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Account</option>
                {ACCOUNTS.map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
              </select>
              {errors.account
                ? <p className="mt-1 text-sm text-red-600">{errors.account}</p>
                : <p className="mt-1 text-xs text-slate-500">Allowed: payment, refund, fee, adjustment, commission</p>}
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
              <label className="block text-sm font-medium text-slate-900 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea value={formData.description} rows={3} maxLength={1000}
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }) }}
                placeholder="Detailed description of the transaction (min 10 characters)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.description
                ? <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                : <p className="mt-1 text-xs text-slate-500">{formData.description.length}/1000 — minimum 10 characters</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Reference (Optional)</label>
              <input type="text" value={formData.reference}
                onChange={(e) => {
                  const v = e.target.value
                  if (REFERENCE_PATTERN.test(v)) {
                    setFormData({ ...formData, reference: v })
                    if (errors.reference) setErrors({ ...errors, reference: '' })
                  }
                }}
                placeholder="e.g. INV-2024-001"
                maxLength={64}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.reference ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.reference
                ? <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                : <p className="mt-1 text-xs text-slate-500">Letters, digits, hyphens and underscores only</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Status <span className="text-red-500">*</span></label>
              <select value={formData.status}
                onChange={(e) => { setFormData({ ...formData, status: e.target.value }); if (errors.status) setErrors({ ...errors, status: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button type="button" onClick={handleCloseDrawer}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {submitting ? 'Saving...' : editingId ? 'Update Entry' : 'Create Entry'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Ledger Entry?</h3>
              <p className="text-slate-600 mb-6">This action cannot be undone. The ledger entry will be permanently deleted.</p>
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
