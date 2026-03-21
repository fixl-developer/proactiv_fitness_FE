'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, Badge } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { paymentService, Payment } from '@/services/modules/payment.service'

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [stats, setStats] = useState({ totalPaid: 0, pendingAmount: 0, totalTransactions: 0 })
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const loadPayments = useCallback(async () => {
        try {
            setError('')
            const response = await paymentService.getPayments(1, 50)
            if (response.success && response.data?.payments) {
                setPayments(response.data.payments)
                // Calculate stats from real data
                const paid = response.data.payments
                    .filter((p: Payment) => p.status === 'completed')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                const pending = response.data.payments
                    .filter((p: Payment) => p.status === 'pending')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                setStats({
                    totalPaid: paid,
                    pendingAmount: pending,
                    totalTransactions: response.data.total || response.data.payments.length
                })
            } else {
                setPayments([])
            }
        } catch (err) {
            console.error('Error loading payments:', err)
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

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadPayments()
        setRefreshing(false)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />
            case 'refunded':
                return <AlertCircle className="w-5 h-5 text-blue-600" />
            default:
                return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700',
            refunded: 'bg-blue-100 text-blue-700'
        }
        return (
            <Badge className={`${styles[status] || 'bg-gray-100 text-gray-700'} capitalize`}>
                {status}
            </Badge>
        )
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>)}
                </div>
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
                <Button data-testid="btn-refresh-user-payments" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Paid</p>
                            <p className="text-xl font-bold text-green-600">HK${stats.totalPaid.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-yellow-600">HK${stats.pendingAmount.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transactions</p>
                            <p className="text-xl font-bold text-blue-600">{stats.totalTransactions}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment List */}
            <div className="grid gap-4">
                {payments.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No payment history</p>
                            <p className="text-gray-400 text-sm mt-1">Your payments will appear here</p>
                        </CardContent>
                    </Card>
                ) : (
                    payments.map((payment) => (
                        <Card key={payment.id} className="hover:shadow-md transition-shadow">
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
                                            {getStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
