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
        const details = [
            `Payment Details`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `ID: ${payment.id}`,
            `Description: ${payment.description}`,
            `Amount: ${formatCurrency(payment.amount)}`,
            `Currency: ${payment.currency || 'USD'}`,
            `Status: ${payment.status.toUpperCase()}`,
            `Payment Method: ${payment.paymentMethod?.replace('_', ' ') || 'N/A'}`,
            `Transaction ID: ${payment.transactionId || 'N/A'}`,
            `Due Date: ${payment.dueDate ? formatDate(payment.dueDate) : 'N/A'}`,
            `Paid Date: ${payment.paidDate ? formatDate(payment.paidDate) : 'N/A'}`,
            `Created: ${payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}`,
        ].join('\n')
        alert(details)
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
        </div>
    )
}
