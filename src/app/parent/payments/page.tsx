'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard, DollarSign, Calendar, Download, RefreshCw, Plus, Eye,
    CheckCircle, Clock, AlertTriangle, TrendingUp, Receipt, Wallet, Loader
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { validateSelect, validateCurrency, filterNumberInput } from '@/utils/validation'

const ParentPaymentsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [payments, setPayments] = useState<any[]>([])
    const [paymentStats, setPaymentStats] = useState<any>({
        totalSpent: 0,
        monthlySpent: 0,
        pendingPayments: 0,
        accountBalance: 0
    })
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
    const [error, setError] = useState<string | null>(null)

    const [payOpen, setPayOpen] = useState(false)
    const [pendingBookings, setPendingBookings] = useState<any[]>([])
    const [payBookingId, setPayBookingId] = useState('')
    const [payAmount, setPayAmount] = useState('')
    const [payMethod, setPayMethod] = useState('')
    const [payNotes, setPayNotes] = useState('')
    const [payErrors, setPayErrors] = useState<Record<string, string>>({})
    const [paySubmitting, setPaySubmitting] = useState(false)

    const [viewOpen, setViewOpen] = useState(false)
    const [viewPayment, setViewPayment] = useState<any>(null)

    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadPayments()
    }, [isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            loadPayments()
        }
    }, [selectedFilter])

    const loadPayments = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await apiClient.get<any>(`/parent/payments?status=${selectedFilter}`)
            const paymentData = response?.data || response
            const { stats, payments: paymentsList } = paymentData

            setPaymentStats({
                totalSpent: stats?.totalSpent || 0,
                monthlySpent: stats?.monthlySpent || 0,
                pendingPayments: stats?.pendingPayments || 0,
                accountBalance: stats?.accountBalance || 0
            })
            setPayments(paymentsList || [])
        } catch (err) {
            console.error('Error loading payments:', err)
            setError('Failed to load payment data')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />
            case 'failed':
                return <AlertTriangle className="w-4 h-4 text-red-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-600" />
        }
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const openPayDrawer = async () => {
        setPayBookingId('')
        setPayAmount('')
        setPayMethod('')
        setPayNotes('')
        setPayErrors({})
        setPayOpen(true)
        try {
            const resp = await apiClient.get<any>('/parent/payments/pending')
            setPendingBookings(resp?.data || [])
        } catch (err) {
            console.error('Pending bookings error:', err)
            setPendingBookings([])
        }
    }

    const handlePaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const errs: Record<string, string> = {}
        const bookingErr = validateSelect(payBookingId, 'Booking')
        if (bookingErr) errs.bookingId = bookingErr
        const amtErr = validateCurrency(payAmount, 'Amount')
        if (amtErr) errs.amount = amtErr
        const methodErr = validateSelect(payMethod, 'Payment method')
        if (methodErr) errs.method = methodErr
        if (Object.keys(errs).length) { setPayErrors(errs); return }

        setPaySubmitting(true)
        try {
            await apiClient.post('/parent/payments', {
                bookingId: payBookingId,
                amount: Number(payAmount),
                method: payMethod,
                notes: payNotes,
            })
            toast.success('Payment recorded successfully')
            setPayOpen(false)
            await loadPayments()
        } catch (err: any) {
            console.error('Payment error:', err)
            toast.error(err?.response?.data?.message || 'Failed to record payment')
        } finally {
            setPaySubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments & Billing</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-2">Manage your payments and view transaction history</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="parent-payments-refresh-btn" variant="outline" size="sm" onClick={() => loadPayments()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button id="parent-payments-make-payment-btn" size="sm" onClick={openPayDrawer}>
                        <Plus className="w-4 h-4 mr-2" />
                        Make Payment
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Lifetime</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-green-50 to-emerald-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-lg shadow-md">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">This Month</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Monthly Spent</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.monthlySpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Awaiting</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Balance</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Account Balance</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-base md:text-lg">Payment History</CardTitle>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'completed', label: 'Completed' },
                                    { key: 'pending', label: 'Pending' },
                                    { key: 'failed', label: 'Failed' }
                                ].map((filter) => (
                                    <button id={`parent-payments-filter-${filter.key}-btn`}
                                        key={filter.key}
                                        onClick={() => setSelectedFilter(filter.key as any)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedFilter === filter.key
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                            <Button
                                id="parent-payments-export-btn"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (!payments.length) { toast.info('No payments to export'); return }
                                    const header = 'Invoice,Date,Program,Child,Amount,Method,Status'
                                    const rows = payments.map(p => [p.invoice, p.date, p.program, p.child, p.amount, p.method, p.status].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
                                    const csv = [header, ...rows].join('\n')
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
                                    a.click()
                                    URL.revokeObjectURL(url)
                                    toast.success('Exported payments.csv')
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {payments.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No payments found for the selected filter.
                            </div>
                        )}
                        {payments.map((payment, index) => (
                            <motion.div
                                key={payment.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all border border-gray-200"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{payment.program}</h4>
                                            <Badge className={getStatusColor(payment.status)}>
                                                {payment.status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{payment.child} • {payment.description}</p>
                                        <p className="text-xs text-gray-500">{payment.method} • Invoice: {payment.invoice}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">${payment.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-600">{payment.date}</p>
                                    <p className="text-xs text-gray-500">ID: {payment.id}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {getStatusIcon(payment.status)}
                                    <Button
                                        id={`parent-payments-view-${payment.id}-btn`}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setViewPayment(payment); setViewOpen(true) }}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        id={`parent-payments-receipt-${payment.id}-btn`}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const receipt = `ProActiv Fitness\nReceipt\n\nInvoice: ${payment.invoice}\nDate: ${payment.date}\nProgram: ${payment.program}\nChild: ${payment.child}\nAmount: ${formatCurrency(payment.amount || 0)}\nMethod: ${payment.method}\nStatus: ${payment.status}\nDescription: ${payment.description || '-'}\n`
                                            const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8;' })
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = `receipt-${payment.invoice || payment.id}.txt`
                                            a.click()
                                            URL.revokeObjectURL(url)
                                            toast.success('Receipt downloaded')
                                        }}
                                    >
                                        <Receipt className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button id="parent-payments-quick-pay-btn" className="h-20 flex-col gap-2" variant="outline" onClick={openPayDrawer}>
                            <Plus className="w-6 h-6" />
                            <span>Make Payment</span>
                        </Button>
                        <Button
                            id="parent-payments-quick-receipt-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => {
                                const last = payments.find(p => p.status === 'completed' || p.status === 'paid')
                                if (!last) { toast.info('No completed payment to download'); return }
                                const receipt = `ProActiv Fitness\nReceipt\n\nInvoice: ${last.invoice}\nDate: ${last.date}\nProgram: ${last.program}\nChild: ${last.child}\nAmount: ${formatCurrency(last.amount || 0)}\nMethod: ${last.method}\nStatus: ${last.status}\n`
                                const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8;' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `receipt-${last.invoice || last.id}.txt`
                                a.click()
                                URL.revokeObjectURL(url)
                                toast.success('Latest receipt downloaded')
                            }}
                        >
                            <Download className="w-6 h-6" />
                            <span>Download Receipt</span>
                        </Button>
                        <Button id="parent-payments-quick-methods-btn" className="h-20 flex-col gap-2" variant="outline" onClick={() => router.push('/parent/profile')}>
                            <CreditCard className="w-6 h-6" />
                            <span>Payment Methods</span>
                        </Button>
                        <Button id="parent-payments-quick-schedule-btn" className="h-20 flex-col gap-2" variant="outline" onClick={() => router.push('/parent/bookings')}>
                            <Calendar className="w-6 h-6" />
                            <span>Payment Schedule</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Make Payment Drawer */}
            <SlideInDrawer
                isOpen={payOpen}
                onClose={() => { setPayOpen(false); setPayErrors({}) }}
                title="Make Payment"
                description="Settle a pending booking"
                size="md"
            >
                <form onSubmit={handlePaySubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking</label>
                        <select
                            value={payBookingId}
                            onChange={(e) => {
                                const id = e.target.value
                                setPayBookingId(id)
                                const b = pendingBookings.find(pb => pb.id === id)
                                if (b) setPayAmount(String(b.amount || ''))
                                if (payErrors.bookingId) setPayErrors(prev => { const n = { ...prev }; delete n.bookingId; return n })
                            }}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${payErrors.bookingId ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">{pendingBookings.length ? 'Select a pending booking' : 'No pending bookings'}</option>
                            {pendingBookings.map(b => (
                                <option key={b.id} value={b.id}>{b.program} - {b.child} (${b.amount})</option>
                            ))}
                        </select>
                        <FormFieldHint hint="Amount auto-fills when you pick a booking" error={payErrors.bookingId} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (HKD)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={payAmount}
                            onChange={(e) => {
                                setPayAmount(e.target.value)
                                if (payErrors.amount) setPayErrors(prev => { const n = { ...prev }; delete n.amount; return n })
                            }}
                            onKeyDown={filterNumberInput}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${payErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="99.99"
                        />
                        <FormFieldHint hint="Numbers only, up to 2 decimals" error={payErrors.amount} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            value={payMethod}
                            onChange={(e) => {
                                setPayMethod(e.target.value)
                                if (payErrors.method) setPayErrors(prev => { const n = { ...prev }; delete n.method; return n })
                            }}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${payErrors.method ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Select method</option>
                            <option value="card">Credit / Debit Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="wallet">Wallet Balance</option>
                            <option value="cash">Cash</option>
                        </select>
                        <FormFieldHint error={payErrors.method} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <textarea
                            rows={3}
                            value={payNotes}
                            onChange={(e) => setPayNotes(e.target.value)}
                            maxLength={300}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Reference number, purpose..."
                        />
                        <FormFieldHint hint="Up to 300 characters" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setPayOpen(false); setPayErrors({}) }}>Cancel</Button>
                        <Button type="submit" disabled={paySubmitting}>
                            {paySubmitting ? (<><Loader className="w-4 h-4 mr-2 animate-spin" /> Processing...</>) : 'Pay Now'}
                        </Button>
                    </div>
                </form>
            </SlideInDrawer>

            {/* Payment Details Drawer */}
            <SlideInDrawer
                isOpen={viewOpen}
                onClose={() => { setViewOpen(false); setViewPayment(null) }}
                title="Payment Details"
                description={viewPayment?.invoice ? `Invoice ${viewPayment.invoice}` : ''}
                size="md"
            >
                {viewPayment && (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Program</span><span className="font-medium text-gray-900">{viewPayment.program}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Child</span><span className="font-medium text-gray-900">{viewPayment.child}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-blue-600">{formatCurrency(viewPayment.amount || 0)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{viewPayment.date}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge className={getStatusColor(viewPayment.status)}>{viewPayment.status?.toUpperCase()}</Badge></div>
                        <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium text-gray-900">{viewPayment.method}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Invoice</span><span className="font-mono text-gray-900">{viewPayment.invoice}</span></div>
                        {viewPayment.description && (
                            <div>
                                <p className="text-gray-500 mb-1">Description</p>
                                <p className="text-gray-900">{viewPayment.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}

export default ParentPaymentsPage
