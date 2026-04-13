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
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

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
                    <Button id="parent-payments-make-payment-btn" size="sm" onClick={() => alert('Payment gateway coming soon')}>
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
                            <Button id="parent-payments-export-btn" variant="outline" size="sm" onClick={() => alert('Export feature coming soon')}>
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
                                    <Button id={`parent-payments-view-${payment.id}-btn`} variant="ghost" size="sm" onClick={() => alert(`Payment Details:\n\nID: ${payment.id}\nProgram: ${payment.program}\nChild: ${payment.child}\nAmount: $${payment.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nDate: ${payment.date}\nStatus: ${payment.status}\nMethod: ${payment.method}\nInvoice: ${payment.invoice}\nDescription: ${payment.description}`)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button id={`parent-payments-receipt-${payment.id}-btn`} variant="ghost" size="sm" onClick={() => alert('Receipt download coming soon')}>
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
                        <Button id="parent-payments-quick-pay-btn" className="h-20 flex-col gap-2" variant="outline" onClick={() => alert('Payment gateway coming soon')}>
                            <Plus className="w-6 h-6" />
                            <span>Make Payment</span>
                        </Button>
                        <Button id="parent-payments-quick-receipt-btn" className="h-20 flex-col gap-2" variant="outline" onClick={() => alert('Receipt download coming soon')}>
                            <Download className="w-6 h-6" />
                            <span>Download Receipt</span>
                        </Button>
                        <Button id="parent-payments-quick-methods-btn" className="h-20 flex-col gap-2" variant="outline" onClick={() => alert('Payment methods management coming soon')}>
                            <CreditCard className="w-6 h-6" />
                            <span>Payment Methods</span>
                        </Button>
                        <Button id="parent-payments-quick-schedule-btn" className="h-20 flex-col gap-2" variant="outline" onClick={() => alert('Payment schedule coming soon')}>
                            <Calendar className="w-6 h-6" />
                            <span>Payment Schedule</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ParentPaymentsPage
