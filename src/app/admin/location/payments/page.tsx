'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard, DollarSign, Wallet, CheckCircle, Search, Filter,
    RefreshCw, AlertCircle, Loader2, Receipt, Plus,
} from 'lucide-react'
import { LocationManagerService } from '@/services/locationManagerService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { validateRequired, validateNumber, filterNumberInput } from '@/utils/validation'
import { toast } from 'sonner'

interface PaymentRow {
    id: string
    bookingId: string
    customerName: string
    program: string
    amount: number
    currency: string
    method: string
    status: string
    date: string
}

const STATUS_FILTERS = [
    { value: 'all', label: 'All payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
]

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'wallet', label: 'Digital Wallet' },
    { value: 'cheque', label: 'Cheque' },
]

const statusBadge = (s: string) => {
    const k = (s || '').toLowerCase()
    if (k === 'paid' || k === 'completed') return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    if (k === 'pending') return 'bg-amber-100 text-amber-700 border border-amber-200'
    if (k === 'failed') return 'bg-red-100 text-red-700 border border-red-200'
    if (k === 'refunded') return 'bg-blue-100 text-blue-700 border border-blue-200'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
}

export default function LocationPaymentsPage() {
    const [rows, setRows] = useState<PaymentRow[]>([])
    const [stats, setStats] = useState({ total: 0, totalCollected: 0, totalPending: 0, paidCount: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Record-payment drawer state
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [target, setTarget] = useState<PaymentRow | null>(null)
    const [form, setForm] = useState({ amount: '', method: 'cash', notes: '' })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await LocationManagerService.getPayments({
                status: filterStatus !== 'all' ? filterStatus : undefined,
                search: searchTerm || undefined,
                page,
                pageSize: 20,
            })
            setRows(data?.items || [])
            setStats(data?.stats || { total: 0, totalCollected: 0, totalPending: 0, paidCount: 0 })
            setTotalPages(data?.totalPages || 1)
        } catch (err: any) {
            setError(err?.message || 'Failed to load payments')
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [filterStatus, searchTerm, page])

    useEffect(() => {
        const t = setTimeout(() => fetchPayments(), 250)
        return () => clearTimeout(t)
    }, [fetchPayments])

    const openRecord = (row: PaymentRow) => {
        setTarget(row)
        setForm({ amount: String(row.amount || ''), method: 'cash', notes: '' })
        setFormErrors({})
        setDrawerOpen(true)
    }

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const amtErr = validateNumber(form.amount, 'Amount', 0.01, 1000000)
        if (amtErr) errs.amount = amtErr
        const mErr = validateRequired(form.method, 'Method')
        if (mErr) errs.method = mErr
        return errs
    }

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (formErrors[field]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!target) return
        const errs = validate()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            await LocationManagerService.recordPayment(target.id, {
                amount: Number(form.amount),
                method: form.method,
                notes: form.notes.trim() || undefined,
            })
            toast.success('Payment recorded')
            setDrawerOpen(false)
            fetchPayments()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to record payment')
        } finally {
            setSubmitting(false)
        }
    }

    const kpis = [
        { label: 'Total Transactions', value: stats.total, icon: Receipt, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
        { label: 'Collected (HKD)', value: stats.totalCollected.toLocaleString(), icon: DollarSign, cardBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', titleColor: 'text-emerald-700', valueColor: 'text-emerald-900' },
        { label: 'Pending (HKD)', value: stats.totalPending.toLocaleString(), icon: Wallet, cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100', iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600', titleColor: 'text-amber-700', valueColor: 'text-amber-900' },
        { label: 'Paid Count', value: stats.paidCount, icon: CheckCircle, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments</h1>
                    <p className="text-sm text-gray-500 mt-1 font-normal">Per-location payment ledger and pending collections</p>
                </div>
                <button
                    id="loc-payments-refresh"
                    onClick={fetchPayments}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`${k.cardBg} border-0 rounded-xl shadow-sm hover:shadow-lg transition-shadow p-5`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${k.iconBg} p-2.5 rounded-lg shadow-md`}>
                                <k.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className={`text-xs font-medium ${k.titleColor} uppercase tracking-wide`}>{k.label}</p>
                        <p className={`text-2xl font-bold ${k.valueColor} mt-1`}>{k.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                            placeholder="Search by customer or booking id…"
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[180px] font-normal capitalize focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {STATUS_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700 font-normal">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-normal">Loading payments…</p>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-700">No transactions yet</h3>
                        <p className="text-sm text-gray-500 mt-1 font-normal">Payments from bookings at this location will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Program</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Method</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{row.customerName}</p>
                                            <p className="text-xs text-gray-500 font-normal">{row.bookingId}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-normal">{row.program}</td>
                                        <td className="px-4 py-3 text-gray-700 capitalize font-normal">{row.method.replace('_', ' ')}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(row.status)}`}>{row.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {row.currency} {Number(row.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {row.status === 'pending' && (
                                                <button
                                                    onClick={() => openRecord(row)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Record Payment
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 font-normal">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                        Next
                    </button>
                </div>
            )}

            {/* Record-payment slide-in drawer */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setFormErrors({}) }}
                title="Record Payment"
                description={target ? `For booking ${target.bookingId} — ${target.customerName}` : ''}
                size="md"
            >
                {target && (
                    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                            <p className="font-medium text-gray-900">{target.customerName}</p>
                            <p className="text-xs text-gray-500 font-normal mt-0.5">{target.program} · Original amount {target.currency} {target.amount.toLocaleString()}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (HKD) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                inputMode="decimal"
                                value={form.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                onKeyDown={filterNumberInput}
                                min={0.01}
                                step={0.01}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint="Must be greater than 0" error={formErrors.amount} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Method <span className="text-red-500">*</span></label>
                            <select
                                value={form.method}
                                onChange={(e) => handleChange('method', e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.method ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <FormFieldHint error={formErrors.method} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={3}
                                maxLength={300}
                                placeholder="Reference number / receipt info"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal resize-y"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submitting ? 'Recording…' : 'Record Payment'}
                            </button>
                        </div>
                    </form>
                )}
            </SlideInDrawer>
        </div>
    )
}
