'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, DollarSign, Receipt, Download, Eye, FileDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { paymentService, Payment } from '@/services/modules/payment.service'
import { apiClient } from '@/services/api/client'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { validateCurrency, validateSelect, validateName, validateCardNumber, validateCVV, validateCardExpiry, validateZipCode, filterNameInput, filterCardNumberInput } from '@/utils/validation'

function formatCurrency(amount: number): string {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all')
    const [stats, setStats] = useState({ totalPaid: 0, completedCount: 0, pendingCount: 0, failedCount: 0 })
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    // View payment drawer
    const [viewPayment, setViewPayment] = useState<Payment | null>(null)
    // Pay Now drawer
    const [payPayment, setPayPayment] = useState<Payment | null>(null)
    const [payForm, setPayForm] = useState({
        amount: '',
        paymentMethod: 'credit_card' as 'credit_card' | 'debit_card' | 'bank_transfer' | 'wallet',
        cardholderName: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        billingZip: '',
        bankName: '',
        accountLast4: '',
    })
    const [payErrors, setPayErrors] = useState<Record<string, string>>({})
    const [paySubmitting, setPaySubmitting] = useState(false)
    const [paySuccess, setPaySuccess] = useState(false)

    const openPayDrawer = (payment: Payment) => {
        setPayPayment(payment)
        setPaySuccess(false)
        setPayErrors({})
        setPayForm({
            amount: String(payment.amount || ''),
            paymentMethod: 'credit_card',
            cardholderName: '',
            cardNumber: '',
            expiry: '',
            cvv: '',
            billingZip: '',
            bankName: '',
            accountLast4: '',
        })
    }

    const closePayDrawer = () => {
        if (paySubmitting) return
        setPayPayment(null)
    }

    const validatePay = (): boolean => {
        const e: Record<string, string> = {}
        const amt = validateCurrency(payForm.amount, 'Amount')
        if (amt) e.amount = amt
        const method = validateSelect(payForm.paymentMethod, 'payment method')
        if (method) e.paymentMethod = method

        if (payForm.paymentMethod === 'credit_card' || payForm.paymentMethod === 'debit_card') {
            const n = validateName(payForm.cardholderName, 'Cardholder name')
            if (n) e.cardholderName = n
            const cn = validateCardNumber(payForm.cardNumber)
            if (cn) e.cardNumber = cn
            const ex = validateCardExpiry(payForm.expiry)
            if (ex) e.expiry = ex
            const cv = validateCVV(payForm.cvv)
            if (cv) e.cvv = cv
        } else if (payForm.paymentMethod === 'bank_transfer') {
            if (!payForm.bankName.trim()) e.bankName = 'Bank name is required'
        }
        if (payForm.billingZip) {
            const z = validateZipCode(payForm.billingZip, false)
            if (z) e.billingZip = z
        }
        setPayErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmitPayment = async () => {
        if (!payPayment) return
        if (!validatePay()) return
        setPaySubmitting(true)
        try {
            const payload = {
                paymentId: payPayment.id,
                amount: parseFloat(payForm.amount),
                paymentMethod: payForm.paymentMethod,
                ...(payForm.paymentMethod === 'credit_card' || payForm.paymentMethod === 'debit_card'
                    ? {
                        cardholderName: payForm.cardholderName,
                        cardLast4: payForm.cardNumber.replace(/\s/g, '').slice(-4),
                        expiry: payForm.expiry,
                        billingZip: payForm.billingZip || undefined,
                    }
                    : payForm.paymentMethod === 'bank_transfer'
                        ? { bankName: payForm.bankName, accountLast4: payForm.accountLast4 || undefined }
                        : {}),
            }
            await apiClient.post<any>(`/payments/${payPayment.id}/pay`, payload).catch(async () => {
                // fallback to generic create payment endpoint
                return apiClient.post<any>('/payments', payload)
            })
            setPaySuccess(true)
            await loadPayments()
            setTimeout(() => { setPayPayment(null); setPaySuccess(false) }, 1500)
        } catch (err: any) {
            setPayErrors(prev => ({ ...prev, _submit: err?.response?.data?.message || err?.message || 'Payment failed' }))
        } finally {
            setPaySubmitting(false)
        }
    }

    const computeStats = (paymentList: Payment[]) => {
        const paid = paymentList
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0)
        const completedCount = paymentList.filter((p) => p.status === 'completed').length
        const pendingCount = paymentList.filter((p) => p.status === 'pending').length
        const failedCount = paymentList.filter((p) => p.status === 'failed').length
        setStats({ totalPaid: paid, completedCount, pendingCount, failedCount })
    }

    const loadPayments = useCallback(async () => {
        try {
            setError('')

            let paymentList: Payment[] = []

            // Try paymentService first, fallback to apiClient
            try {
                const response = await paymentService.getPayments(1, 50)
                if (response.success && response.data?.payments) {
                    paymentList = response.data.payments
                }
            } catch (serviceErr) {
                console.warn('paymentService failed, falling back to apiClient:', serviceErr)
                try {
                    const fallbackResponse = await apiClient.get<{ success: boolean; data: { payments: Payment[]; total: number } }>('/payments')
                    if (fallbackResponse?.success && fallbackResponse.data?.payments) {
                        paymentList = fallbackResponse.data.payments
                    } else if (fallbackResponse?.data?.payments) {
                        paymentList = fallbackResponse.data.payments
                    } else if (Array.isArray(fallbackResponse)) {
                        paymentList = fallbackResponse as unknown as Payment[]
                    }
                } catch (fallbackErr) {
                    console.warn('apiClient fallback also failed:', fallbackErr)
                    throw fallbackErr
                }
            }

            setPayments(paymentList)
            computeStats(paymentList)
        } catch (err: any) {
            console.warn('Error loading payments:', err)
            const message = err?.response?.data?.message || err?.message || 'Failed to load payments'
            setError(message)
            setPayments([])
            setStats({ totalPaid: 0, completedCount: 0, pendingCount: 0, failedCount: 0 })
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadPayments().finally(() => setIsLoading(false))
    }, [isAuthenticated, router, loadPayments])

    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredPayments(payments)
        } else {
            setFilteredPayments(payments.filter(p => p.status === activeFilter))
        }
    }, [payments, activeFilter])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadPayments()
        setRefreshing(false)
    }

    const handleViewPayment = (payment: Payment) => {
        setViewPayment(payment)
    }

    const handleDownloadReceipt = () => {
        alert('Receipt download coming soon')
    }

    const handleExport = () => {
        alert('Export coming soon')
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
            case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
            case 'refunded': return <AlertCircle className="w-5 h-5 text-blue-600" />
            default: return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusBadgeStyle = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700',
            refunded: 'bg-blue-100 text-blue-700'
        }
        return styles[status] || 'bg-gray-100 text-gray-700'
    }

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    const filters = [
        { key: 'all', label: 'All', count: payments.length },
        { key: 'completed', label: 'Completed', count: payments.filter(p => p.status === 'completed').length },
        { key: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
        { key: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'failed').length },
        { key: 'refunded', label: 'Refunded', count: payments.filter(p => p.status === 'refunded').length }
    ]

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-64"></div>
                        </div>
                        <div className="h-9 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-14 bg-gray-200 rounded-lg"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    // Error state with retry
    if (error && payments.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                        <p className="text-gray-600 mt-2">View your payment transactions</p>
                    </div>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <p className="text-red-700 font-medium text-lg mb-1">Failed to load payments</p>
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-600 mt-2">View your payment transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button id="btn-export-user-payments" variant="outline" size="sm" onClick={handleExport}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button id="btn-refresh-user-payments" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Colorful Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Paid - Blue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-200/60 px-2 py-1 rounded-full">lifetime</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Total Paid</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Completed - Green */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">completed</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pending - Orange */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">awaiting</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Failed - Red/Purple */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-red-50 to-purple-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-red-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                    <XCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">issues</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Failed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.failedCount}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 overflow-x-auto">
                        {filters.map((filter) => (
                            <button
                                id={`user-payments-filter-${filter.key}-btn`}
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                                    activeFilter === filter.key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {filter.label}
                                <Badge className="ml-2" variant="outline">{filter.count}</Badge>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payment List */}
            <div className="grid gap-4">
                {filteredPayments.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No payments found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {activeFilter === 'all'
                                    ? 'Your payments will appear here once you make a transaction'
                                    : `No ${activeFilter} payments found`}
                            </p>
                            {activeFilter !== 'all' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => setActiveFilter('all')}
                                >
                                    View All Payments
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredPayments.map((payment, index) => (
                        <motion.div
                            key={payment.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{payment.description || 'Payment'}</h3>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(payment.paidDate || payment.dueDate || payment.createdAt)}
                                                    </span>
                                                    <span className="text-sm text-gray-400">|</span>
                                                    <span className="text-sm text-gray-600 capitalize">
                                                        {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                                                    </span>
                                                    {payment.transactionId && (
                                                        <>
                                                            <span className="text-sm text-gray-400">|</span>
                                                            <span className="text-xs text-gray-400 font-mono">
                                                                #{payment.transactionId.slice(-8)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="text-xl font-bold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(payment.status)}
                                                <Badge className={`${getStatusBadgeStyle(payment.status)} capitalize`}>
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600"
                                                    onClick={() => handleViewPayment(payment)}
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                                    View
                                                </Button>
                                                {(payment.status === 'pending' || payment.status === 'failed') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs text-gray-600 hover:text-emerald-600"
                                                        onClick={() => openPayDrawer(payment)}
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5 mr-1" />
                                                        Pay Now
                                                    </Button>
                                                )}
                                                {payment.status === 'completed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs text-gray-600 hover:text-green-600"
                                                        onClick={handleDownloadReceipt}
                                                    >
                                                        <Download className="w-3.5 h-3.5 mr-1" />
                                                        Download Receipt
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* View Payment Drawer (read-only) */}
            <SlideInDrawer
                isOpen={!!viewPayment}
                onClose={() => setViewPayment(null)}
                title="Payment Details"
                description={viewPayment?.description || undefined}
                size="md"
                footer={
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setViewPayment(null)}>Close</Button>
                    </div>
                }
            >
                {viewPayment && (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">ID</span><span className="font-medium text-gray-900 break-all">{viewPayment.id}</span></div>
                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Amount</span><span className="font-semibold text-gray-900">{formatCurrency(viewPayment.amount)}</span></div>
                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Currency</span><span className="text-gray-900">{viewPayment.currency || 'USD'}</span></div>
                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Status</span><Badge className={`${getStatusBadgeStyle(viewPayment.status)} capitalize`}>{viewPayment.status}</Badge></div>
                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Method</span><span className="text-gray-900 capitalize">{viewPayment.paymentMethod?.replace('_', ' ') || 'N/A'}</span></div>
                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Transaction ID</span><span className="text-gray-900 break-all">{viewPayment.transactionId || 'N/A'}</span></div>
                        {viewPayment.dueDate && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Due Date</span><span className="text-gray-900">{formatDate(viewPayment.dueDate)}</span></div>}
                        {viewPayment.paidDate && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Paid Date</span><span className="text-gray-900">{formatDate(viewPayment.paidDate)}</span></div>}
                        {viewPayment.createdAt && <div className="flex justify-between py-2"><span className="text-gray-500">Created</span><span className="text-gray-900">{formatDate(viewPayment.createdAt)}</span></div>}
                    </div>
                )}
            </SlideInDrawer>

            {/* Make Payment Drawer */}
            <SlideInDrawer
                isOpen={!!payPayment}
                onClose={closePayDrawer}
                title={paySuccess ? 'Payment Submitted' : 'Make Payment'}
                description={payPayment?.description || undefined}
                size="lg"
                footer={!paySuccess ? (
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={closePayDrawer} disabled={paySubmitting}>Cancel</Button>
                        <Button
                            onClick={handleSubmitPayment}
                            disabled={paySubmitting}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                            {paySubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4 mr-2" /> Pay {formatCurrency(parseFloat(payForm.amount || '0'))}</>}
                        </Button>
                    </div>
                ) : undefined}
            >
                {paySuccess ? (
                    <div className="py-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
                        <p className="text-gray-600">Your payment is being processed.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {payErrors._submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{payErrors._submit}</div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={payForm.amount}
                                onChange={(e) => setPayForm(prev => ({ ...prev, amount: e.target.value.replace(/[^0-9.]/g, '') }))}
                                readOnly={!!payPayment?.amount}
                                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none ${payErrors.amount ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'} ${payPayment?.amount ? 'bg-gray-50' : ''}`}
                            />
                            {payErrors.amount && <p className="text-xs text-red-600 mt-1">{payErrors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                            <select
                                value={payForm.paymentMethod}
                                onChange={(e) => setPayForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none ${payErrors.paymentMethod ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                            >
                                <option value="credit_card">Credit Card</option>
                                <option value="debit_card">Debit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="wallet">Wallet Balance</option>
                            </select>
                            {payErrors.paymentMethod && <p className="text-xs text-red-600 mt-1">{payErrors.paymentMethod}</p>}
                        </div>

                        {(payForm.paymentMethod === 'credit_card' || payForm.paymentMethod === 'debit_card') && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={payForm.cardholderName}
                                        onChange={(e) => setPayForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                                        onKeyDown={filterNameInput}
                                        placeholder="As shown on card"
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none ${payErrors.cardholderName ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                                    />
                                    {payErrors.cardholderName
                                        ? <p className="text-xs text-red-600 mt-1">{payErrors.cardholderName}</p>
                                        : <p className="text-xs text-gray-500 mt-1">Only letters allowed</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={payForm.cardNumber}
                                        onChange={(e) => setPayForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                                        onKeyDown={filterCardNumberInput}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none font-mono ${payErrors.cardNumber ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                                    />
                                    {payErrors.cardNumber && <p className="text-xs text-red-600 mt-1">{payErrors.cardNumber}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={payForm.expiry}
                                            onChange={(e) => {
                                                let v = e.target.value.replace(/[^0-9]/g, '')
                                                if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
                                                setPayForm(prev => ({ ...prev, expiry: v }))
                                            }}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none font-mono ${payErrors.expiry ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                                        />
                                        {payErrors.expiry && <p className="text-xs text-red-600 mt-1">{payErrors.expiry}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV <span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            value={payForm.cvv}
                                            onChange={(e) => setPayForm(prev => ({ ...prev, cvv: e.target.value.replace(/[^0-9]/g, '') }))}
                                            placeholder="123"
                                            maxLength={4}
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none font-mono ${payErrors.cvv ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                                        />
                                        {payErrors.cvv && <p className="text-xs text-red-600 mt-1">{payErrors.cvv}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Zip Code</label>
                                    <input
                                        type="text"
                                        value={payForm.billingZip}
                                        onChange={(e) => setPayForm(prev => ({ ...prev, billingZip: e.target.value }))}
                                        placeholder="10001"
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none ${payErrors.billingZip ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                                    />
                                    {payErrors.billingZip && <p className="text-xs text-red-600 mt-1">{payErrors.billingZip}</p>}
                                </div>
                            </>
                        )}

                        {payForm.paymentMethod === 'bank_transfer' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={payForm.bankName}
                                        onChange={(e) => setPayForm(prev => ({ ...prev, bankName: e.target.value }))}
                                        placeholder="e.g. Chase"
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none ${payErrors.bankName ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'}`}
                                    />
                                    {payErrors.bankName && <p className="text-xs text-red-600 mt-1">{payErrors.bankName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits (optional)</label>
                                    <input
                                        type="text"
                                        value={payForm.accountLast4}
                                        onChange={(e) => setPayForm(prev => ({ ...prev, accountLast4: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                                        placeholder="1234"
                                        maxLength={4}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                                    />
                                </div>
                            </>
                        )}

                        {payForm.paymentMethod === 'wallet' && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
                                Your payment will be deducted from your wallet balance.
                            </div>
                        )}
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
