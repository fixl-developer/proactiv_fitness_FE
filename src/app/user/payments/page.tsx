'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, DollarSign, Receipt, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { paymentService, Payment } from '@/services/modules/payment.service'

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all')
    const [stats, setStats] = useState({ totalPaid: 0, pendingAmount: 0, totalTransactions: 0, failedCount: 0 })
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const loadPayments = useCallback(async () => {
        try {
            setError('')
            const response = await paymentService.getPayments(1, 50)
            if (response.success && response.data?.payments) {
                setPayments(response.data.payments)
                const paid = response.data.payments
                    .filter((p: Payment) => p.status === 'completed')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                const pending = response.data.payments
                    .filter((p: Payment) => p.status === 'pending')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                const failed = response.data.payments.filter((p: Payment) => p.status === 'failed').length
                setStats({
                    totalPaid: paid,
                    pendingAmount: pending,
                    totalTransactions: response.data.total || response.data.payments.length,
                    failedCount: failed
                })
            } else {
                setPayments([])
            }
        } catch (err) {
            console.warn('Error loading payments:', err)
            setPayments([])
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
            return new Date(dateStr).toLocaleDateString('en-HK', {
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>)}
                </div>
            </div>
        )
    }

    const statCards = [
        { title: 'Total Paid', value: `HK$${stats.totalPaid.toLocaleString()}`, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: 'completed' },
        { title: 'Pending', value: `HK$${stats.pendingAmount.toLocaleString()}`, icon: Clock, gradient: 'from-amber-500 to-yellow-600', bgGradient: 'from-amber-50 to-yellow-100', change: 'awaiting' },
        { title: 'Transactions', value: stats.totalTransactions, icon: Receipt, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: 'total' },
        { title: 'Failed', value: stats.failedCount, icon: XCircle, gradient: 'from-red-500 to-rose-600', bgGradient: 'from-red-50 to-rose-100', change: 'issues' }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-600 mt-2">View your payment transactions</p>
                </div>
                <Button id="btn-refresh-user-payments" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Colorful Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-full">
                                        {metric.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 overflow-x-auto">
                        {filters.map((filter) => (
                            <button id={`user-payments-filter-${filter.key}-btn`}
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key as any)}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeFilter === filter.key
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
                            <p className="text-gray-500 font-medium">No payment history</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {activeFilter === 'all' ? 'Your payments will appear here' : `No ${activeFilter} payments`}
                            </p>
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
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{payment.description}</h3>
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
                                                {payment.currency === 'HKD' ? 'HK$' : payment.currency || 'HK$'}
                                                {payment.amount.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(payment.status)}
                                                <Badge className={`${getStatusBadgeStyle(payment.status)} capitalize`}>
                                                    {payment.status}
                                                </Badge>
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
