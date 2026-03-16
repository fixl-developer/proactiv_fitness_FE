'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CreditCard, RefreshCw, Download, CheckCircle, AlertCircle, Settings, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PaymentGateway {
    id: string
    name: string
    provider: string
    status: 'active' | 'inactive' | 'error'
    successRate: number
    totalTransactions: number
    totalVolume: number
    lastSync: Date
    fees: number
}

export default function PaymentGatewaysPage() {
    const [gateways, setGateways] = useState<PaymentGateway[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGateways()
    }, [])

    const fetchGateways = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getPaymentGateways()
            setGateways(data)
        } catch (error) {
            console.error('Error fetching gateways:', error)
            // Fallback mock data
            const mockGateways: PaymentGateway[] = [
                {
                    id: '1',
                    name: 'Stripe',
                    provider: 'Stripe Inc.',
                    status: 'active',
                    successRate: 99.9,
                    totalTransactions: 45230,
                    totalVolume: 1250000,
                    lastSync: new Date(Date.now() - 5 * 60 * 1000),
                    fees: 2.9
                },
                {
                    id: '2',
                    name: 'PayPal',
                    provider: 'PayPal Inc.',
                    status: 'active',
                    successRate: 99.5,
                    totalTransactions: 28950,
                    totalVolume: 850000,
                    lastSync: new Date(Date.now() - 10 * 60 * 1000),
                    fees: 3.49
                },
                {
                    id: '3',
                    name: 'Square',
                    provider: 'Square Inc.',
                    status: 'active',
                    successRate: 98.8,
                    totalTransactions: 12450,
                    totalVolume: 320000,
                    lastSync: new Date(Date.now() - 15 * 60 * 1000),
                    fees: 2.6
                },
                {
                    id: '4',
                    name: 'Apple Pay',
                    provider: 'Apple Inc.',
                    status: 'inactive',
                    successRate: 0,
                    totalTransactions: 0,
                    totalVolume: 0,
                    lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    fees: 0
                }
            ]
            setGateways(mockGateways)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'inactive':
                return <AlertCircle className="w-5 h-5 text-gray-600" />
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            default:
                return <CheckCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-50 border-green-200'
            case 'inactive':
                return 'bg-gray-50 border-gray-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'inactive':
                return 'bg-gray-100 text-gray-800'
            case 'error':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const activeGateways = gateways.filter(g => g.status === 'active').length
    const totalVolume = gateways.reduce((sum, g) => sum + g.totalVolume, 0)
    const totalTransactions = gateways.reduce((sum, g) => sum + g.totalTransactions, 0)
    const avgSuccessRate = (gateways.filter(g => g.status === 'active').reduce((sum, g) => sum + g.successRate, 0) / activeGateways).toFixed(1)

    const transactionTrendData = [
        { date: '2024-03-01', transactions: 1200, volume: 35000 },
        { date: '2024-03-05', transactions: 1450, volume: 42000 },
        { date: '2024-03-10', transactions: 1680, volume: 48000 },
        { date: '2024-03-15', transactions: 1920, volume: 55000 },
        { date: '2024-03-20', transactions: 2150, volume: 62000 }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <CreditCard className="w-8 h-8 mr-3 text-purple-600" />
                        Payment Gateways
                    </h1>
                    <p className="text-gray-600 mt-1">Manage payment processing integrations</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchGateways}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Gateways</p>
                            <p className="text-3xl font-bold text-blue-600">{activeGateways}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Volume</p>
                            <p className="text-3xl font-bold text-green-600">${(totalVolume / 1000000).toFixed(1)}M</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Transactions</p>
                            <p className="text-3xl font-bold text-purple-600">{(totalTransactions / 1000).toFixed(0)}K</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Success Rate</p>
                            <p className="text-3xl font-bold text-yellow-600">{avgSuccessRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Transaction Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transactionTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={2} name="Transactions" />
                            <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={2} name="Volume ($)" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Gateways List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
            >
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                    </Card>
                ) : (
                    gateways.map((gateway, index) => (
                        <motion.div
                            key={gateway.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-6 border-l-4 ${getStatusColor(gateway.status)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        {getStatusIcon(gateway.status)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{gateway.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{gateway.provider}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(gateway.status)}`}>
                                        {gateway.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Success Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{gateway.successRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Transactions</p>
                                        <p className="text-lg font-bold text-gray-900">{gateway.totalTransactions.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Volume</p>
                                        <p className="text-lg font-bold text-gray-900">${(gateway.totalVolume / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Fee Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{gateway.fees}%</p>
                                    </div>
                                </div>

                                {/* Last Sync */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Last synced: {gateway.lastSync.toLocaleTimeString()}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Sync
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    )
}
