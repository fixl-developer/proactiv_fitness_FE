'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    CalendarCheck, Plus, Search, Filter, RefreshCw, AlertCircle,
    Clock, CheckCircle, XCircle, Edit2, X, Loader2, Phone, Mail,
} from 'lucide-react'
import { LocationManagerService } from '@/services/locationManagerService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import {
    validateName, validateEmail, validatePhone, validateRequired,
    validateNumber, validateFutureOrToday, todayISODate,
    filterNameInput, filterPhoneInput, filterNumberInput, FORMAT_HINTS,
} from '@/utils/validation'
import { toast } from 'sonner'

interface BookingRow {
    id: string
    bookingId: string
    child: string
    customerName: string
    customerEmail: string
    customerPhone: string
    program: string
    bookingType: string
    date: string
    time: string
    status: string
    paymentStatus: string
    amount: number
    currency: string
    createdAt: string
}

const STATUS_FILTERS = [
    { value: 'all', label: 'All statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
]

const BOOKING_TYPES = [
    { value: 'drop_in', label: 'Drop-in' },
    { value: 'trial', label: 'Trial Class' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'regular', label: 'Regular' },
]

const emptyForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingType: 'drop_in',
    date: '',
    time: '',
    amount: '',
    notes: '',
}

const statusBadge = (s: string) => {
    const k = s.toLowerCase()
    if (k === 'confirmed') return 'bg-green-100 text-green-700 border border-green-200'
    if (k === 'completed') return 'bg-blue-100 text-blue-700 border border-blue-200'
    if (k === 'pending') return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    if (k === 'cancelled') return 'bg-red-100 text-red-700 border border-red-200'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
}

const paymentBadge = (s: string) => {
    const k = (s || '').toLowerCase()
    if (k === 'paid' || k === 'completed') return 'bg-emerald-100 text-emerald-700'
    if (k === 'pending') return 'bg-amber-100 text-amber-700'
    if (k === 'failed') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
}

export default function LocationBookingsPage() {
    const [rows, setRows] = useState<BookingRow[]>([])
    const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editing, setEditing] = useState<BookingRow | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    const fetchBookings = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await LocationManagerService.getBookings({
                status: filterStatus !== 'all' ? filterStatus : undefined,
                search: searchTerm || undefined,
                page,
                pageSize: 20,
            })
            setRows(data?.items || [])
            setStats(data?.stats || { total: 0, confirmed: 0, pending: 0, cancelled: 0 })
            setTotalPages(data?.totalPages || 1)
        } catch (err: any) {
            setError(err?.message || 'Failed to load bookings')
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [filterStatus, searchTerm, page])

    useEffect(() => {
        const t = setTimeout(() => fetchBookings(), 250)
        return () => clearTimeout(t)
    }, [fetchBookings])

    const openCreate = () => {
        setEditing(null)
        setForm(emptyForm)
        setFormErrors({})
        setDrawerOpen(true)
    }

    const openEdit = (row: BookingRow) => {
        setEditing(row)
        setForm({
            customerName: row.customerName || '',
            customerEmail: row.customerEmail || '',
            customerPhone: row.customerPhone || '',
            bookingType: row.bookingType || 'drop_in',
            date: row.date ? String(row.date).slice(0, 10) : '',
            time: row.time || '',
            amount: String(row.amount || ''),
            notes: '',
        })
        setFormErrors({})
        setDrawerOpen(true)
    }

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const nameErr = validateName(form.customerName, 'Customer name')
        if (nameErr) errs.customerName = nameErr
        if (form.customerEmail) {
            const emErr = validateEmail(form.customerEmail, false)
            if (emErr) errs.customerEmail = emErr
        }
        if (form.customerPhone) {
            const phErr = validatePhone(form.customerPhone, false)
            if (phErr) errs.customerPhone = phErr
        }
        const btErr = validateRequired(form.bookingType, 'Booking type')
        if (btErr) errs.bookingType = btErr
        const dErr = validateFutureOrToday(form.date, 'Date')
        if (dErr) errs.date = dErr
        if (form.amount) {
            const amtErr = validateNumber(form.amount, 'Amount', 0, 100000)
            if (amtErr) errs.amount = amtErr
        }
        return errs
    }

    const handleChange = (field: keyof typeof emptyForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (formErrors[field]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            const payload = {
                customerName: form.customerName.trim(),
                customerEmail: form.customerEmail.trim(),
                customerPhone: form.customerPhone.trim(),
                bookingType: form.bookingType,
                date: form.date,
                time: form.time,
                amount: form.amount ? Number(form.amount) : 0,
                notes: form.notes.trim(),
            }
            if (editing) {
                await LocationManagerService.updateBooking(editing.id, payload)
                toast.success('Booking updated')
            } else {
                await LocationManagerService.createBooking(payload)
                toast.success('Booking created')
            }
            setDrawerOpen(false)
            fetchBookings()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save booking')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = async (row: BookingRow) => {
        if (!confirm(`Cancel booking for ${row.customerName}?`)) return
        try {
            await LocationManagerService.cancelBooking(row.id)
            toast.success('Booking cancelled')
            fetchBookings()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to cancel')
        }
    }

    const kpis = [
        { label: 'Total Bookings', value: stats.total, icon: CalendarCheck, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
        { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
        { label: 'Pending', value: stats.pending, icon: Clock, cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100', iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600', titleColor: 'text-amber-700', valueColor: 'text-amber-900' },
        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, cardBg: 'bg-gradient-to-br from-red-50 to-red-100', iconBg: 'bg-gradient-to-br from-red-500 to-red-600', titleColor: 'text-red-700', valueColor: 'text-red-900' },
    ]

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1 font-normal">Walk-in, trial, and phone bookings at this location</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        id="loc-bookings-refresh"
                        onClick={fetchBookings}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button
                        id="loc-bookings-new"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> New Booking
                    </button>
                </div>
            </div>

            {/* Colorful KPI cards */}
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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                            placeholder="Search by customer, email, booking id…"
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

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700 font-normal">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-normal">Loading bookings…</p>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-700">No bookings yet</h3>
                        <p className="text-sm text-gray-500 mt-1 font-normal">Walk-in and phone bookings will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{row.customerName}</p>
                                            <p className="text-xs text-gray-500 font-normal">{row.customerEmail || row.customerPhone || row.bookingId}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 capitalize font-normal">{row.bookingType.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-gray-700 font-normal">
                                            {row.date ? new Date(row.date).toLocaleDateString() : '—'}
                                            {row.time && <span className="text-xs text-gray-500 ml-1">{row.time}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(row.status)}`}>{row.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${paymentBadge(row.paymentStatus)}`}>{row.paymentStatus}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {row.currency} {Number(row.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex gap-1">
                                                <button
                                                    onClick={() => openEdit(row)}
                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {row.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(row)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
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

            {/* Slide-in form drawer (right side) */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setFormErrors({}) }}
                title={editing ? 'Edit Booking' : 'New Booking'}
                description={editing ? `Update booking #${editing.bookingId}` : 'Log a walk-in / phone booking'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.customerName}
                            onChange={(e) => handleChange('customerName', e.target.value)}
                            onKeyDown={filterNameInput}
                            placeholder="Full name"
                            maxLength={80}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.name} error={formErrors.customerName} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.customerEmail}
                                onChange={(e) => handleChange('customerEmail', e.target.value)}
                                placeholder="email@example.com"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.email} error={formErrors.customerEmail} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={form.customerPhone}
                                onChange={(e) => handleChange('customerPhone', e.target.value)}
                                onKeyDown={filterPhoneInput}
                                placeholder="+1234567890"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.customerPhone ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.phone} error={formErrors.customerPhone} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type <span className="text-red-500">*</span></label>
                            <select
                                value={form.bookingType}
                                onChange={(e) => handleChange('bookingType', e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.bookingType ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                {BOOKING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={form.date}
                                min={todayISODate()}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint error={formErrors.date} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={(e) => handleChange('time', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (HKD)</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                value={form.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                onKeyDown={filterNumberInput}
                                placeholder="0"
                                min={0}
                                max={100000}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint error={formErrors.amount} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Any extra details for this booking"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal resize-y"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => { setDrawerOpen(false); setFormErrors({}) }}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? 'Saving…' : (editing ? 'Update Booking' : 'Create Booking')}
                        </button>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
