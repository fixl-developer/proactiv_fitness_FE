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
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PaymentService from '@/services/modules/payment.service'
import BillingService from '@/services/modules/billing.service'

const ParentPaymentsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [payments, setPayments] = useState<any[]>([])
    const [paymentStats, setPaymentStats] = useState<any>({
        totalSpent: 18500,
        monthlySpent: 4200,
        pendingPayments: 1200,
        accountBalance: 2500
    })
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const parentId = user?.id || 'parent-1'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadPayments()
    }, [isAuthenticated, router, parentId])

    const loadPayments = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const paymentService = new PaymentService()
            const billingService = new BillingService()

            // Get payments
            const paymentsData = await paymentService.getPayments(parentId)
            setPayments(paymentsData || [])

            // Get billing info for stats
            const billingData = await billingService.getBillings(parentId)
            setPaymentStats({
                totalSpent: billingData?.totalAmount || 0,
                monthlySpent: billingData?.monthlyAmount || 0,
                pendingPayments: billingData?.pendingAmount || 0,
                accountBalance: billingData?.balance || 0
            })
        } catch (err) {
            console.error('Error loading payments:', err)
            setError('Failed to load payment data')
        } finally {
            setIsLoading(false)
        }
    }

    const paymentsData = [
        {
            id: 'PAY-001',
            child: 'Emma Chen',
            program: 'Beginner Gymnastics',
            amount: 1800,
            date: '2024-01-20',
            status: 'completed',
            method: 'Credit Card',
            invoice: 'INV-2024-001',
            description: 'Monthly gymnastics classes (January 2024)'
        },
        {
            id: 'PAY-002',
            child: 'Lucas Chen',
            program: 'Intermediate Gymnastics',
            amount: 2100,
            date: '2024-01-20',
            status: 'completed',
            method: 'Bank Transfer',
            invoice: 'INV-2024-002',
            description: 'Monthly gymnastics classes (January 2024)'
        },
        {
            id: 'PAY-003',
            child: 'Emma Chen',
            program: 'Private Coaching',
            amount: 800,
            date: '2024-01-25',
            status: 'pending',
            method: 'Credit Card',
            invoice: 'INV-2024-003',
            description: 'Private coaching session'
        },
        {
            id: 'PAY-004',
            child: 'Lucas Chen',
            program: 'Holiday Camp',
            amount: 1200,
            date: '2024-02-01',
            status: 'pending',
            method: 'Bank Transfer',
            invoice: 'INV-2024-004',
            description: 'February holiday camp registration'
        }
    ]

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

    const filteredPayments = paymentsData.filter(payment =>
        selectedFilter === 'all' || payment.status === selectedFilter
    )

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
                    <p className="text-gray-600 mt-2">Manage your payments and view transaction history</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Make Payment
                    </Button>
                </div>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${paymentStats.totalSpent.toLocaleString()}</div>
                            <p className="text-sm text-blue-600 font-medium">This year</p>
                            <Progress value={75} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Monthly Spent</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${paymentStats.monthlySpent.toLocaleString()}</div>
                            <p className="text-sm text-green-600 font-medium">This month</p>
                            <Progress value={60} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${paymentStats.pendingPayments.toLocaleString()}</div>
                            <p className="text-sm text-yellow-600 font-medium">Due soon</p>
                            <Progress value={40} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Account Balance</CardTitle>
                            <Wallet className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${paymentStats.accountBalance.toLocaleString()}</div>
                            <p className="text-sm text-purple-600 font-medium">Available</p>
                            <Progress value={85} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Payment History</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'completed', label: 'Completed' },
                                    { key: 'pending', label: 'Pending' },
                                    { key: 'failed', label: 'Failed' }
                                ].map((filter) => (
                                    <button
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
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredPayments.map((payment, index) => (
                            <motion.div
                                key={index}
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
                                                {payment.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{payment.child} • {payment.description}</p>
                                        <p className="text-xs text-gray-500">{payment.method} • Invoice: {payment.invoice}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">HK${payment.amount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">{payment.date}</p>
                                    <p className="text-xs text-gray-500">ID: {payment.id}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {getStatusIcon(payment.status)}
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
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
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Plus className="w-6 h-6" />
                            <span>Make Payment</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Download className="w-6 h-6" />
                            <span>Download Receipt</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <CreditCard className="w-6 h-6" />
                            <span>Payment Methods</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
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
