'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, CreditCard, TrendingUp, Users, Calendar, Filter, Search, Download,
    Eye, CheckCircle, AlertTriangle, Clock, RefreshCw, ArrowUp, ArrowDown,
    MoreHorizontal, Edit, Trash2, Plus, FileText, Mail, Phone
} from 'lucide-react'
import { paymentService } from '@/services/modules/payment.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const AdminPaymentsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7d' | '30d'>('30d')
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

    const [paymentStats, setPaymentStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        completedPayments: 0,
        pendingCount: 0,
        failedCount: 0,
        averagePayment: 0,
        growthRate: 0
    })
    const [recentPayments, setRecentPayments] = useState<any[]>([])
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])

    const fetchPaymentData = async () => {
        try {
            const [paymentsRes, statsRes] = await Promise.all([
                paymentService.getPayments(1, 50, { timeRange: selectedTimeRange }),
                paymentService.getPaymentStats()
            ])

            if (statsRes) {
                setPaymentStats(statsRes)
            }

            if (paymentsRes) {
                setRecentPayments(paymentsRes.payments || paymentsRes.data || paymentsRes)
                if (paymentsRes.paymentMethods) {
                    setPaymentMethods(paymentsRes.paymentMethods)
                }
            }
        } catch (error) {
            console.error('Failed to fetch payment data:', error)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'ADMIN') {
                window.location.href = '/login'
                return
            }
        }

        fetchPaymentData()
    }, [])

    useEffect(() => {
        if (!isLoading) {
            fetchPaymentData()
        }
    }, [selectedTimeRange])

    useEffect(() => {
        if (refreshing) {
            fetchPaymentData()
        }
    }, [refreshing])

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            processing: 'bg-blue-100 text-blue-800'
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

    const filteredPayments = recentPayments.filter(payment =>
        selectedStatus === 'all' || payment.status === selectedStatus
    )

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <p className="text-gray-600">Monitor all payments and transactions</p>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg ml-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">Live</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRefreshing(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment
                    </Button>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['today', '7d', '30d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setSelectedTimeRange(range as any)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedTimeRange === range
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Metrics - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${paymentStats.totalRevenue.toLocaleString()}</div>
                            <div className="flex items-center mt-1">
                                <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                                <span className="text-sm text-green-600 font-medium">+{paymentStats.growthRate}%</span>
                            </div>
                            <Progress value={85} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Monthly Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${paymentStats.monthlyRevenue.toLocaleString()}</div>
                            <div className="flex items-center mt-1">
                                <ArrowUp className="w-4 h-4 text-blue-600 mr-1" />
                                <span className="text-sm text-blue-600 font-medium">This month</span>
                            </div>
                            <Progress value={72} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Completed Payments */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{paymentStats.completedPayments}</div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-purple-600 font-medium">Payments</span>
                            </div>
                            <Progress value={90} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pending Payments */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{paymentStats.pendingCount}</div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-yellow-600 font-medium">HK${paymentStats.pendingPayments.toLocaleString()}</span>
                            </div>
                            <Progress value={35} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Payment Methods Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {paymentMethods.map((method, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg"
                            >
                                <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">{method.method}</h3>
                                <p className="text-2xl font-bold text-blue-600 mt-2">{method.count}</p>
                                <p className="text-sm text-gray-600">HK${method.amount.toLocaleString()}</p>
                                <div className="mt-3">
                                    <Progress value={method.percentage} className="h-2" />
                                    <p className="text-xs text-gray-500 mt-1">{method.percentage}% of total</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Payments</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search payments..."
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
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
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {payment.student.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{payment.student}</h4>
                                            <Badge className={getStatusColor(payment.status)}>
                                                {payment.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{payment.program} • {payment.location}</p>
                                        <p className="text-xs text-gray-500">Parent: {payment.parent} • Coach: {payment.coach}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">HK${payment.amount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">{payment.method}</p>
                                    <p className="text-xs text-gray-500">{payment.date}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {getStatusIcon(payment.status)}
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
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
                            <span>Add Payment</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Download className="w-6 h-6" />
                            <span>Export Report</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Mail className="w-6 h-6" />
                            <span>Send Reminder</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <FileText className="w-6 h-6" />
                            <span>Generate Invoice</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminPaymentsPage
