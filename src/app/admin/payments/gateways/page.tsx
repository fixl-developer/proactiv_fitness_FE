'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard, Settings, CheckCircle, XCircle, AlertTriangle,
    Plus, Edit, Eye, Trash2, RefreshCw, DollarSign, Percent,
    TrendingUp, Activity, Shield, Globe, Smartphone, Banknote
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const PaymentGatewaysPage = () => {
    const [selectedStatus, setSelectedStatus] = useState<string>('all')

    // Payment gateways data
    const paymentGateways = [
        {
            id: 1,
            name: 'Stripe',
            provider: 'Stripe Inc.',
            type: 'Credit Card',
            status: 'active',
            isDefault: true,
            logo: '💳',
            description: 'Global payment processing for credit cards and digital wallets',
            supportedMethods: ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'],
            currencies: ['HKD', 'USD', 'EUR', 'GBP'],
            transactionFee: 2.9,
            fixedFee: 2.35,
            monthlyVolume: 145600,
            monthlyTransactions: 342,
            successRate: 98.5,
            avgProcessingTime: '2-3 seconds',
            lastTransaction: '2024-01-25 14:30'
        },
        {
            id: 2,
            name: 'PayPal',
            provider: 'PayPal Holdings Inc.',
            type: 'Digital Wallet',
            status: 'active',
            isDefault: false,
            logo: '🅿️',
            description: 'Digital wallet and online payment system',
            supportedMethods: ['PayPal Balance', 'Credit Cards', 'Bank Transfer'],
            currencies: ['HKD', 'USD', 'EUR'],
            transactionFee: 3.4,
            fixedFee: 2.35,
            monthlyVolume: 67800,
            monthlyTransactions: 156,
            successRate: 96.8,
            avgProcessingTime: '5-10 seconds',
            lastTransaction: '2024-01-24 16:45'
        },
        {
            id: 3,
            name: 'Alipay HK',
            provider: 'Ant Group',
            type: 'Mobile Payment',
            status: 'testing',
            isDefault: false,
            logo: '🅰️',
            description: 'Popular mobile payment solution in Hong Kong',
            supportedMethods: ['Alipay HK Wallet', 'QR Code'],
            currencies: ['HKD'],
            transactionFee: 1.8,
            fixedFee: 0,
            monthlyVolume: 23400,
            monthlyTransactions: 89,
            successRate: 99.2,
            avgProcessingTime: '1-2 seconds',
            lastTransaction: '2024-01-25 11:20'
        },
        {
            id: 4,
            name: 'WeChat Pay',
            provider: 'Tencent',
            type: 'Mobile Payment',
            status: 'inactive',
            isDefault: false,
            logo: '💬',
            description: 'Chinese mobile payment platform',
            supportedMethods: ['WeChat Wallet', 'QR Code'],
            currencies: ['HKD', 'CNY'],
            transactionFee: 2.0,
            fixedFee: 0,
            monthlyVolume: 0,
            monthlyTransactions: 0,
            successRate: 0,
            avgProcessingTime: 'N/A',
            lastTransaction: 'Never'
        }
    ]

    // Gateway statistics
    const gatewayStats = {
        totalGateways: paymentGateways.length,
        activeGateways: paymentGateways.filter(g => g.status === 'active').length,
        totalVolume: paymentGateways.reduce((sum, g) => sum + g.monthlyVolume, 0),
        totalTransactions: paymentGateways.reduce((sum, g) => sum + g.monthlyTransactions, 0),
        avgSuccessRate: paymentGateways.filter(g => g.successRate > 0).length > 0
            ? paymentGateways.filter(g => g.successRate > 0).reduce((sum, g) => sum + g.successRate, 0) / paymentGateways.filter(g => g.successRate > 0).length
            : 0,
        avgFee: paymentGateways.length > 0
            ? paymentGateways.reduce((sum, g) => sum + g.transactionFee, 0) / paymentGateways.length
            : 0
    }

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50 border-green-200',
            inactive: 'text-red-600 bg-red-50 border-red-200',
            testing: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            maintenance: 'text-gray-600 bg-gray-50 border-gray-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />
            case 'inactive':
                return <XCircle className="w-4 h-4" />
            case 'testing':
                return <AlertTriangle className="w-4 h-4" />
            default:
                return <Settings className="w-4 h-4" />
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Credit Card':
                return <CreditCard className="w-5 h-5" />
            case 'Digital Wallet':
                return <Smartphone className="w-5 h-5" />
            case 'Mobile Payment':
                return <Smartphone className="w-5 h-5" />
            case 'Bank Transfer':
                return <Banknote className="w-5 h-5" />
            default:
                return <DollarSign className="w-5 h-5" />
        }
    }

    const filteredGateways = paymentGateways.filter(gateway => {
        return selectedStatus === 'all' || gateway.status === selectedStatus
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Gateways</h1>
                    <p className="text-gray-600 mt-2">Manage payment processing methods and configurations</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button id="admin-payments-gateways-btn" className="flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Gateway
                    </Button>
                    <Button id="admin-payments-gateways-btn-2" variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Status
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Gateways</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            {gatewayStats.activeGateways}/{gatewayStats.totalGateways}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Operational</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Monthly Volume</CardTitle>
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            HK${(gatewayStats.totalVolume / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                            {gatewayStats.totalTransactions} transactions
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                        <Activity className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            {gatewayStats.avgSuccessRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Average across all</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg. Fee</CardTitle>
                        <Percent className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            {gatewayStats.avgFee.toFixed(1)}%
                        </div>
                        <div className="text-sm text-orange-600 font-medium">Plus fixed fees</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'active', 'inactive', 'testing'].map((status) => (
                            <button id="admin-payments-gateways-btn-3"
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors capitalize ${selectedStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status} ({status === 'all' ? paymentGateways.length : paymentGateways.filter(g => g.status === status).length})
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Gateways List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredGateways.map((gateway, index) => {
                    const TypeIcon = getTypeIcon(gateway.type)
                    return (
                        <motion.div
                            key={gateway.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-2xl">{gateway.logo}</div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    {gateway.name}
                                                    {gateway.isDefault && (
                                                        <Badge className="bg-blue-100 text-blue-700 text-xs">Default</Badge>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-600">{gateway.provider}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStatusColor(gateway.status)}>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(gateway.status)}
                                                    <span className="capitalize">{gateway.status}</span>
                                                </div>
                                            </Badge>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4 text-sm">{gateway.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">TYPE</p>
                                            <div className="flex items-center gap-2">
                                                {TypeIcon}
                                                <span className="text-sm font-medium">{gateway.type}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">SUCCESS RATE</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {gateway.successRate > 0 ? `${gateway.successRate}%` : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">TRANSACTION FEE</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {gateway.transactionFee}% + HK${gateway.fixedFee}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">MONTHLY VOLUME</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                HK${(gateway.monthlyVolume / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-gray-500 mb-2">SUPPORTED METHODS</p>
                                        <div className="flex flex-wrap gap-1">
                                            {gateway.supportedMethods.slice(0, 3).map((method) => (
                                                <Badge key={method} variant="outline" className="text-xs">
                                                    {method}
                                                </Badge>
                                            ))}
                                            {gateway.supportedMethods.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{gateway.supportedMethods.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button id="admin-payments-gateways-btn-4" variant="outline" size="sm" className="flex-1">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button id="admin-payments-gateways-btn-5" variant="outline" size="sm" className="flex-1">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                        <Button id="admin-payments-gateways-btn-6" variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* No Results */}
            {filteredGateways.length === 0 && (
                <Card>
                    <CardContent className="p-8 sm:p-12 text-center">
                        <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No gateways found</h3>
                        <p className="text-gray-600 mb-4">
                            No payment gateways match the selected status filter.
                        </p>
                        <Button id="admin-payments-gateways-btn-7">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment Gateway
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default PaymentGatewaysPage
